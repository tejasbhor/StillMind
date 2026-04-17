import asyncio
import uuid
import structlog
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from app.core.database import Base, AsyncSessionLocal, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile
from app.models.allocation import Allocation
from app.models.assessment import Assessment
from app.models.chat_message import ChatMessage

log = structlog.get_logger()

async def seed_data():
    log.info("Starting comprehensive database seed...")
    
    async with AsyncSessionLocal() as db:
        # Clear existing data to ensure idempotency
        await db.execute(delete(ChatMessage))
        await db.execute(delete(Allocation))
        await db.execute(delete(Assessment))
        await db.execute(delete(StudentProfile))
        await db.execute(delete(CounselorProfile))
        await db.execute(delete(User))
        await db.flush()
        
        # 1. Create ALL User accounts
        admin_id = str(uuid.uuid4())
        admin = User(
            id=admin_id,
            email="admin@stillmind.edu",
            password_hash=hash_password("admin123"),
            role="admin",
            status="ACTIVE"
        )
        
        counselor_id = str(uuid.uuid4())
        counselor = User(
            id=counselor_id,
            email="counselor@stillmind.edu",
            password_hash=hash_password("counselor123"),
            role="counselor",
            status="ACTIVE"
        )
        
        student_id = str(uuid.uuid4())
        student = User(
            id=student_id,
            email="student@stillmind.edu",
            password_hash=hash_password("student123"),
            role="student",
            status="ACTIVE"
        )
        
        db.add(admin)
        db.add(counselor)
        db.add(student)
        await db.flush()

        # 2. Create Profiles
        c_profile_id = str(uuid.uuid4())
        c_profile = CounselorProfile(
            id=c_profile_id,
            user_id=counselor_id,
            full_name="Dr. Meera Rao",
            max_slots_day=15,
            is_active=True
        )
        db.add(c_profile)

        s_profile_id = str(uuid.uuid4())
        s_profile = StudentProfile(
            id=s_profile_id,
            user_id=student_id,
            full_name="John Smith",
            college_id="STU001",
            phone="555-0199",
            consent_flag=True,
            profile_status="ACTIVE"
        )
        db.add(s_profile)
        await db.flush()

        # 3. Create Assessment
        assessment = Assessment(
            id=str(uuid.uuid4()),
            student_id=s_profile_id,
            assessment_type="INITIAL",
            phq9_scores={"q1": 1, "q2": 1, "q3": 2, "q4": 1, "q5": 1, "q6": 2, "q7": 2, "q8": 1, "q9": 1},
            phq9_total=12,
            gad7_scores={"q1": 2, "q2": 2, "q3": 1, "q4": 1, "q5": 1, "q6": 1, "q7": 0},
            gad7_total=8,
            q9_flag=False,
            sleep_score=3,
            academic_stress_score=4,
            social_isolation_level="MEDIUM",
            risk_processing_status="DONE"
        )
        db.add(assessment)

        # 4. Create Allocation (Appointment)
        allocation_id = str(uuid.uuid4())
        allocation = Allocation(
            id=allocation_id,
            student_id=s_profile_id,
            counselor_id=c_profile_id,
            priority_score=0.7500,
            slot_time=datetime.now() + timedelta(days=1),
            status="ASSIGNED",
            reason_summary="Moderate depression and high academic stress."
        )
        db.add(allocation)
        await db.flush()

        # 5. Create some Chat Messages
        msg1 = ChatMessage(
            id=str(uuid.uuid4()),
            allocation_id=allocation_id,
            sender_id=counselor_id,
            content="Hello John, I've reviewed your initial assessment. How are you feeling today?"
        )
        msg2 = ChatMessage(
            id=str(uuid.uuid4()),
            allocation_id=allocation_id,
            sender_id=student_id,
            content="I've been feeling a bit overwhelmed with the upcoming exams."
        )
        db.add(msg1)
        db.add(msg2)

        # 3. Final Commit
        await db.commit()
        log.info("Comprehensive seed complete!")
        log.info(f"Student: student@stillmind.edu / student123")
        log.info(f"Counselor: counselor@stillmind.edu / counselor123")
        log.info(f"Admin: admin@stillmind.edu / admin123")

if __name__ == "__main__":
    asyncio.run(seed_data())
