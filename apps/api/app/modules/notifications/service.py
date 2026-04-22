import os
import aiosmtplib
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader, select_autoescape
import structlog
from datetime import datetime
from app.core.config import settings

log = structlog.get_logger(__name__)

# Initialize Jinja2 environment
_templates_dir = os.path.join(os.path.dirname(__file__), "..", "..", "templates", "emails")
_jinja_env = Environment(
    loader=FileSystemLoader(_templates_dir),
    autoescape=select_autoescape(['html', 'xml']),
    trim_blocks=True,
    lstrip_blocks=True
)


def _html_to_plain_text(html: str) -> str:
    """Convert HTML to plain text for fallback."""
    import re
    # Remove script and style elements
    text = re.sub(r'<(script|style)[^>]*>[^<]*</\1>', '', html, flags=re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&quot;', '"').replace('&#39;', "'")
    # Normalize whitespace
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()


async def send_email(
    to_email: str,
    subject: str,
    content: str = None,
    html_content: str = None,
    template: str = None,
    template_context: dict = None,
    from_name: str = None,
    from_email: str = None
):
    """
    Sends an email asynchronously using aiosmtplib.
    
    Supports:
    - Plain text only (legacy mode)
    - HTML with auto-generated plain text
    - Jinja2 templates
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        content: Plain text content (legacy)
        html_content: HTML content directly
        template: Template name (e.g., 'verification_code')
        template_context: Variables for template rendering
        from_name: Override sender name
        from_email: Override sender email
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        log.warning("smtp_credentials_missing", to=to_email)
        return
    
    # Render template if provided
    if template:
        context = {
            "subject": subject,
            "frontend_url": settings.FRONTEND_URL,
            "year": datetime.now().year,
            **(template_context or {})
        }
        try:
            template_obj = _jinja_env.get_template(f"{template}.html")
            html_content = template_obj.render(**context)
        except Exception as e:
            log.error("template_render_failed", template=template, error=str(e))
            # Fall back to plain text if template fails
            html_content = None
    
    # Build message
    sender_name = from_name or settings.SMTP_FROM_NAME
    sender_email = from_email or settings.SMTP_FROM_EMAIL
    
    if html_content:
        # Multi-part message with HTML
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{sender_name} <{sender_email}>"
        msg['To'] = to_email
        
        # Plain text part (auto-generated or provided)
        plain_text = content or _html_to_plain_text(html_content)
        msg.attach(MIMEText(plain_text, 'plain', 'utf-8'))
        
        # HTML part
        msg.attach(MIMEText(html_content, 'html', 'utf-8'))
    else:
        # Plain text only (legacy mode)
        msg = EmailMessage()
        msg.set_content(content or "")
        msg['Subject'] = subject
        msg['From'] = f"{sender_name} <{sender_email}>"
        msg['To'] = to_email
    
    try:
        # Smart TLS handling based on port
        # Port 465: Implicit TLS (use_tls=True)
        # Port 587: Explicit TLS (start_tls=True)
        smtp_kwargs = {
            "hostname": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "username": settings.SMTP_USERNAME,
            "password": settings.SMTP_PASSWORD,
        }
        
        if settings.SMTP_PORT == 465:
            smtp_kwargs["use_tls"] = True
        elif settings.SMTP_PORT == 587:
            smtp_kwargs["start_tls"] = True
        
        await aiosmtplib.send(msg, **smtp_kwargs)
        log.info("email_sent", to=to_email, subject=subject, template=template)
    except Exception as e:
        log.error("email_send_failed", error=str(e), to=to_email, subject=subject)


async def send_templated_email(
    to_email: str,
    template: str,
    subject: str,
    context: dict = None
):
    """
    Send a templated email using Jinja2.
    
    Args:
        to_email: Recipient email
        template: Template name without .html extension
        subject: Email subject
        context: Template variables
    """
    await send_email(
        to_email=to_email,
        subject=subject,
        template=template,
        template_context=context
    )


# ─── Pre-built email dispatchers ───────────────────────────────────────────

async def send_verification_code(to_email: str, code: str, name: str = None, expires_minutes: int = 15):
    """Send email verification code."""
    await send_templated_email(
        to_email=to_email,
        template="verification_code",
        subject="StillMind: Your Verification Code",
        context={
            "code": code,
            "name": name or to_email.split('@')[0],
            "expires_minutes": expires_minutes
        }
    )


async def send_login_code(to_email: str, code: str, name: str, expires_minutes: int = 10):
    """Dispatch a login verification code email."""
    await send_templated_email(
        to_email=to_email,
        subject="StillMind Login Verification Code",
        template="login_verification",
        context={
            "code": code,
            "name": name,
            "expires_minutes": expires_minutes,
        }
    )


async def send_password_reset(to_email: str, reset_url: str, name: str, expires_hours: int = 1):
    """Send password reset email."""
    await send_templated_email(
        to_email=to_email,
        template="password_reset",
        subject="StillMind: Reset Your Password",
        context={
            "reset_url": reset_url,
            "name": name or to_email.split('@')[0],
            "expires_hours": expires_hours
        }
    )


async def send_appointment_reminder(
    to_email: str,
    appointment_time: str,
    name: str = None,
    counselor_name: str = None,
    dashboard_url: str = None
):
    """Send appointment reminder."""
    await send_templated_email(
        to_email=to_email,
        template="appointment_reminder",
        subject="StillMind: Upcoming Appointment Reminder",
        context={
            "appointment_time": appointment_time,
            "name": name or to_email.split('@')[0],
            "counselor_name": counselor_name,
            "dashboard_url": dashboard_url or f"{settings.FRONTEND_URL}/dashboard"
        }
    )


async def send_appointment_confirmation_required(
    to_email: str,
    appointment_time: str,
    name: str = None,
    counselor_name: str = None,
    confirm_url: str = None
):
    """Send appointment confirmation request."""
    await send_templated_email(
        to_email=to_email,
        template="appointment_confirm_required",
        subject="StillMind: Action Required - Confirm Your Appointment",
        context={
            "appointment_time": appointment_time,
            "name": name or to_email.split('@')[0],
            "counselor_name": counselor_name,
            "confirm_url": confirm_url or f"{settings.FRONTEND_URL}/dashboard"
        }
    )


# ─── Legacy dispatcher (for backward compatibility) ──────────────────────────

async def dispatch_notification(user_id: str, email: str, template: str, context: dict):
    """
    Legacy dispatcher mapping logical templates to actual email content.
    Updated to use HTML templates.
    """
    if template == "T_48_REMINDER":
        await send_appointment_reminder(
            to_email=email,
            appointment_time=context.get('time', 'your scheduled time'),
            name=context.get('name'),
            counselor_name=context.get('counselor_name'),
            dashboard_url=context.get('dashboard_url')
        )
    elif template == "T_24_CONFIRM_REQ":
        await send_appointment_confirmation_required(
            to_email=email,
            appointment_time=context.get('time', 'your scheduled time'),
            name=context.get('name'),
            counselor_name=context.get('counselor_name'),
            confirm_url=context.get('confirm_url')
        )
    else:
        # Generic notification using template
        await send_templated_email(
            to_email=email,
            template="generic_notification",
            subject="StillMind Notification",
            context={
                "title": context.get('title', 'Notification'),
                "message": str(context),
                "name": context.get('name')
            }
        )
