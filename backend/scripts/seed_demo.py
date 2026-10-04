from datetime import date, timedelta
import hashlib

from app.core.firebase import get_firestore_client


db = get_firestore_client()

SPECIALTIES = [
    ("Ft0sI1nj5rnVNqQgWa31", "Cardiologia", "Atendimento especializado em cardiologia"),
    ("demo-dermato", "Dermatologia", "Atendimento especializado em dermatologia"),
    ("demo-ortopedia", "Ortopedia", "Atendimento especializado em ortopedia"),
    ("demo-gineco", "Ginecologia", "Atendimento especializado em ginecologia"),
    ("demo-clinica", "Clínica Geral", "Atendimento médico em clínica geral"),
]

CLINICS = [
    (
        "demo-clinica-recife",
        "Clínica Boa Saúde",
        "Av. Conselheiro Aguiar, 1200",
        "Recife",
        "PE",
        "(81) 3333-1000",
    ),
    (
        "demo-centro-medico",
        "Centro Médico Recife",
        "Av. Agamenon Magalhães, 1800",
        "Recife",
        "PE",
        "(81) 3333-2000",
    ),
    (
        "demo-saude-familia",
        "Espaço Saúde Família",
        "Rua do Futuro, 450",
        "Recife",
        "PE",
        "(81) 3333-3000",
    ),
]

PROFESSIONALS = [
    ("demo-ana-souza", "Dra. Ana Souza", "CRM-PE 21001", "Ft0sI1nj5rnVNqQgWa31", "demo-clinica-recife", 180.0),
    ("demo-lucas-martins", "Dr. Lucas Martins", "CRM-PE 21002", "Ft0sI1nj5rnVNqQgWa31", "demo-centro-medico", 220.0),
    ("demo-juliana-lima", "Dra. Juliana Lima", "CRM-PE 21003", "demo-dermato", "demo-saude-familia", 160.0),
    ("demo-rafael-costa", "Dr. Rafael Costa", "CRM-PE 21004", "demo-dermato", "demo-centro-medico", 200.0),
    ("demo-mariana-alves", "Dra. Mariana Alves", "CRM-PE 21005", "demo-ortopedia", "demo-clinica-recife", 190.0),
    ("demo-pedro-henrique", "Dr. Pedro Henrique", "CRM-PE 21006", "demo-ortopedia", "demo-centro-medico", 210.0),
    ("demo-camila-rocha", "Dra. Camila Rocha", "CRM-PE 21007", "demo-gineco", "demo-saude-familia", 170.0),
    ("demo-bruno-silva", "Dr. Bruno Silva", "CRM-PE 21008", "demo-clinica", "demo-clinica-recife", 140.0),
]

TIMES = ["08:30", "09:30", "10:30", "14:00", "15:30", "17:00"]


def slot_id(professional_id: str, day: str, time: str) -> str:
    raw = f"{professional_id}|{day}|{time}"
    return hashlib.sha256(raw.encode()).hexdigest()


def main():
    print("Criando especialidades...")
    for doc_id, nome, descricao in SPECIALTIES:
        db.collection("especialidades").document(doc_id).set({
            "nome": nome,
            "descricao": descricao,
            "ativo": True,
        }, merge=True)

    print("Criando clínicas...")
    for doc_id, nome, endereco, cidade, uf, telefone in CLINICS:
        db.collection("clinicas").document(doc_id).set({
            "nome": nome,
            "endereco": endereco,
            "cidade": cidade,
            "uf": uf,
            "telefone": telefone,
            "ativo": True,
        }, merge=True)

    print("Criando profissionais...")
    for doc_id, nome, crm, especialidade_id, clinica_id, valor in PROFESSIONALS:
        db.collection("profissionais").document(doc_id).set({
            "nome": nome,
            "crm": crm,
            "especialidadeId": especialidade_id,
            "clinicaId": clinica_id,
            "valorConsulta": valor,
            "fotoUrl": None,
            "ativo": True,
        }, merge=True)

    print("Criando horários...")
    start = date(2026, 10, 5)

    total = 0
    for professional_id, *_ in PROFESSIONALS:
        for offset in range(5):
            current = (start + timedelta(days=offset)).isoformat()

            for time in TIMES:
                doc_id = slot_id(professional_id, current, time)

                ref = db.collection("horarios").document(doc_id)

                # Não sobrescreve horário existente para evitar
                # reabrir acidentalmente um horário já reservado.
                if not ref.get().exists:
                    ref.set({
                        "profissionalId": professional_id,
                        "clinicaId": next(
                            p[4] for p in PROFESSIONALS if p[0] == professional_id
                        ),
                        "data": current,
                        "hora": time,
                        "disponivel": True,
                    })
                    total += 1

    print()
    print("Seed concluído.")
    print(f"{len(SPECIALTIES)} especialidades")
    print(f"{len(CLINICS)} clínicas")
    print(f"{len(PROFESSIONALS)} profissionais")
    print(f"{total} novos horários")


if __name__ == "__main__":
    main()
