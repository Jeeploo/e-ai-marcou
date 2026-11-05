"""Busca agregada: quatro leituras de coleção, sem consultas por profissional."""
from math import radians, sin, cos, asin, sqrt
from datetime import datetime
from zoneinfo import ZoneInfo
import unicodedata


def haversine(a, b):
    lat1, lon1, lat2, lon2 = map(radians, (*a, *b))
    h = sin((lat2-lat1)/2)**2 + cos(lat1)*cos(lat2)*sin((lon2-lon1)/2)**2
    return 6371 * 2 * asin(sqrt(min(1, max(0, h))))


def normalize(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value) if not unicodedata.combining(c)).casefold()


def rank(items, ordem, has_reference):
    def distance(p):
        return p['distanciaKm'] if p['distanciaKm'] is not None else float('inf')
    if ordem == 'preco' or not has_reference:
        return sorted(items, key=lambda p: (p['valorConsulta'], p['id']))
    valid = [p for p in items if p['distanciaKm'] is not None]
    def normalized(value, values):
        low, high = min(values), max(values)
        return (value-low)/(high-low) if high != low else 0
    def score(p):
        if p['distanciaKm'] is None:
            return float('inf')
        return .6*normalized(distance(p), [distance(x) for x in valid]) + .4*normalized(p['valorConsulta'], [x['valorConsulta'] for x in items])
    return sorted(items, key=lambda p: ((score(p) if ordem == 'recomendados' else distance(p)), distance(p), p['valorConsulta'], p['id']))


def search(people, clinics, specialties, slots, latitude=None, longitude=None, ordem='recomendados', especialidadeId=None, q='', valorMaximo=None):
    clinics = {c.id:c for c in clinics if c.ativo}
    specialties = {s.id:s for s in specialties if s.ativo}
    now = datetime.now(ZoneInfo('America/Recife')).strftime('%Y-%m-%dT%H:%M')
    upcoming = {}
    for slot in slots:
        if slot.disponivel and f'{slot.data}T{slot.hora}' > now:
            old = upcoming.get(slot.profissionalId)
            if old is None or (slot.data,slot.hora,slot.id) < (old.data,old.hora,old.id):
                upcoming[slot.profissionalId] = slot
    reference = latitude is not None and longitude is not None
    results = []
    for p in people:
        c, s = clinics.get(p.clinicaId), specialties.get(p.especialidadeId)
        if not p.ativo or not c or not s or (especialidadeId and p.especialidadeId != especialidadeId):
            continue
        if valorMaximo is not None and p.valorConsulta > valorMaximo:
            continue
        if normalize(q) not in normalize(f'{p.nome} {c.nome} {s.nome}'):
            continue
        distance = haversine((latitude,longitude),(c.latitude,c.longitude)) if reference and c.latitude is not None else None
        results.append(dict(**p.model_dump(), especialidade=s.nome, clinica=c.model_dump(), distanciaKm=distance, proximoHorario=upcoming[p.id].model_dump() if p.id in upcoming else None))
    return rank(results, ordem, reference)
