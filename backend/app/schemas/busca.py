from app.schemas.profissionais import ProfissionalResponse
from app.schemas.clinicas import ClinicaResponse
from app.schemas.horarios import HorarioResponse


class BuscaResponse(ProfissionalResponse):
    especialidade: str
    clinica: ClinicaResponse
    distanciaKm: float | None
    proximoHorario: HorarioResponse | None
