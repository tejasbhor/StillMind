import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.assessment import Assessment
from app.modules.assessment.schemas import AssessmentCreate
from app.services.audit_service import audit

from arq import create_pool
from app.workers.settings import arq_redis_settings

async def enqueue_risk_computation(db: AsyncSession, assessment_id: str, student_id: str):
    # Fire and forget async compute risk job
    redis = await create_pool(arq_redis_settings)
    await redis.enqueue_job("compute_risk_job", assessment_id)
    await redis.close()

class AssessmentService:
    async def submit_assessment(self, db: AsyncSession, student_id: str, req: AssessmentCreate, assessment_type: str = "INITIAL") -> dict:
        # Validate inputs precisely
        for i in range(1, 10):
            val = req.phq9.get(f"q{i}")
            if val is None or not (0 <= val <= 3):
                raise HTTPException(status_code=422, detail="INVALID_PHQ9_RANGE")

        for i in range(1, 8):
            val = req.gad7.get(f"q{i}")
            if val is None or not (0 <= val <= 3):
                raise HTTPException(status_code=422, detail="INVALID_GAD7_RANGE")
                
        if req.social_isolation_level not in ["LOW", "MEDIUM", "HIGH"]:
            raise HTTPException(status_code=422, detail="INVALID_ISOLATION_LEVEL")

        phq9_total = sum(req.phq9[f"q{i}"] for i in range(1, 10))
        gad7_total = sum(req.gad7[f"q{i}"] for i in range(1, 8))
        q9_flag = req.phq9.get("q9", 0) >= 1

        assessment = Assessment(
            id=str(uuid.uuid4()),
            student_id=student_id,
            assessment_type=assessment_type,
            phq9_scores=req.phq9,
            phq9_total=phq9_total,
            gad7_scores=req.gad7,
            gad7_total=gad7_total,
            q9_flag=q9_flag,
            sleep_score=req.sleep_score,
            academic_stress_score=req.academic_stress_score,
            social_isolation_level=req.social_isolation_level,
            risk_processing_status="PENDING"
        )
        
        db.add(assessment)
        await audit.log(db, action="ASSESSMENT_SUBMITTED", actor_id=student_id, actor_role="student", resource_id=assessment.id)
        await db.commit()
        await db.refresh(assessment)
        
        # Enqueue background job (fire-and-forget in prod, but inline for now? We use ARQ)
        import asyncio
        asyncio.create_task(enqueue_risk_computation(db, assessment.id, student_id))
        
        return assessment
        
    async def list_assessments(self, db: AsyncSession, student_id: str):
        result = await db.execute(select(Assessment).where(Assessment.student_id == student_id).order_by(Assessment.created_at.desc()))
        return list(result.scalars().all())
