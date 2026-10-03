"""Integração Firebase sob demanda, sem conexão durante a importação."""

from pathlib import Path
from threading import Lock

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client

from app.core.config import settings

_APP_NAME = "e-ai-marcou-backend"
_initialization_lock = Lock()


class FirebaseConfigurationError(RuntimeError):
    """Configuração Firebase ausente ou credencial inválida."""


def get_firestore_client() -> Client:
    """Obtém o cliente reutilizando a aplicação Firebase deste backend."""
    with _initialization_lock:
        try:
            app = firebase_admin.get_app(_APP_NAME)
        except ValueError:
            credential_path = settings.firebase_credentials
            project_id = settings.firebase_project_id
            if not credential_path or not credential_path.strip():
                raise FirebaseConfigurationError(
                    "Configure FIREBASE_CREDENTIALS para acessar o Firestore."
                ) from None
            if not project_id or not project_id.strip():
                raise FirebaseConfigurationError(
                    "Configure FIREBASE_PROJECT_ID para acessar o Firestore."
                ) from None
            if not Path(credential_path).is_file():
                raise FirebaseConfigurationError(
                    "O arquivo indicado por FIREBASE_CREDENTIALS não foi encontrado."
                ) from None
            try:
                credential = credentials.Certificate(credential_path)
            except Exception:
                # Não propagar mensagens do SDK que possam revelar a credencial.
                raise FirebaseConfigurationError(
                    "Não foi possível carregar a credencial Firebase. "
                    "Verifique o formato e a permissão de leitura do arquivo."
                ) from None
            try:
                app = firebase_admin.initialize_app(
                    credential, {"projectId": project_id}, name=_APP_NAME
                )
            except Exception:
                raise FirebaseConfigurationError(
                    "Não foi possível inicializar o Firebase Admin SDK."
                ) from None
        try:
            return firestore.client(app=app)
        except Exception:
            raise RuntimeError(
                "Não foi possível obter o cliente do Cloud Firestore."
            ) from None
