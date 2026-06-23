"""
Firebase Admin SDK başlatıcı.
Sadece kimlik doğrulama (Auth) için kullanılır — Firestore, Storage vb. YOKTUR.

Yapılandırma (.env):
  FIREBASE_SERVICE_ACCOUNT_JSON  - service account key JSON'unun tek satır hali
  FIREBASE_PROJECT_ID            - Firebase proje ID'si (opsiyonel, yedek)

Servis hesabı JSON dosyasını Firebase Console'dan indirin:
  Project Settings → Service Accounts → Generate new private key
Sonra terminalde JSON'u tek satıra çevirin:
  python -c "import json,sys; print(json.dumps(json.load(open('serviceAccount.json'))))"
"""

import json
import logging

import firebase_admin
from firebase_admin import credentials

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_initialized = False


def init_firebase() -> bool:
    """
    Firebase Admin'i başlatır. Başarılıysa True, ayar eksikse False döner.
    Daha önce başlatılmışsa tekrar başlatmaz.
    """
    global _initialized
    if _initialized:
        return True

    settings = get_settings()

    if not settings.firebase_service_account_json:
        logger.warning(
            "FIREBASE_SERVICE_ACCOUNT_JSON ayarlanmamış — "
            "Firebase Auth devre dışı. Mevcut e-posta/şifre auth çalışmaya devam eder."
        )
        return False

    try:
        sa_dict = json.loads(settings.firebase_service_account_json)
        cred = credentials.Certificate(sa_dict)
        firebase_admin.initialize_app(cred)
        _initialized = True
        logger.info("Firebase Admin SDK başarıyla başlatıldı (proje: %s)", sa_dict.get("project_id"))
        return True
    except Exception as exc:
        logger.error("Firebase Admin SDK başlatılamadı: %s", exc)
        return False


def is_firebase_enabled() -> bool:
    return _initialized
