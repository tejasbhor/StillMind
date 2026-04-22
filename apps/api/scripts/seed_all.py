"""
Comprehensive dev seed — wipes transactional data and recreates demo users,
profiles, assessment, risk log, allocation, and chat (conversation + messages).

Run from `apps/api` with the venv active:
  python -m scripts.seed_all

Requires DB migrations applied (tables exist).
"""
import asyncio
import uuid
import structlog
from datetime import datetime, timedelta, timezone
from sqlalchemy import delete, select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password

from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile
from app.models.allocation import Allocation
from app.models.assessment import Assessment
from app.models.risk_log import RiskLog
from app.models.chat_message import ChatMessage
from app.models.chat_conversation import ChatConversation, ChatConversationParticipant
from app.models.session_note import SessionNote
from app.models.session import Session
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.organization import Organization

log = structlog.get_logger()


async def _clear_tables(db) -> None:
    """Delete in FK-safe order (children before parents) if tables exist."""
    tables = [
        SessionNote, Session, ChatMessage, ChatConversationParticipant,
        ChatConversation, RiskLog, Notification, AuditLog, Allocation,
        Assessment, StudentProfile, CounselorProfile, User
    ]
    
    for table in tables:
        async with db.begin_nested():
            try:
                await db.execute(delete(table))
            except Exception as e:
                # Skip if table doesn't exist yet (UndefinedTable)
                if "does not exist" in str(e).lower():
                    log.debug("skipping_clear_table_missing", table=table.__tablename__)
                else:
                    raise e
    await db.flush()


async def seed_data() -> None:
    log.info("starting_database_seed")

    async with AsyncSessionLocal() as db:
        await _clear_tables(db)

        org_row = await db.execute(select(Organization).where(Organization.slug == "mssu"))
        org = org_row.scalar_one_or_none()
        if not org:
            org = Organization(
                id=str(uuid.uuid4()),
                name="Ratan Maharashtra State Skills University",
                slug="mssu",
                domain="mssu.ac.in",
                contact_email="admin@mssu.ac.in",
                settings={"theme": "institutional"},
            )
            db.add(org)
            await db.flush()

        org_id = org.id

        # --- Users (passwords are Argon2 via hash_password) ---
        admin_id = str(uuid.uuid4())
        counselor_id = str(uuid.uuid4())
        student_id = str(uuid.uuid4())
        student2_id = str(uuid.uuid4())

        db.add_all(
            [
                User(
                    id=admin_id,
                    organization_id=org_id,
                    email="tejas.bhor@mssu.ac.in",
                    full_name="Tejas Bhor",
                    password_hash=hash_password("admin123"),
                    role="admin",
                    status="ACTIVE",
                ),
                User(
                    id=counselor_id,
                    organization_id=org_id,
                    email="meera.rao@mssu.ac.in",
                    full_name="Dr. Meera Rao",
                    password_hash=hash_password("counselor123"),
                    role="counselor",
                    status="ACTIVE",
                ),
                User(
                    id=student_id,
                    organization_id=org_id,
                    email="2023000051@mssu.ac.in",
                    full_name="John Smith",
                    password_hash=hash_password("student123"),
                    role="student",
                    status="ACTIVE",
                ),
                User(
                    id=student2_id,
                    organization_id=org_id,
                    email="2023000052@mssu.ac.in",
                    full_name="Jane Doe",
                    password_hash=hash_password("student123"),
                    role="student",
                    status="ACTIVE",
                ),
            ]
        )
        await db.flush()

        c_profile_id = str(uuid.uuid4())
        db.add(
            CounselorProfile(
                id=c_profile_id,
                user_id=counselor_id,
                full_name="Dr. Meera Rao",
                max_slots_day=15,
                max_active_cases=15,
                is_active=True,
            )
        )

        s_profile_id = str(uuid.uuid4())
        s2_profile_id = str(uuid.uuid4())
        db.add_all(
            [
                StudentProfile(
                    id=s_profile_id,
                    user_id=student_id,
                    full_name="John Smith",
                    college_id="STU001",
                    phone="555-0199",
                    consent_flag=True,
                    profile_status="ACTIVE",
                ),
                StudentProfile(
                    id=s2_profile_id,
                    user_id=student2_id,
                    full_name="Alex Rivera",
                    college_id="STU002",
                    phone="555-0198",
                    consent_flag=True,
                    profile_status="ACTIVE",
                ),
            ]
        )
        await db.flush()

        assessment_id = str(uuid.uuid4())
        assessment2_id = str(uuid.uuid4())
        db.add_all(
            [
                Assessment(
                    id=assessment_id,
                    student_id=s_profile_id,
                    assessment_type="INITIAL",
                    phq9_scores={
                        "q1": 1,
                        "q2": 1,
                        "q3": 2,
                        "q4": 1,
                        "q5": 1,
                        "q6": 2,
                        "q7": 2,
                        "q8": 1,
                        "q9": 1,
                    },
                    phq9_total=12,
                    gad7_scores={"q1": 2, "q2": 2, "q3": 1, "q4": 1, "q5": 1, "q6": 1, "q7": 0},
                    gad7_total=8,
                    q9_flag=False,
                    sleep_score=3,
                    academic_stress_score=4,
                    social_isolation_level="MEDIUM",
                    risk_processing_status="DONE",
                ),
                Assessment(
                    id=assessment2_id,
                    student_id=s2_profile_id,
                    assessment_type="INITIAL",
                    phq9_scores={
                        "q1": 3,
                        "q2": 3,
                        "q3": 3,
                        "q4": 2,
                        "q5": 2,
                        "q6": 2,
                        "q7": 2,
                        "q8": 2,
                        "q9": 1,
                    },
                    phq9_total=18,
                    gad7_scores={"q1": 3, "q2": 3, "q3": 2, "q4": 2, "q5": 2, "q6": 2, "q7": 1},
                    gad7_total=15,
                    q9_flag=True,
                    sleep_score=2,
                    academic_stress_score=5,
                    social_isolation_level="HIGH",
                    risk_processing_status="DONE",
                ),
            ]
        )
        await db.flush()

        # Risk logs (latest risk per student for priority queue / dashboards)
        db.add_all(
            [
                RiskLog(
                    id=str(uuid.uuid4()),
                    student_id=s_profile_id,
                    assessment_id=assessment_id,
                    cri_score=0.62,
                    risk_level="YELLOW",
                    reasoning=["Elevated PHQ-9", "Academic stress", "Sleep disturbance"],
                    trend="STABLE",
                    trigger="ASSESSMENT_SUBMITTED",
                ),
                RiskLog(
                    id=str(uuid.uuid4()),
                    student_id=s2_profile_id,
                    assessment_id=assessment2_id,
                    cri_score=0.88,
                    risk_level="RED",
                    reasoning=["Severe depression score", "Positive Q9 safety screen", "High GAD-7"],
                    trend="WORSENING",
                    trigger="ASSESSMENT_SUBMITTED",
                ),
            ]
        )
        await db.flush()

        allocation_id = str(uuid.uuid4())
        allocation2_id = str(uuid.uuid4())
        db.add_all(
            [
                Allocation(
                    id=allocation_id,
                    student_id=s_profile_id,
                    counselor_id=c_profile_id,
                    priority_score=0.7500,
                    slot_time=datetime.now(tz=timezone.utc) + timedelta(days=1),
                    status="ASSIGNED",
                    reason_summary="Moderate depression and high academic stress.",
                ),
                Allocation(
                    id=allocation2_id,
                    student_id=s2_profile_id,
                    counselor_id=c_profile_id,
                    priority_score=0.9100,
                    slot_time=datetime.now(tz=timezone.utc) + timedelta(days=2),
                    status="CONFIRMED",
                    reason_summary="High risk - requires urgent follow-up.",
                ),
            ]
        )
        await db.flush()

        # Chat: conversation + participants + messages (required conversation_id)
        conv_id = str(uuid.uuid4())
        db.add(
            ChatConversation(
                id=conv_id,
                kind="DIRECT",
                status="ACTIVE",
                allocation_id=allocation_id,
                created_by_user_id=counselor_id,
            )
        )
        db.add_all(
            [
                ChatConversationParticipant(
                    id=str(uuid.uuid4()),
                    conversation_id=conv_id,
                    user_id=counselor_id,
                    role="counselor",
                ),
                ChatConversationParticipant(
                    id=str(uuid.uuid4()),
                    conversation_id=conv_id,
                    user_id=student_id,
                    role="student",
                ),
            ]
        )
        await db.flush()

        db.add_all(
            [
                ChatMessage(
                    id=str(uuid.uuid4()),
                    conversation_id=conv_id,
                    allocation_id=allocation_id,
                    sender_id=counselor_id,
                    content="Hello John, I've reviewed your initial assessment. How are you feeling today?",
                ),
                ChatMessage(
                    id=str(uuid.uuid4()),
                    conversation_id=conv_id,
                    allocation_id=allocation_id,
                    sender_id=student_id,
                    content="I've been feeling a bit overwhelmed with the upcoming exams.",
                ),
            ]
        )

        await db.commit()

        # RBAC permissions/roles are seeded on API startup (`main.py` lifespan).
        log.info("seed_complete")
        log.info("accounts", email="tejas.bhor@mssu.ac.in", password="admin123")
        log.info("accounts", email="meera.rao@mssu.ac.in", password="counselor123")
        log.info("accounts", email="2023000051@mssu.ac.in", password="student123")
        log.info("accounts", email="2023000052@mssu.ac.in", password="student123")


if __name__ == "__main__":
    asyncio.run(seed_data())
