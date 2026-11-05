"""Executar explicitamente: python -m scripts.seed_demo. Nunca abre reservas existentes."""
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from app.demo_catalog import catalog
from app.core.firebase import get_firestore_client
from app.repositories.horarios import HorarioRepository, HorarioDuplicadoError


def main():
    db = get_firestore_client()
    data = catalog()
    for collection, records in data.items():
        for record in records:
            db.collection(collection).document(record['id']).set(
                {k:v for k,v in record.items() if k != 'id'}, merge=True)
    repo = HorarioRepository(db)
    today = datetime.now(ZoneInfo('America/Recife')).date()
    for person in data['profissionais']:
        for offset in range(15):
            for hour in ['08:30','09:30','10:30','14:00','15:30','17:00']:
                try:
                    repo.create(person['id'], person['clinicaId'], (today+timedelta(days=offset)).isoformat(), hour, True)
                except HorarioDuplicadoError:
                    pass
    print('Catálogo fictício atualizado: 6 clínicas e 18 profissionais.')

if __name__ == '__main__':
    main()
