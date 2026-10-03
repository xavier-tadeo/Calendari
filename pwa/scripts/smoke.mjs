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

for (const pestanya of ['Setmana', 'Menú', 'Punts', 'Config']) {
  await page.getByText(pestanya, { exact: true }).first().click()
  await page.waitForTimeout(400)
  const t = await page.evaluate(() => document.body.innerText)
  log(t.length > 20, `pestanya ${pestanya} renderitza`)
}

await browser.close()
console.log('--- ERRORS JS ---')
console.log(errors.length ? errors.join('\n') : 'cap')
