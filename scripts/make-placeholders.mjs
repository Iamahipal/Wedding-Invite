/**
 * Generates the placeholder gallery images.
 *
 *   node scripts/make-placeholders.mjs
 *
 * These exist so the site runs end-to-end — and so the 3D photo corridor is
 * actually loading real raster textures — before any real photographs arrive.
 * Replace /public/gallery/*.png with your own and update `gallery` in
 * data/wedding.ts. Landscape 3:2 at ~1600px wide is the sweet spot.
 *
 * Written with zero dependencies: a minimal PNG encoder over Node's zlib.
 * Flat gradients compress to a couple of KB each, so they cost nothing in git.
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'gallery')
const WIDTH = 1080
const HEIGHT = 720

// Pairs drawn from the site's Marwar × Awadh palette.
const PAIRS = [
  ['#2B4C7E', '#0A0E1A'], // Jodhpur blue → midnight
  ['#6B2637', '#131B33'], // deep maroon → indigo
  ['#C9A273', '#6B3A2A'], // sandstone → henna
  ['#2B4C7E', '#C98B7A'], // blue → rose gold
  ['#E8A33D', '#6B2637'], // marigold → maroon
  ['#131B33', '#D4A857'], // indigo → gold
]

// ── PNG encoding ─────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i++) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([length, typeAndData, crc])
}

function encodePNG(width, height, rgb) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // colour type: truecolour RGB
  header[10] = 0 // deflate
  header[11] = 0 // adaptive filtering
  header[12] = 0 // no interlace

  // Every scanline is prefixed with its filter type byte (0 = none).
  const raw = Buffer.alloc(height * (width * 3 + 1))
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 3 + 1)
    raw[rowStart] = 0
    rgb.copy(raw, rowStart + 1, y * width * 3, (y + 1) * width * 3)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Image generation ─────────────────────────────────────────────────────────

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

function render(width, height, fromHex, toHex) {
  const from = hexToRgb(fromHex)
  const to = hexToRgb(toHex)
  const pixels = Buffer.alloc(width * height * 3)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Diagonal ramp.
      const t = (x / width) * 0.65 + (y / height) * 0.35

      // Radial falloff towards the corners, so it reads as lit rather than flat.
      const dx = (x / width - 0.5) * 2
      const dy = (y / height - 0.5) * 2
      const vignette = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) * 0.62) * 0.55

      const index = (y * width + x) * 3
      for (let c = 0; c < 3; c++) {
        const value = (from[c] + (to[c] - from[c]) * t) * vignette
        pixels[index + c] = Math.max(0, Math.min(255, Math.round(value)))
      }
    }
  }

  // A gold hairline inset, so the placeholders look intentional in the 3D
  // corridor rather than like a failed texture load.
  const gold = hexToRgb('#D4A857')
  const inset = 14
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const onBorder =
        ((x === inset || x === width - 1 - inset) && y >= inset && y <= height - 1 - inset) ||
        ((y === inset || y === height - 1 - inset) && x >= inset && x <= width - 1 - inset)
      if (!onBorder) continue
      const index = (y * width + x) * 3
      for (let c = 0; c < 3; c++) {
        pixels[index + c] = Math.round(pixels[index + c] * 0.35 + gold[c] * 0.65)
      }
    }
  }

  return pixels
}

mkdirSync(OUT_DIR, { recursive: true })

PAIRS.forEach(([from, to], index) => {
  const name = `${String(index + 1).padStart(2, '0')}.png`
  const png = encodePNG(WIDTH, HEIGHT, render(WIDTH, HEIGHT, from, to))
  writeFileSync(join(OUT_DIR, name), png)
  console.log(`  ${name}  ${(png.length / 1024).toFixed(1)} KB`)
})

console.log(`\nWrote ${PAIRS.length} placeholders to public/gallery/`)
