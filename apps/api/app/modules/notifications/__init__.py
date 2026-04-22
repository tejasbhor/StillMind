"""Notifications module with email templates."""

from .service import (
    send_email,
    send_templated_email,
    send_verification_code,
    send_password_reset,
    send_appointment_reminder,
    send_appointment_confirmation_required,
    dispatch_notification,
)

__all__ = [
    "send_email",
    "send_templated_email",
    "send_verification_code",
    "send_password_reset",
    "send_appointment_reminder",
    "send_appointment_confirmation_required",
    "dispatch_notification",
]
