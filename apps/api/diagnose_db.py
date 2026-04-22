
import asyncio
from sqlalchemy import select, func, and_, or_, desc
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.risk_log import RiskLog
from app.models.allocation import Allocation
from app.models.counselor_profile import CounselorProfile

async def diagnose():
    async with AsyncSessionLocal() as db:
        print("Checking student count...")
        res = await db.execute(select(func.count(StudentProfile.id)))
        print(f"Total students: {res.scalar()}")
        
        print("Checking organizations...")
        res = await db.execute(select(User.organization_id).distinct())
        orgs = [r[0] for r in res.all()]
        print(f"Organizations: {orgs}")
        
        if not orgs:
            print("No organizations found.")
            return

        org_id = orgs[0]
        print(f"Testing list_students for org: {org_id}")
        
        try:
            # Replicating the logic from router.py
            rn_risk = func.row_number().over(
                partition_by=RiskLog.student_id,
                order_by=RiskLog.created_at.desc(),
            ).label("rn_risk")

            risk_ranked = (
                select(RiskLog.student_id, RiskLog.risk_level, RiskLog.cri_score, rn_risk).where(
                    RiskLog.student_id.in_(
                        select(StudentProfile.id)
                        .join(User, StudentProfile.user_id == User.id)
                        .where(User.organization_id == org_id)
                    )
                )
            ).subquery()

            risk_sq = (
                select(
                    risk_ranked.c.student_id,
                    risk_ranked.c.risk_level,
                    risk_ranked.c.cri_score,
                ).where(risk_ranked.c.rn_risk == 1)
            ).subquery()

            stmt = (
                select(
                    StudentProfile,
                    User.email,
                    risk_sq.c.risk_level,
                    risk_sq.c.cri_score,
                )
                .join(User, StudentProfile.user_id == User.id)
                .outerjoin(risk_sq, StudentProfile.id == risk_sq.c.student_id)
                .where(User.organization_id == org_id)
                .limit(10)
            )
            
            result = await db.execute(stmt)
            rows = result.all()
            print(f"Successfully fetched {len(rows)} students")
            for p, email, rl, cri in rows:
                print(f" - {p.full_name} ({email}): Risk={rl}, CRI={cri}")

        except Exception as e:
            print(f"ERROR in list_students query: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(diagnose())
