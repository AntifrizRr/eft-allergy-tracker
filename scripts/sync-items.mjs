import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const JSON_BASE_URL = 'https://json.tarkov.dev'
const GAME_MODE = 'regular'
const OUTPUT_FILE = path.resolve('src/data/items.ts')
const IMAGE_DIR = path.resolve('public/items')
const ALLERGY_TYPES = new Set(['provisions', 'meds', 'injectors'])
const MAX_ATTEMPTS = 3

async function fetchJson(pathname, label) {
  let lastError

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${JSON_BASE_URL}/${pathname}`, {
        headers: {
          accept: 'application/json',
          'user-agent': 'eft-allergy-tracker/0.2 (+https://github.com/AntifrizRr/eft-allergy-tracker)',
        },
      })
      const text = await response.text()
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 1000)}`)

      const payload = JSON.parse(text)
      if (!payload || typeof payload !== 'object' || payload.data == null) {
        throw new Error(`invalid ${label} envelope: missing data`)
      }
      return payload
    } catch (error) {
      lastError = error
      console.warn(`${label} attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}`)
      if (attempt < MAX_ATTEMPTS) await delay(1500 * attempt)
    }
  }

  throw new Error(`${label} failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`)
}

function toRecordArray(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === 'object')
  if (value && typeof value === 'object') return Object.values(value).filter((entry) => entry && typeof entry === 'object')
  return []
}

function asTranslationMap(payload) {
  if (!payload?.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) return {}
  return payload.data
}

function translate(value, dictionary) {
  if (typeof value !== 'string') return ''
  const translated = dictionary[value]
  return typeof translated === 'string' && translated.trim() ? translated : value
}

async function fetchCatalog() {
  const [base, enTranslations, ruTranslations] = await Promise.all([
    fetchJson(`${GAME_MODE}/items`, 'items base'),
    fetchJson(`${GAME_MODE}/items_en`, 'items EN translations'),
    fetchJson(`${GAME_MODE}/items_ru`, 'items RU translations'),
  ])

  const rawItems = toRecordArray(base.data?.items)
  if (rawItems.length < 1000) {
    throw new Error(`Static items payload looks incomplete: only ${rawItems.length} total items`)
  }

  const en = asTranslationMap(enTranslations)
  const ru = asTranslationMap(ruTranslations)

  console.log(`Static Tarkov snapshot loaded: ${rawItems.length} total items`)
  console.log(`Translation keys: EN ${Object.keys(en).length}, RU ${Object.keys(ru).length}`)

  return rawItems
    .filter((item) => Array.isArray(item.types) && item.types.some((type) => ALLERGY_TYPES.has(type)))
    .map((item) => {
      const name = translate(item.name, en)
      const shortName = translate(item.shortName, en)
      const nameRu = translate(item.name, ru)
      const shortNameRu = translate(item.shortName, ru)
      const types = item.types.filter((type) => ALLERGY_TYPES.has(type))

      return {
        id: item.id,
        name: name || shortName || item.id,
        shortName: shortName || name || item.id,
        nameRu: nameRu || name || item.id,
        shortNameRu: shortNameRu || shortName || item.id,
        category: item.types.includes('provisions') ? 'food' : 'medical',
        types,
        sourceIconLink: typeof item.iconLink === 'string' ? item.iconLink : null,
      }
    })
    .filter((item) => typeof item.id === 'string' && item.id.length > 0)
    .sort((a, b) => a.shortName.localeCompare(b.shortName, 'en'))
}

function extensionFor(contentType, url) {
  if (contentType?.includes('image/webp') || /\.webp(?:\?|$)/i.test(url)) return 'webp'
  if (contentType?.includes('image/jpeg') || /\.jpe?g(?:\?|$)/i.test(url)) return 'jpg'
  if (contentType?.includes('image/svg+xml') || /\.svg(?:\?|$)/i.test(url)) return 'svg'
  return 'png'
}

async function downloadIcon(item) {
  if (!item.sourceIconLink) return null

  try {
    const response = await fetch(item.sourceIconLink)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const extension = extensionFor(response.headers.get('content-type'), item.sourceIconLink)
    const fileName = `${item.id}.${extension}`
    const filePath = path.join(IMAGE_DIR, fileName)
    const buffer = Buffer.from(await response.arrayBuffer())
    await writeFile(filePath, buffer)
    return `items/${fileName}`
  } catch (error) {
    console.warn(`Icon skipped for ${item.shortName} (${item.id}): ${error.message}`)
    return null
  }
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++
      results[index] = await mapper(values[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker))
  return results
}

const selected = await fetchCatalog()

if (selected.length < 30) {
  throw new Error(`Only ${selected.length} allergy candidates found; refusing to publish a suspiciously small catalog`)
}

await rm(IMAGE_DIR, { recursive: true, force: true })
await mkdir(IMAGE_DIR, { recursive: true })

const withImages = await mapWithConcurrency(selected, 8, async (item) => ({
  ...item,
  imageLink: await downloadIcon(item),
}))

const items = withImages.map(({ sourceIconLink: _sourceIconLink, ...item }) => item)
const foodCount = items.filter((item) => item.category === 'food').length
const medicalCount = items.length - foodCount
const imageCount = items.filter((item) => item.imageLink).length
const syncedAt = new Date().toISOString()

const output = `import type { TarkovItem } from '../types'\n\n` +
  `// Generated by scripts/sync-items.mjs from json.tarkov.dev. Do not edit by hand.\n` +
  `export const catalogSyncedAt = ${JSON.stringify(syncedAt)}\n` +
  `export const items: TarkovItem[] = ${JSON.stringify(items, null, 2)}\n`

await writeFile(OUTPUT_FILE, output, 'utf8')

console.log(`Catalog synced: ${items.length} items (${foodCount} provisions, ${medicalCount} medical/injectors)`)
console.log(`Local icons: ${imageCount}/${items.length}`)
console.log(`Generated: ${OUTPUT_FILE}`)
