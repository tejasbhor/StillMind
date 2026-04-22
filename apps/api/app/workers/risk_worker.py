import uuid
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.assessment import Assessment
from app.models.risk_log import RiskLog
from app.models.student_profile import StudentProfile
from app.models.admin_config import AdminConfig
from app.modules.risk_engine.engine import calculate_cri, determine_risk_level, generate_reasoning, normalize_behavioral
from app.modules.risk_engine.trend import compute_trend
from app.services.audit_service import audit

log = structlog.get_logger(__name__)

async def compute_risk_job(ctx, assessment_id: str):
    """
    ARQ worker job triggered after assessment submission.
    Computes CRI, risk level, generates reasoning, logs to RiskLog.
    """
    log.info("compute_risk_job_started", assessment_id=assessment_id)
    
    async with AsyncSessionLocal() as db:
        try:
            # 1. Fetch assessment
            result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
            assessment = result.scalar_one_or_none()
            if not assessment:
                log.error("assessment_not_found", assessment_id=assessment_id)
                return
            
            if assessment.risk_processing_status == "DONE":
                return
                
            # 2. Get previous risk log to compute trend
            prev_result = await db.execute(
                select(RiskLog)
                .where(RiskLog.student_id == assessment.student_id)
                .order_by(RiskLog.created_at.desc())
                .limit(1)
            )
            prev_log = prev_result.scalar_one_or_none()
            prev_cri = float(prev_log.cri_score) if prev_log else None
            
            # 3. Fetch Configs
            config_res = await db.execute(select(AdminConfig))
            configs = {c.config_key: c.config_value for c in config_res.scalars().all()}
            
            risk_cfg = configs.get("risk_thresholds", {})
            # Handle nested structure if saved by Admin UI, or flat if default
            thresholds = risk_cfg.get("risk_thresholds") if "risk_thresholds" in risk_cfg else risk_cfg
            overrides = risk_cfg.get("override_rules", {})
            
            # Use system_settings for weights if not in specific risk_engine config (currently we use a default dict or settings)
            # Actually, let's use the one in settings as base and override if we add it to AdminConfig later.
            from app.core.config import settings
            weights = settings.RISK_CRI_WEIGHTS

            # 4. Core Engine computations
            behavioral_score = normalize_behavioral(
                sleep=assessment.sleep_score,
                stress=assessment.academic_stress_score,
                isolation=assessment.social_isolation_level
            )
            
            cri = calculate_cri(
                assessment.phq9_total, 
                assessment.gad7_total, 
                behavioral_score,
                weights=weights
            )
            
            risk_level = determine_risk_level(
                cri=cri, 
                phq9_q9=assessment.q9_flag, 
                sleep=assessment.sleep_score, 
                stress=assessment.academic_stress_score,
                thresholds=thresholds,
                overrides=overrides
            )
            
            reasons = generate_reasoning(
                cri=cri,
                phq9_total=assessment.phq9_total,
                phq9_q9=int(assessment.q9_flag),
                sleep=assessment.sleep_score,
                stress=assessment.academic_stress_score,
                isolation=assessment.social_isolation_level
            )
            
            trend = "STABLE"
            if prev_cri is not None:
                trend = compute_trend(prev_cri, cri)
            
            # 4. Save immutable RiskLog
            risk_log = RiskLog(
                id=str(uuid.uuid4()),
                student_id=assessment.student_id,
                assessment_id=assessment.id,
                cri_score=cri,
                risk_level=risk_level,
                reasoning=reasons,
                trend=trend,
                trigger="ASSESSMENT_SUBMITTED" if assessment.assessment_type == "INITIAL" else "PERIODIC_RECOMPUTE"
            )
            
            db.add(risk_log)
            
            # 5. Update Assessment status
            assessment.risk_processing_status = "DONE"
            
            # 6. Audit logic
            await audit.log(
                db, 
                action="RISK_COMPUTED", 
                resource_type="risk_log", 
                resource_id=risk_log.id,
                metadata={"risk_level": risk_level, "trend": trend}
            )
            
            # Expedite triage for high-risk students by running allocation cycle.
            if risk_level == "RED":
                redis = ctx.get("redis") if isinstance(ctx, dict) else None
                if redis:
                    await redis.enqueue_job("run_allocation_cycle")
                    log.info(
                        "compute_risk_job_allocation_enqueued",
                        assessment_id=assessment_id,
                        student_id=assessment.student_id,
                    )
                else:
                    log.warning(
                        "compute_risk_job_no_redis_ctx",
                        assessment_id=assessment_id,
                        student_id=assessment.student_id,
                    )
            
            await db.commit()
            log.info("compute_risk_job_completed", assessment_id=assessment_id, risk_level=risk_level)
            
        except Exception as exc:
            log.error("compute_risk_job_failed", assessment_id=assessment_id, error=str(exc))
            await db.rollback()
            raise
