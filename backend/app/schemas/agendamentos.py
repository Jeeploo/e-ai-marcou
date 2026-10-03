from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.horarios import Data, Hora


class AgendamentoCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    pacienteId: str = Field(min_length=1)
    horarioId: str = Field(min_length=1)


class AgendamentoResponse(BaseModel):
    id: str
    pacienteId: str
    profissionalId: str
    clinicaId: str
    horarioId: str
    data: Data
    hora: Hora
    valor: float = Field(ge=0, allow_inf_nan=False)
    status: Literal["agendado"]
    criadoEm: datetime
