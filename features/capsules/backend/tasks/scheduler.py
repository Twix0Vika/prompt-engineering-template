"""
Capsule email-notification scheduler.

Runs as a background asyncio task started by the FastAPI lifespan event.
Every 60 seconds it scans capsules.json for entries whose target_datetime
has passed and whose email_sent flag is still False, then "sends" a
notification (console-log stub — swap the send_notification() call for a
real Resend / SMTP call when ready).
"""

import asyncio
import logging
import smtplib
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.utils.json_store import read_list_file, write_list_file
from app.utils.paths import get_data_dir
from features.capsules.backend.models import CapsuleInDb

logger = logging.getLogger(__name__)
POLL_INTERVAL_SECONDS = 60


def _capsules_file():
    return get_data_dir() / "capsules.json"


def send_notification(capsule: CapsuleInDb) -> None:
    """
    Stub implementation — logs to console.
    Replace with Resend SDK or smtplib for production:

    # --- Resend example ---
    # import resend
    # resend.api_key = os.environ["RESEND_API_KEY"]
    # resend.Emails.send({
    #     "from": "capsules@yourdomain.com",
    #     "to": capsule.notify_email,
    #     "subject": f"Your capsule '{capsule.title}' is now open!",
    #     "html": f"<p>Open it here: http://localhost:5174/capsule/{capsule.id}</p>",
    # })
    """
    view_url = f"http://localhost:5174/capsule/{capsule.id}"
    logger.info(
        "[SCHEDULER] 📬 Email would be sent to %s — capsule '%s' is ready. URL: %s",
        capsule.notify_email,
        capsule.title,
        view_url,
    )


async def run_scheduler() -> None:
    """Infinite asyncio loop — started by FastAPI lifespan."""
    logger.info("[SCHEDULER] Started — checking every %ss", POLL_INTERVAL_SECONDS)
    while True:
        try:
            _check_and_notify()
        except Exception as exc:  # noqa: BLE001
            logger.exception("[SCHEDULER] Error during notification check: %s", exc)
        await asyncio.sleep(POLL_INTERVAL_SECONDS)


def _check_and_notify() -> None:
    path = _capsules_file()
    if not path.exists():
        return

    capsules = read_list_file(path, CapsuleInDb)
    now = datetime.now(timezone.utc)
    updated = False

    for capsule in capsules:
        target = capsule.target_datetime
        if target.tzinfo is None:
            target = target.replace(tzinfo=timezone.utc)

        if target <= now and not capsule.email_sent:
            try:
                send_notification(capsule)
                capsule.email_sent = True
                updated = True
            except Exception as exc:  # noqa: BLE001
                logger.error("[SCHEDULER] Failed to notify %s: %s", capsule.id, exc)

    if updated:
        write_list_file(path, capsules)

