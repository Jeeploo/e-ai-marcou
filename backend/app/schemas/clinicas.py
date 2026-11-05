from pydantic import BaseModel, Field, field_validator, model_validator


class ClinicaCreate(BaseModel):
    nome: str = Field(min_length=1)
    endereco: str = Field(min_length=1)
    cidade: str = Field(min_length=1)
    uf: str = Field(min_length=2, max_length=2)
    bairro: str = ""
    cep: str = ""
    complemento: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90, allow_inf_nan=False)
    longitude: float | None = Field(default=None, ge=-180, le=180, allow_inf_nan=False)
    telefone: str | None = None

    @model_validator(mode="after")
    def coordinate_pair(self):
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("Informe latitude e longitude juntas")
        return self


    @field_validator("nome", "endereco", "cidade", "uf", "telefone", "bairro", "cep", "complemento", mode="before")
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


class ClinicaResponse(ClinicaCreate):
    id: str
    ativo: bool
