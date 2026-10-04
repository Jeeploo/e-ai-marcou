from pydantic import BaseModel, Field, field_validator


class ClinicaCreate(BaseModel):
    nome: str = Field(min_length=1)
    endereco: str = Field(min_length=1)
    cidade: str = Field(min_length=1)
    uf: str = Field(min_length=2, max_length=2)
    telefone: str | None = None

    @field_validator("nome", "endereco", "cidade", "uf", "telefone", mode="before")
    @classmethod
    def trim_strings(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("uf")
    @classmethod
    def normalize_uf(cls, value: str) -> str:
        normalized = value.upper()
        if len(normalized) != 2:
            raise ValueError("UF deve possuir exatamente 2 caracteres")
        return normalized


class ClinicaResponse(BaseModel):
    id: str
    nome: str
    endereco: str
    cidade: str
    uf: str
    telefone: str | None
    ativo: bool
