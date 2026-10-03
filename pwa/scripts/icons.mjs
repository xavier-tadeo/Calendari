import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const arrel = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(arrel, 'public/icon.svg'))
mkdirSync(join(arrel, 'public/icons'), { recursive: true })

const mides = [
  { nom: 'icon-192.png', tamany: 192 },
  { nom: 'icon-512.png', tamany: 512 },
  { nom: 'apple-touch-icon.png', tamany: 180 },
]

for (const { nom, tamany } of mides) {
  await sharp(svg, { density: 384 })
    .resize(tamany, tamany)
    .png()
    .toFile(join(arrel, 'public/icons', nom))
  console.log('fet', nom)
}
