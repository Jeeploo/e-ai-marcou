from pydantic import BaseModel, Field, field_validator


class ProfissionalCreate(BaseModel):
    nome: str = Field(min_length=1)
    crm: str = Field(min_length=1)
    especialidadeId: str = Field(min_length=1)
    clinicaId: str = Field(min_length=1)
    valorConsulta: float = Field(ge=0, allow_inf_nan=False)
    fotoUrl: str | None = None

    @field_validator("nome", "crm", "especialidadeId", "clinicaId", "fotoUrl", mode="before")
    @classmethod
    def trim_strings(cls, value):
        return value.strip() if isinstance(value, str) else value


class ProfissionalResponse(BaseModel):
    id: str
    nome: str
    crm: str
    especialidadeId: str
    clinicaId: str
    valorConsulta: float
    fotoUrl: str | None
    ativo: bool
