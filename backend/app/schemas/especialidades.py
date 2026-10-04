from pydantic import BaseModel, Field, field_validator


class EspecialidadeCreate(BaseModel):
    nome: str = Field(min_length=1)
    descricao: str | None = None

    @field_validator("nome", "descricao", mode="before")
    @classmethod
    def trim_strings(cls, value):
        return value.strip() if isinstance(value, str) else value


class EspecialidadeResponse(BaseModel):
    id: str
    nome: str
    descricao: str | None
    ativo: bool
