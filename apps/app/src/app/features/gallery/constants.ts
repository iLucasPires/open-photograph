export const galleryThemes = [
  {
    label: 'Pinterest · Masonry',
    value: 'masonry',
  },
  {
    label: 'Instagram · Feed',
    value: 'instagram',
  },
  {
    label: 'Clássico',
    value: 'classic',
  },
  {
    label: 'Primeira foto em destaque',
    value: 'featured',
  },
  {
    label: 'Carrossel',
    value: 'carousel',
  },
] as const

export const galleryAccessOptions = [
  {
    label: 'Não listada',
    value: 'unlisted',
    description: 'Compartilhada pelo endereço da galeria.',
  },
  {
    label: 'Pública',
    value: 'public',
    description: 'Disponível publicamente quando publicada.',
  },
  {
    label: 'Privada',
    value: 'private',
    description: 'Configuração com código de acesso.',
  },
] as const

export type GalleryTheme = (typeof galleryThemes)[number]['value']
export type GalleryAccessOption = (typeof galleryAccessOptions)[number]['value']
