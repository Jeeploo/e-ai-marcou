"""Único ponto de seleção de persistência; as dependências públicas são estáveis."""
from functools import lru_cache
from typing import Callable, TypeVar
from threading import Lock

from app.core.config import settings

T = TypeVar("T")
_store_initialization_lock = Lock()


@lru_cache(maxsize=1)
def get_demo_store():
    from app.repositories.memory import MemoryStore

    return MemoryStore()


def select_repository(collection: str, firebase_factory: Callable[[], T]):
    if settings.data_mode == "firebase":
        return firebase_factory()
    from app.repositories.memory import MemoryAgendamentoRepository, MemoryHorarioRepository, MemoryRepository

    # lru_cache sozinho permite inicializações simultâneas antes do primeiro cache hit.
    with _store_initialization_lock:
        store = get_demo_store()
    if collection == "agendamentos":
        return MemoryAgendamentoRepository(store)
    if collection == "horarios":
        return MemoryHorarioRepository(store)
    return MemoryRepository(store, collection)
