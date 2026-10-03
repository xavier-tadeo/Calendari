import { chromium } from 'playwright-core'

const exec = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const url = process.env.URL || 'http://localhost:4173/'

const errors = []
const log = (ok, msg) => console.log(`${ok ? 'OK ' : 'NO '} ${msg}`)

const browser = await chromium.launch({ executablePath: exec, headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
await context.addInitScript(() => localStorage.setItem('familia:auth', '1'))
const page = await context.newPage()
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
let text = await page.evaluate(() => document.body.innerText)
log(text.includes('Octubre') || /\d{4}/.test(text), 'calendari amb mes')

await page.locator('.cella:not(.buit)').first().click()
await page.waitForTimeout(400)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Esdeveniments'), 'obre el resum del dia')
log(text.includes('Tasques de casa'), 'mostra les tasques del dia')

await page.getByText('＋ Afegir').click()
await page.waitForTimeout(400)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Nou esdeveniment'), 'obre el formulari')

await page.locator('#titol').fill('Prova smoke')
await page.getByText('Desar').click()
await page.waitForTimeout(500)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Prova smoke'), 'desa i mostra esdeveniment')

const guardat = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('familia:esdeveniments') || '{}'),
)
log((guardat.esdeveniments || []).some((e) => e.titol === 'Prova smoke'), 'persisteix a localStorage')

await page.mouse.click(8, 8)
await page.waitForTimeout(300)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Prova smoke'), 'text del event a la graella')
log((await page.locator('.titol-ev').count()) >= 1, 'xip de text .titol-ev present')

for (const pestanya of ['Setmana', 'Menú', 'Punts', 'Config']) {
  await page.getByText(pestanya, { exact: true }).first().click()
  await page.waitForTimeout(400)
  const t = await page.evaluate(() => document.body.innerText)
  log(t.length > 20, `pestanya ${pestanya} renderitza`)
}

// --- Edició de la setmana ---
await page.getByText('Setmana', { exact: true }).first().click()
await page.waitForTimeout(400)
log((await page.locator('.tasca').count()) > 0, 'setmana: mostra tasques')
log((await page.locator('.bloc-nom').count()) > 0, 'setmana: franges horàries')
const hores = await page.locator('.bloc').first().locator('.hora').allInnerTexts()
log(
  hores.length >= 1 && hores.every((h, i) => i === 0 || hores[i - 1] <= h),
  'setmana: tasques ordenades per hora',
)

await page.locator('.tasca .obre').first().click()
await page.waitForTimeout(300)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Qui ho fa'), 'setmana: fitxa de tasca')
log(text.includes('Marcar com a feta'), 'setmana: acció marcar feta')

await page.locator('.opcio').nth(1).click()
await page.waitForTimeout(300)
await page.getByText('Marcar com a feta').click()
await page.waitForTimeout(400)
const sm = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:setmanes') || '{}'))
const weeks = Object.values(sm)
log(weeks.some((w) => Object.keys(w.assignat || {}).length > 0), 'setmana: desa reasignació')
log(weeks.some((w) => Object.keys(w.fet || {}).length > 0), 'setmana: desa "feta"')

await page.mouse.click(8, 8)
await page.waitForTimeout(300)

await page.getByText('＋ Nota').first().click()
await page.waitForTimeout(300)
await page.locator('#nota').fill('Nota smoke')
await page.getByText('Desar').click()
await page.waitForTimeout(400)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Nota smoke'), 'setmana: desa nota del dia')

await page.getByText('＋ Tasca').first().click()
await page.waitForTimeout(300)
await page.locator('#tasca-nom').fill('Tasca smoke')
await page.locator('input[type=checkbox]').uncheck()
await page.getByText('Desar').click()
await page.waitForTimeout(400)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Tasca smoke'), 'setmana: afegeix tasca puntual')

// --- Repartiment i biblioteca ---
log((await page.locator('.carrega').count()) >= 2, 'setmana: barres de repartiment per adult')
log(text.includes('Repartiment de la setmana'), 'setmana: resum de repartiment')

await page.getByText('Afegir de la biblioteca').click()
await page.waitForTimeout(400)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Biblioteca de tasques'), 'biblioteca: s’obre')
log((await page.locator('.item').count()) > 0, 'biblioteca: llista tasques de la categoria')
await page.locator('.item .boto', { hasText: 'Afegir' }).first().click()
await page.waitForTimeout(400)
const cfgBib = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(
  (cfgBib.tasques || []).some((t) => String(t.id).startsWith('b_')),
  'biblioteca: desa tasca al pla',
)
log(
  (await page.locator('.item .boto', { hasText: 'Traure' }).count()) > 0,
  'biblioteca: marca la tasca com afegida',
)
await page.locator('.full .boto.ghost', { hasText: '✕' }).first().click()
await page.waitForTimeout(300)

// --- Recurrència al formulari ---
await page.getByText('＋ Tasca').first().click()
await page.waitForTimeout(300)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Repetició'), 'formulari: selector de repetició')
await page.getByText('Un cop al mes').click()
await page.waitForTimeout(200)
log((await page.locator('#tasca-dia-mes').count()) === 1, 'formulari: camp dia del mes')
await page.getByText('Cancel·lar').click()
await page.waitForTimeout(300)

// --- Reassignació ràpida des del calendari ---
await page.getByText('Calendari', { exact: true }).first().click()
await page.waitForTimeout(400)
await page.locator('.cella:has(.avui-num)').first().click()
await page.waitForTimeout(400)
const qui = page.locator('.qui').first()
log((await qui.count()) > 0, 'calendari: botó de persona a les tasques')
await qui.click()
await page.waitForTimeout(200)
log((await page.locator('.opcio').count()) > 0, 'calendari: desplega opcions de persona')
await page.locator('.opcio').nth(1).click()
await page.waitForTimeout(400)
const sm2 = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:setmanes') || '{}'))
log(
  Object.values(sm2).some((w) => Object.keys(w.assignat || {}).length > 0),
  'calendari: desa la nova persona',
)
log((await page.locator('.opcio').count()) === 0, 'calendari: tanca opcions en triar')

// --- Color dels membres ---
await page.mouse.click(8, 8)
await page.waitForTimeout(300)
await page.getByText('Config', { exact: true }).first().click()
await page.waitForTimeout(400)
log((await page.locator('.mostra').count()) > 0, 'config: selector de color')
await page.locator('.mostra').nth(1).click()
await page.waitForTimeout(400)
const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(cfg?.familia?.adults?.[0]?.color === '#d62728', 'config: desa el color')

await browser.close()
console.log('--- ERRORS JS ---')
console.log(errors.length ? errors.join('\n') : 'cap')
