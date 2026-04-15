import smtplib
from email.message import EmailMessage
import os
import asyncio
import structlog
from concurrent.futures import ThreadPoolExecutor

log = structlog.get_logger(__name__)

# Basic SMTP implementation based on .env
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "")

_executor = ThreadPoolExecutor(max_workers=3)

def _send_email_sync(to_email: str, subject: str, content: str):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        log.warning("smtp_credentials_missing", to=to_email)
        return
        
    msg = EmailMessage()
    msg.set_content(content)
    msg['Subject'] = subject
    msg['From'] = SMTP_FROM
    msg['To'] = to_email

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        log.info("email_sent", to=to_email, subject=subject)
    except Exception as e:
        log.error("email_send_failed", error=str(e), to=to_email)

async def send_email(to_email: str, subject: str, content: str):
    """
    Sends an email asynchronously without blocking the main event loop.
    """
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(_executor, _send_email_sync, to_email, subject, content)

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
