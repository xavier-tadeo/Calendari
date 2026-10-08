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

// El pla per defecte va buit: seiem un parell de tasques com ho faria l'usuari
await page.evaluate(async () => {
  const r = await fetch('/config.default.json')
  const cfg = await r.json()
  cfg.plaSeed = 2
  cfg.tasques = [
    { id: 'super', nom: 'Comprar al super', dies: ['ds'], tipus: 'rotatiu', hora: '11:00', pes: 2 },
    {
      id: 'sopars',
      nom: 'Cuinar el sopar',
      dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'],
      tipus: 'rotatiu',
      hora: '20:00',
      pes: 2,
    },
    {
      id: 'neteja',
      nom: 'Netejar banys',
      dies: ['ds'],
      tipus: 'familia',
      hora: '10:00',
      pes: 3,
      freq: 'quinzenal',
      paritat: 0,
    },
    { id: 'deures', nom: 'Deures', dies: ['dl', 'dt', 'dc', 'dj'], tipus: 'rotatiu', hora: '17:30', pes: 2 },
  ]
  localStorage.setItem('familia:config', JSON.stringify(cfg))
})
await page.reload({ waitUntil: 'networkidle' })
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
await page.waitForTimeout(300)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Afegir al pla'), 'biblioteca: tria de dies en afegir')
await page.locator('.full', { hasText: 'Afegir al pla' }).getByText('Afegir', { exact: true }).click()
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

// editar una tasca de la biblioteca
await page.locator('.info').first().click()
await page.waitForTimeout(300)
log((await page.locator('#b-nom').count()) === 1, 'biblioteca: formulari d’edició')
await page.locator('#b-nom').fill('Tasca bib editada')
await page.getByText('Desar', { exact: true }).click()
await page.waitForTimeout(400)
const cfgEdit = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(
  (cfgEdit.biblioteca || []).some((t) => t.nom === 'Tasca bib editada'),
  'biblioteca: desa el nom editat',
)

// crear un subgrup
await page.getByText('＋ Subgrup').click()
await page.waitForTimeout(300)
await page.locator('#c-nom').fill('Prova grup')
await page.getByText('Desar', { exact: true }).click()
await page.waitForTimeout(400)
const cfgCat = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log((cfgCat.biblio_cats || []).some((c) => c.nom === 'Prova grup'), 'biblioteca: crea subgrup')

await page.locator('.full', { hasText: 'Biblioteca de tasques' }).locator('.boto.ghost', { hasText: '✕' }).first().click()
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

// --- Esforç de les tasques a Configuracio ---
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Esforç de les tasques'), 'config: secció d’esforç de tasques')
log((await page.locator('.fila-pes').count()) > 0, 'config: llista tasques amb pes')
await page.locator('.fila-pes').first().locator('.pes-xip').nth(2).click()
await page.waitForTimeout(400)
const cfgPes = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log((cfgPes.tasques || [])[0]?.pes === 3, 'config: desa el pes de la tasca')

// --- Menu ---
await page.getByText('Menú', { exact: true }).first().click()
await page.waitForTimeout(400)
log((await page.locator('.menjar').count()) >= 14, 'menu: 7 dies amb esmorzar i sopar')
log((await page.locator('.menjar.igual').count()) >= 1, 'menu: color verd quan tots igual')

await page.locator('.menjar .mini').first().click()
await page.waitForTimeout(300)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Igual per a tots'), 'menu: fitxa amb mode tots / per persona')
await page.getByText('Diferent per persona').click()
await page.waitForTimeout(300)
log((await page.locator('.persona').count()) >= 2, 'menu: opcions per persona')
await page.locator('.opcio-plat').first().click()
await page.waitForTimeout(300)
log((await page.locator('.triat').count()) >= 1, 'menu: selecciona un plat')
await page.getByText('Fet', { exact: true }).click()
await page.waitForTimeout(400)
log((await page.locator('.menjar.diferent').count()) >= 1, 'menu: color quan és diferent')
const menuSav = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:menu') || '{}'))
log(Object.keys(menuSav).length === 7, 'menu: desa al localStorage')

// --- Llista de plats ---
await page.getByText('📚 Plats').click()
await page.waitForTimeout(400)
log((await page.locator('.item').count()) > 0, 'plats: llista editable')
await page.getByText('Nou plat a').click()
await page.waitForTimeout(300)
await page.locator('#p-nom').fill('Prova plat')
await page.getByText('Desar', { exact: true }).click()
await page.waitForTimeout(400)
const cfgPlat = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log((cfgPlat.menjar || []).some((p) => p.nom === 'Prova plat'), 'plats: desa un plat nou')

// --- Extraescolars editables des de Configuracio ---
await page.mouse.click(8, 8)
await page.waitForTimeout(300)
await page.getByText('Config', { exact: true }).first().click()
await page.waitForTimeout(400)
log((await page.locator('.xip-resum').count()) >= 0, 'config: resum extraescolars')
await page.locator('.targeta', { hasText: 'Extraescolars' }).getByText('✏️ Editar').click()
await page.waitForTimeout(400)
log((await page.locator('.grup').count()) === 2, 'extra: agrupat per nina')
log((await page.locator('.item').count()) >= 1, 'extra: llistat de les extraescolars')

await page.getByText('Nova extraescolar').click()
await page.waitForTimeout(300)
await page.locator('#x-nom').fill('Prova extra')
await page.locator('#x-ini').fill('17:00')
await page.locator('#x-fi').fill('18:00')
await page.getByText('Desar', { exact: true }).click()
await page.waitForTimeout(400)
let cfgEx = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log((cfgEx.extraescolars || []).some((x) => x.nom === 'Prova extra'), 'extra: desa una nova')

// horari invalid -> no deixa desar
await page.getByText('Nova extraescolar').click()
await page.waitForTimeout(300)
await page.locator('#x-nom').fill('Xoco')
await page.locator('.full').last().getByText('Nena 2').click()
await page.locator('#x-ini').fill('17:30')
await page.locator('#x-fi').fill('17:45')
await page.locator('.full').last().getByText('Dijous').click()
await page.waitForTimeout(300)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Xoca amb'), 'extra: avisa de solapaments')
log(await page.getByText('Desar', { exact: true }).isDisabled(), 'extra: bloqueja desar si xoca')

// editar l existent
await page.mouse.click(8, 8)
await page.waitForTimeout(300)
await page.locator('.item .info').first().click()
await page.waitForTimeout(300)
await page.locator('#x-nom').fill('Logopeda editada')
await page.getByText('Desar', { exact: true }).click()
await page.waitForTimeout(400)
cfgEx = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(
  (cfgEx.extraescolars || []).some((x) => x.nom === 'Logopeda editada'),
  'extra: desa l’edició',
)

// esborrar
await page.locator('.item .info').first().click()
await page.waitForTimeout(300)
await page.locator('.full').last().getByText('🗑').click()
await page.waitForTimeout(400)
cfgEx = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(
  !(cfgEx.extraescolars || []).some((x) => x.nom === 'Logopeda editada'),
  'extra: esborrada',
)

// --- Horari dels adults ---
// si la mare encara no està definida, l'omplim automàticament (llançada del nuvol)
await page.evaluate(async () => {
  const cfg = JSON.parse(localStorage.getItem('familia:config'))
  delete cfg.horariSeed
  cfg.familia.adults[1].per_definir = true
  cfg.familia.adults[1].horari = { dl: { feina: [], lloc: '', fora: [] } }
  localStorage.setItem('familia:config', JSON.stringify(cfg))
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(900)
let cfgH = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(
  cfgH.familia?.adults?.[1]?.horari?.dt?.feina?.[0] === '08:30',
  'horari: omple el de la mare automàticament',
)
log(cfgH.familia?.adults?.[1]?.per_definir === false, 'horari: la mare ja no està per definir')

await page.getByText('Config', { exact: true }).first().click()
await page.waitForTimeout(400)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('08:30–16:30'), 'horari: resum de la jornada a la targeta')

await page.getByText('✏️ Editar').first().click()
await page.waitForTimeout(400)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Horari · Papa'), 'horari: obre l’editor')
await page.locator('#h-ini').fill('09:15')
await page.keyboard.press('Tab')
await page.waitForTimeout(700)
cfgH = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(cfgH.familia?.adults?.[0]?.horari?.dl?.feina?.[0] === '09:15', 'horari: desa l’edició')

await page.getByText('Copiar a DL–DV').click()
await page.waitForTimeout(700)
cfgH = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(
  cfgH.familia?.adults?.[0]?.horari?.dv?.feina?.[0] === '09:15',
  'horari: copia als dies feiners',
)

await page.getByText('Lliure', { exact: true }).click()
await page.waitForTimeout(700)
cfgH = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:config') || '{}'))
log(
  cfgH.familia?.adults?.[0]?.horari?.dl === undefined,
  'horari: marca un dia com a lliure',
)

// --- Llistes de la compra ---
await page.mouse.click(8, 8)
await page.waitForTimeout(400)
await page.getByText('Menú', { exact: true }).first().click()
await page.waitForTimeout(500)
text = await page.evaluate(() => document.body.innerText)
log(text.includes('Llistes de la compra'), 'compra: secció de llistes')
log(text.includes('De la setmana'), 'compra: llista automàtica del menú')
log((await page.locator('.llista-card').count()) >= 1, 'compra: targetes de les llistes')

await page.locator('.obre-llista').first().click()
await page.waitForTimeout(500)
log((await page.locator('.item').count()) >= 1, 'compra: obre el modal amb productes')
text = await page.evaluate(() => document.body.innerText)
log(text.includes('comprats'), 'compra: mostra el progrés')

await page.locator('.item').first().locator('.nom-item').click()
await page.waitForTimeout(800)
let comp = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:compra') || '{}'))
log(
  (comp.llistes || []).some((l) => (l.items ?? []).some((i) => i.comprat)),
  'compra: desa el producte tachat',
)

await page.locator('input[placeholder="Afegir producte..."]').fill('Prova compra')
await page.keyboard.press('Enter')
await page.waitForTimeout(800)
comp = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:compra') || '{}'))
log(
  (comp.llistes || []).some((l) => (l.items ?? []).some((i) => i.nom === 'Prova compra')),
  'compra: afegeix un producte',
)

const nComprats = Number((await page.evaluate(() => document.body.innerText)).match(/(\d+) comprats/)?.[1] ?? 0)
await page.getByRole('button', { name: /Netejar comprats/ }).click()
await page.waitForTimeout(800)
comp = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:compra') || '{}'))
log(
  (comp.llistes || []).every((l) => (l.items ?? []).every((i) => !i.comprat)),
  'compra: neteja els comprats',
)

await page.locator('.full').first().getByText('✕').click()
await page.waitForTimeout(400)
await page.getByText('＋ Nova llista').click()
await page.waitForTimeout(300)
await page.locator('#l-nom').fill('Farmàcia')
await page.getByText('Desar', { exact: true }).click()
await page.waitForTimeout(600)
comp = await page.evaluate(() => JSON.parse(localStorage.getItem('familia:compra') || '{}'))
log((comp.llistes ?? []).some((l) => l.nom === 'Farmàcia'), 'compra: crea una llista nova')
log((comp.llistes ?? []).length >= 2, 'compra: guarda més d’una llista')
log(nComprats > 0, 'compra: hi havia productes comprats')

await browser.close()
console.log('--- ERRORS JS ---')
console.log(errors.length ? errors.join('\n') : 'cap')
