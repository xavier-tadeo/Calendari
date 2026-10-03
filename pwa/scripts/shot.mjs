import { chromium } from 'playwright-core'

const exec = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const url = process.env.URL || 'http://localhost:4173/'

const events = [
  { id: 'a1', data: '2026-10-05', titol: 'Logopeda N1', tot_el_dia: false, hora_inici: '18:30', color: '#1f77b4' },
  { id: 'a2', data: '2026-10-05', titol: 'Compra setmana', tot_el_dia: true, color: '#2ca02c' },
  { id: 'a3', data: '2026-10-07', titol: 'Biblioteca', tot_el_dia: false, hora_inici: '17:00', color: '#ff7f0e' },
  { id: 'a4', data: '2026-10-08', titol: 'Training N1 i N2', tot_el_dia: false, hora_inici: '17:00', color: '#d62728' },
  { id: 'a5', data: '2026-10-08', titol: 'Piscina N2', tot_el_dia: false, hora_inici: '17:00', color: '#9467bd' },
  { id: 'a6', data: '2026-10-08', titol: 'Reunio cole', tot_el_dia: false, hora_inici: '19:30', color: '#7f7f7f' },
  { id: 'a7', data: '2026-10-12', titol: 'Festa', tot_el_dia: true, color: '#d62728' },
  { id: 'a8', data: '2026-10-18', titol: 'Bateig cosi', tot_el_dia: true, color: '#17becf' },
]

const browser = await chromium.launch({ executablePath: exec, headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await context.addInitScript(
  ([evs]) => {
    localStorage.setItem('familia:auth', '1')
    localStorage.setItem('familia:esdeveniments', JSON.stringify({ esdeveniments: evs }))
  },
  [events],
)
const page = await context.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.screenshot({ path: '/tmp/cal.png' })
const m = await page.evaluate(() => {
  const g = document.querySelector('.graella').getBoundingClientRect()
  const c = document.querySelector('.cella:not(.buit)').getBoundingClientRect()
  const chip = document.querySelector('.titol-ev')
  return {
    viewportH: window.innerHeight,
    gridBottom: Math.round(g.bottom),
    gridH: Math.round(g.height),
    cellH: Math.round(c.height),
    chipVisible: chip ? chip.getBoundingClientRect().width > 0 : false,
    chipText: chip ? chip.textContent : null,
  }
})
console.log(JSON.stringify(m))
await browser.close()
console.log('captura feta')
