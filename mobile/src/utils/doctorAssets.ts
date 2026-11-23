import type { ImageSourcePropType } from 'react-native';

// IDs do catálogo local e aliases observados no catálogo publicado.
const doctorPhotos = [
  ['ana-souza', 'demo-profissional-0', 'demo-ana-souza', require('../../assets/doctors/ana-souza.jpg')],
  ['lucas-martins', 'demo-profissional-1', 'demo-lucas-martins', require('../../assets/doctors/lucas-martins.jpg')],
  ['juliana-lima', 'demo-profissional-2', 'demo-juliana-lima', require('../../assets/doctors/juliana-lima.jpg')],
  ['rafael-costa', 'demo-profissional-3', 'demo-rafael-costa', require('../../assets/doctors/rafael-costa.jpg')],
  ['mariana-alves', 'demo-profissional-4', 'demo-mariana-alves', require('../../assets/doctors/mariana-alves.jpg')],
  ['pedro-henrique', 'demo-profissional-5', 'demo-pedro-henrique', require('../../assets/doctors/pedro-henrique.jpg')],
  ['camila-rocha', 'demo-profissional-6', 'demo-camila-rocha', require('../../assets/doctors/camila-rocha.jpg')],
  ['bruno-silva', 'demo-profissional-7', 'demo-bruno-silva', require('../../assets/doctors/bruno-silva.jpg')],
  ['clara-melo', 'demo-profissional-8', null, require('../../assets/doctors/clara-melo.jpg')],
  ['andre-santos', 'demo-profissional-9', null, require('../../assets/doctors/andre-santos.jpg')],
  ['beatriz-dias', 'demo-profissional-10', null, require('../../assets/doctors/beatriz-dias.jpg')],
  ['daniel-freitas', 'demo-profissional-11', null, require('../../assets/doctors/daniel-freitas.jpg')],
  ['elisa-ramos', 'demo-profissional-12', null, require('../../assets/doctors/elisa-ramos.jpg')],
  ['felipe-gomes', 'demo-profissional-13', null, require('../../assets/doctors/felipe-gomes.jpg')],
  ['gabriela-leal', 'demo-profissional-14', null, require('../../assets/doctors/gabriela-leal.jpg')],
  ['hugo-moura', 'demo-profissional-15', null, require('../../assets/doctors/hugo-moura.jpg')],
  ['isabela-nunes', 'demo-profissional-16', null, require('../../assets/doctors/isabela-nunes.jpg')],
  ['joao-barros', 'demo-profissional-17', null, require('../../assets/doctors/joao-barros.jpg')],
] as const;

const photosById = new Map<string, ImageSourcePropType>();
const photosBySlug = new Map<string, ImageSourcePropType>();
for (const [slug, catalogId, publishedId, source] of doctorPhotos) {
  photosById.set(catalogId, source);
  if (publishedId) photosById.set(publishedId, source);
  photosBySlug.set(slug, source);
}

export function getDoctorNameWithoutTitle(name: string) {
  return name.trim().replace(/^(?:dr\(a\)|dra?)\.?\s+/i, '');
}

export function getDoctorPhoto({
  professionalId,
  photoUrl,
  name,
}: {
  professionalId?: string;
  photoUrl?: string | null;
  name: string;
}): ImageSourcePropType | undefined {
  const photoById = professionalId ? photosById.get(professionalId) : undefined;
  if (photoById !== undefined) return photoById;

  const url = photoUrl?.trim();
  if (url) {
    const localSlug = /^(?:https?:\/\/[^/]+)?\/images\/doctors\/([a-z0-9-]+)\.(?:webp|jpe?g|png)(?:[?#].*)?$/i.exec(url)?.[1];
    const localPhoto = localSlug ? photosBySlug.get(localSlug.toLowerCase()) : undefined;
    if (localPhoto !== undefined) return localPhoto;
    if (/^https?:\/\//i.test(url)) return { uri: url };
  }

  const nameSlug = getDoctorNameWithoutTitle(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .join('-');
  return photosBySlug.get(nameSlug);
}
