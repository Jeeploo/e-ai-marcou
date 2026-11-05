"""Catálogo sintético de Recife compartilhado pelos dois modos de persistência."""
SPECIALTIES = ['Cardiologia', 'Dermatologia', 'Ortopedia', 'Clínica Geral', 'Ginecologia']
NAMES = ['Ana Souza', 'Lucas Martins', 'Juliana Lima', 'Rafael Costa', 'Mariana Alves', 'Pedro Henrique', 'Camila Rocha', 'Bruno Silva', 'Clara Melo', 'André Santos', 'Beatriz Dias', 'Daniel Freitas', 'Elisa Ramos', 'Felipe Gomes', 'Gabriela Leal', 'Hugo Moura', 'Isabela Nunes', 'João Barros']
SLUGS = ['ana-souza','lucas-martins','juliana-lima','rafael-costa','mariana-alves','pedro-henrique','camila-rocha','bruno-silva','clara-melo','andre-santos','beatriz-dias','daniel-freitas','elisa-ramos','felipe-gomes','gabriela-leal','hugo-moura','isabela-nunes','joao-barros']
CLINIC_DATA = [
 ('Boa Saúde','Av. Conselheiro Aguiar, 1200','Boa Viagem','51011-030',-8.110,-34.891),
 ('Centro Médico Recife','Av. Agamenon Magalhães, 1800','Espinheiro','52020-000',-8.039,-34.888),
 ('Saúde Família','Rua do Futuro, 450','Graças','52050-010',-8.035,-34.900),
 ('Cuidado Capibaribe','Rua Benfica, 300','Madalena','50720-001',-8.055,-34.909),
 ('Vida Boa Vista','Rua do Hospício, 200','Boa Vista','50050-050',-8.058,-34.883),
 ('Bem Estar Casa Forte','Av. Dezessete de Agosto, 800','Casa Forte','52060-000',-8.024,-34.918),
]

def catalog():
    specialties = [dict(id=f'demo-especialidade-{i}', nome=n, descricao=f'Atendimento em {n}', ativo=True) for i,n in enumerate(SPECIALTIES)]
    clinics = [dict(id=f'demo-clinica-{i}', nome=n, endereco=e, bairro=b, cep=c, cidade='Recife', uf='PE', complemento=None, latitude=lat, longitude=lon, telefone='(81) 3333-1000', ativo=True) for i,(n,e,b,c,lat,lon) in enumerate(CLINIC_DATA)]
    people = [dict(id=f'demo-profissional-{i}', nome=f'Dr(a). {n}', crm=f'CRM-PE DEMO {21000+i}', especialidadeId=f'demo-especialidade-{(i//2)%5}', clinicaId=f'demo-clinica-{i%6}', valorConsulta=120+(i*47)%290, fotoUrl=f'/images/doctors/{SLUGS[i]}.webp', ativo=True) for i,n in enumerate(NAMES)]
    return dict(especialidades=specialties, clinicas=clinics, profissionais=people)
