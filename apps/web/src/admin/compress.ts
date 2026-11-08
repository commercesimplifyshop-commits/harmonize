const MAX_SIDE = 2400
const QUALITY = 0.86
const TARGET_BYTES = 3.5 * 1024 * 1024

/**
 * Shrinks a photo in the browser before upload: a 12 MP phone photo (5-10 MB) becomes ~0.5-1 MB,
 * which uploads fast on 4G and fits the api's 4 MB limit. Decoding through the browser also turns
 * iPhone HEIC photos into JPEG and applies the camera rotation.
 */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error('Esse arquivo não é uma imagem.')
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Browsers that can't decode the format (HEIC outside Safari): send as is if it's small.
    if (file.size <= TARGET_BYTES) return file
    throw new Error('Não foi possível ler essa foto. Tente tirar uma captura de tela dela ou enviar em JPG.')
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Seu navegador não conseguiu processar a foto.')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  for (const quality of [QUALITY, 0.75, 0.6]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (blob && blob.size <= TARGET_BYTES) return blob
  }
  throw new Error('A foto ficou grande demais mesmo depois de comprimida.')
}

/** "IMG_2034.HEIC" -> "IMG 2034", a starting point for the description. */
export const altFromName = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
