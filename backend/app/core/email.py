import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def send_reset_email(to_email: str, code: str) -> None:
    settings = get_settings()

    body = f"""Merhaba,

LingoPulse şifre sıfırlama kodunuz:

  {code}

Bu kod 15 dakika geçerlidir. Şifre sıfırlama talebinde bulunmadıysanız bu e-postayı görmezden gelin.

— LingoPulse
"""

    if not settings.smtp_host or not settings.smtp_user:
        # SMTP yapılandırılmamış — kodu konsola yaz (geliştirme modu)
        logger.warning("SMTP yapılandırılmamış. Sıfırlama kodu: %s → %s", code, to_email)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"LingoPulse Şifre Sıfırlama Kodu: {code}"
    msg["From"] = settings.smtp_user
    msg["To"] = to_email
    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to_email, msg.as_string())
        logger.info("Sıfırlama e-postası gönderildi: %s", to_email)
    except Exception as exc:
        logger.error("E-posta gönderilemedi: %s", exc)
        raise
