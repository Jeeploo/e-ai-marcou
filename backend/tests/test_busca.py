import pytest
from app.services.busca import haversine, rank, search
from app.repositories.memory import MemoryStore, MemoryRepository, MemoryHorarioRepository, MemoryAgendamentoRepository
from app.schemas.clinicas import ClinicaCreate, ClinicaResponse


def test_haversine():
    assert haversine((0,0),(0,0)) == 0
    assert haversine((0,0),(0,1)) == pytest.approx(111.195, rel=.001)


def test_ranking():
    items=[dict(id='perto',distanciaKm=1,valorConsulta=300),dict(id='longe',distanciaKm=10,valorConsulta=100),dict(id='sem',distanciaKm=None,valorConsulta=90)]
    assert [p['id'] for p in rank(items,'recomendados',True)] == ['perto','longe','sem']
    assert rank(items,'distancia',True)[0]['id']=='perto'
    assert rank(items,'preco',True)[0]['id']=='sem'
    assert rank(items,'recomendados',False)[0]['id']=='sem'
    assert len(rank([items[0]],'recomendados',True))==1


def test_compatibility_and_validation():
    old=dict(id='old',nome='Clínica',endereco='Rua, 1',cidade='Recife',uf='PE',telefone=None,ativo=True)
    assert ClinicaResponse(**old).latitude is None
    with pytest.raises(ValueError):
        ClinicaCreate(**{k:v for k,v in old.items() if k not in ('id','ativo')},latitude=0)


def test_demo_search_and_booking():
    store=MemoryStore()
    data=lambda c:MemoryRepository(store,c).list()
    result=search(data('profissionais'),data('clinicas'),data('especialidades'),data('horarios'),-8.11,-34.89)
    assert len(result)==18
    assert all(p['proximoHorario'] and p['distanciaKm'] is not None for p in result)
    slot=result[0]['proximoHorario']
    booked=MemoryAgendamentoRepository(store).create('teste',slot['id'],'outra_pessoa')
    assert booked.paraQuem=='outra_pessoa'
    again=search(data('profissionais'),data('clinicas'),data('especialidades'),data('horarios'))
    assert next(p for p in again if p['id']==booked.profissionalId)['proximoHorario']['id'] != slot['id']
    legacy=booked.model_dump();legacy.pop('paraQuem')
    assert type(booked)(**legacy).paraQuem=='mim'


def test_without_clinic_coordinates_and_filters():
    store=MemoryStore()
    data=lambda c:MemoryRepository(store,c).list()
    clinic=store.collections['clinicas']['demo-clinica-0']
    clinic.latitude=clinic.longitude=None
    results=search(data('profissionais'),data('clinicas'),data('especialidades'),data('horarios'),-8.11,-34.89)
    assert all(p['distanciaKm'] is None for p in results[-3:])
    cheap=search(data('profissionais'),data('clinicas'),data('especialidades'),[],ordem='preco',valorMaximo=200)
    assert all(p['valorConsulta']<=200 and p['proximoHorario'] is None for p in cheap)
    assert [p['valorConsulta'] for p in cheap]==sorted(p['valorConsulta'] for p in cheap)
