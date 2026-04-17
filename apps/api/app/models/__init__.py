"""
All SQLAlchemy models imported here for Alembic auto-detection.
"""

from app.models.user import User  # noqa: F401
from app.models.student_profile import StudentProfile  # noqa: F401
from app.models.counselor_profile import CounselorProfile  # noqa: F401
from app.models.assessment import Assessment  # noqa: F401
from app.models.risk_log import RiskLog  # noqa: F401
from app.models.allocation import Allocation  # noqa: F401
from app.models.session import Session  # noqa: F401
from app.models.session_note import SessionNote  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.chat_message import ChatMessage  # noqa: F401
from app.models.admin_config import AdminConfig, DEFAULT_CONFIGS  # noqa: F401
