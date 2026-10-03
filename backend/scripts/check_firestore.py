"""Verificação manual somente de leitura: python scripts/check_firestore.py."""

import os
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.firebase import FirebaseConfigurationError, get_firestore_client


def main() -> int:
    if os.environ.get("FIRESTORE_EMULATOR_HOST"):
        print("Remova FIRESTORE_EMULATOR_HOST para verificar o Firestore real.")
        return 1
    try:
        client = get_firestore_client()
        # Consumir o iterador dispara a leitura; não exibir nomes ou documentos.
        # Uma base vazia também confirma que a operação foi autorizada.
        next(client.collections(retry=None, timeout=10), None)
    except FirebaseConfigurationError as error:
        print(str(error), file=sys.stderr)
        return 1
    except Exception:
        print(
            "Falha na leitura do Firestore. Verifique a rede, o projeto, "
            "a existência do banco e as permissões da conta de serviço.",
            file=sys.stderr,
        )
        return 1
    print("Conexão com Firestore verificada por leitura. Nenhum dado foi gravado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
