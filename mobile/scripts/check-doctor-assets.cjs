const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const catalogPath = process.argv[2];
if (!catalogPath) {
  console.error('Uso: node scripts/check-doctor-assets.cjs <JSON de /api/profissionais/busca ou /api/profissionais>');
  process.exit(1);
}

function loadSource(relativePath, imports) {
  const filename = path.join(__dirname, '..', relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: imports }, { filename });
  return exports;
}

const { getDoctorPhoto } = loadSource('src/utils/doctorAssets.ts', (asset) => {
  const filename = path.resolve(__dirname, '../src/utils', asset);
  assert.ok(fs.statSync(filename).isFile(), filename);
  return filename;
});

const { normalizeProfessional } = loadSource('src/controllers/searchController.ts', (specifier) => {
  assert.equal(specifier, '../services/professionalsService');
  return {};
});

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const professionals = catalog.filter(({ fotoUrl }) => fotoUrl?.startsWith('/images/doctors/'));
const results = professionals.map((dto) => {
  const professional = normalizeProfessional({
    ...dto,
    clinica: dto.clinica ?? { nome: '', bairro: '' },
    distanciaKm: dto.distanciaKm ?? null,
  });
  const expected = path.join(__dirname, '../assets/doctors', path.basename(dto.fotoUrl, '.webp') + '.jpg');
  const photo = getDoctorPhoto({ professionalId: professional.id, photoUrl: professional.photoUrl, name: professional.name });
  const byId = getDoctorPhoto({ professionalId: professional.id, name: 'Nome abreviado' });
  const byPhotoUrl = getDoctorPhoto({ professionalId: 'outro-id', photoUrl: professional.photoUrl, name: 'Nome abreviado' });
  return { professionalId: professional.id, nome: professional.name, imagem: photo === expected && byId === expected && byPhotoUrl === expected ? 'sim' : 'não' };
});

console.table(results);
const resolved = results.filter(({ imagem }) => imagem === 'sim').length;
console.log(`${resolved}/${results.length} fotos locais correspondem por ID e por fotoUrl.`);
assert.equal(results.length, 18);
assert.equal(resolved, results.length);
assert.equal(getDoctorPhoto({ professionalId: 'marina', name: 'Dra. Marina Souza' }), undefined);
