import aiosmtplib
from email.message import EmailMessage
import structlog
from app.core.config import settings

log = structlog.get_logger(__name__)

async def send_email(to_email: str, subject: str, content: str):
    """
    Sends an email asynchronously using aiosmtplib.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        log.warning("smtp_credentials_missing", to=to_email)
        return
        
    msg = EmailMessage()
    msg.set_content(content)
    msg['Subject'] = subject
    msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg['To'] = to_email

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_TLS,
            starttls=not settings.SMTP_USE_TLS and settings.SMTP_PORT == 587
        )
        log.info("email_sent", to=to_email, subject=subject)
    except Exception as e:
        log.error("email_send_failed", error=str(e), to=to_email)

async def dispatch_notification(user_id: str, email: str, template: str, context: dict):
    """
    Dispatcher mapping logical templates to actual email content.
    """
    if template == "T_48_REMINDER":
        subject = "StillMind: Upcoming Appointment Reminder"
        content = f"Hello,\nYou have a counseling appointment confirmed for {context.get('time')}. Please login to StillMind to manage your session.\n- StillMind Support"
    elif template == "T_24_CONFIRM_REQ":
        subject = "StillMind: Please Confirm Your Appointment"
        content = f"Hello,\nYour appointment for {context.get('time')} requires confirmation. If not confirmed, it will be automatically released.\n- StillMind Support"
    else:
        subject = "StillMind Notification"
        content = str(context)

    # In a full system, we might insert an DB Notification record here too.
    await send_email(email, subject, content)
