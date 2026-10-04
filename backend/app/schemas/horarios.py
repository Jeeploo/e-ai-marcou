from datetime import date
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, AfterValidator


def validate_date(value: str) -> str:
    date.fromisoformat(value)
    return value


Data = Annotated[str, Field(pattern=r"^\d{4}-\d{2}-\d{2}$"), AfterValidator(validate_date)]
Hora = Annotated[str, Field(pattern=r"^([01][0-9]|2[0-3]):[0-5][0-9]$")]


class HorarioCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    profissionalId: str = Field(min_length=1)
    data: Data
    hora: Hora


class HorarioResponse(BaseModel):
    id: str
    profissionalId: str
    clinicaId: str
    data: Data
    hora: Hora
    disponivel: bool
