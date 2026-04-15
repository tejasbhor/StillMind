import asyncio
import uuid
import structlog
from app.core.database import Base, AsyncSessionLocal, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile
from sqlalchemy import select

log = structlog.get_logger()

async def seed_data():
    log.info("Starting database seed...")
    
    async with AsyncSessionLocal() as db:
        # Create an admin
        admin_id = str(uuid.uuid4())
        admin = User(
            id=admin_id,
            email="admin@stillmind.edu",
            password_hash=hash_password("admin123"),
            role="admin",
            first_name="System",
            last_name="Admin",
            is_active=True
        )
        db.add(admin)
        
        # Create a counselor
        counselor_id = str(uuid.uuid4())
        counselor = User(
            id=counselor_id,
            email="counselor@stillmind.edu",
            password_hash=hash_password("counselor123"),
            role="counselor",
            first_name="Jane",
            last_name="Doe",
            is_active=True
        )
        db.add(counselor)
        
        c_profile = CounselorProfile(
            student_id=counselor_id,
            department="Mental Health Services",
            specializations=["Anxiety", "Depression", "Academic Stress"],
            max_active_cases=15,
            current_active_cases=0
        )
        db.add(c_profile)

        # Create a student
        student_id = str(uuid.uuid4())
        student = User(
            id=student_id,
            email="student@stillmind.edu",
            password_hash=hash_password("student123"),
            role="student",
            first_name="John",
            last_name="Smith",
            is_active=True
        )
        db.add(student)
        
        s_profile = StudentProfile(
            student_id=student_id,
            date_of_birth="2000-01-01",
            major="Computer Science",
            year_of_study=3,
            emergency_contact_name="Mary Smith",
            emergency_contact_phone="555-0199",
            consent_given=True
        )
        db.add(s_profile)
        
        await db.commit()
        log.info("Seed complete! Users created: admin@, counselor@, student@ (all pass: ***123)")

if __name__ == "__main__":
    asyncio.run(seed_data())
