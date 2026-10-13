import { llistaCompra } from './menu.js'

export const CATS_DEFAULT = [
  { id: 'fruta', nom: 'Fruita i verdura', icona: '🥬' },
  { id: 'lactics', nom: 'Làctics i ous', icona: '🥛' },
  { id: 'carn', nom: 'Carn i peix', icona: '🥩' },
  { id: 'pa', nom: 'Pa i forn', icona: '🥖' },
  { id: 'rebost', nom: 'Rebost', icona: '🥫' },
  { id: 'begudes', nom: 'Begudes', icona: '🧃' },
  { id: 'neteja', nom: 'Neteja i hogar', icona: '🧼' },
  { id: 'farma', nom: 'Farmàcia', icona: '💊' },
  { id: 'altres', nom: 'Altres', icona: '🧺' },
]

export const LLISTA_MENU = 'l_menu'
export const CAT_ALTRES = 'altres'

export const rid = (p = 'c') => p + Math.random().toString(16).slice(2, 9)

export const norm = (s) => String(s ?? '').trim().toLowerCase()
export const mateixNom = (a, b) => norm(a) === norm(b)
export const ordena = (arr, clau = 'nom') =>
  [...arr].sort((a, b) => String(a[clau] ?? '').localeCompare(String(b[clau] ?? ''), 'ca'))

export function catsDe(compra) {
  const l = compra?.cats
  return Array.isArray(l) && l.length ? l : CATS_DEFAULT
}

export function llistesDe(compra) {
  return compra?.llistes ?? []
}

export function llistaDe(compra, id) {
  return llistesDe(compra).find((l) => l.id === id) ?? null
}

// Llistes per mostrar: la automàtica primer, la resta per ordre alfabètic
export function llistesOrdenades(compra) {
  const l = llistesDe(compra)
  const auto = l.filter((x) => x.automatica)
  return [...auto, ...ordena(l.filter((x) => !x.automatica))]
}

export function catDe(compra, id) {
  return catsDe(compra).find((c) => c.id === id) ?? CATS_DEFAULT[CATS_DEFAULT.length - 1]
}

export function compraDefault() {
  return {
    cats: CATS_DEFAULT.map((c) => ({ ...c })),
    productes: [],
    exclous: [],
    llistes: [
      {
        id: LLISTA_MENU,
        nom: 'De la setmana',
        icona: '🛒',
        automatica: true,
        items: [],
      },
    ],
  }
}

// --- Productes que no tornen (exclosos de la llista automàtica) ---

export function registraExclous(compra, nom) {
  const n = norm(nom)
  if (!n) return
  compra.exclous ??= []
  if (!compra.exclous.includes(n)) compra.exclous.push(n)
}

export function treuExclous(compra, nom) {
  if (!compra?.exclous) return
  const i = compra.exclous.indexOf(norm(nom))
  if (i >= 0) compra.exclous.splice(i, 1)
}

export function esExclous(compra, nom) {
  return (compra?.exclous ?? []).includes(norm(nom))
}

// --- Llistes ---

export function afegeixLlista(compra, nom, icona = '📝') {
  const l = { id: rid('l'), nom: nom.trim(), icona, automatica: false, items: [] }
  compra.llistes ??= []
  compra.llistes.push(l)
  return l
}

export function esborraLlista(compra, id) {
  const l = llistaDe(compra, id)
  if (!l || l.automatica) return
  compra.llistes = llistesDe(compra).filter((x) => x.id !== id)
}

// --- Items ---

export function afegeixItem(ll, dades) {
  const it = { id: rid('i'), nom: '', quantitat: '', cat: CAT_ALTRES, comprat: false, origen: 'manual', ...dades }
  ll.items ??= []
  ll.items.push(it)
  return it
}

export function actualitzaItem(ll, id, canvis, compra = null) {
  const it = (ll.items ?? []).find((x) => x.id === id)
  if (!it) return
  const canviaNom = canvis.nom !== undefined && canvis.nom !== it.nom
  if (canviaNom && it.origen === 'menu' && compra) registraExclous(compra, it.nom)
  Object.assign(it, canvis)
  if (canviaNom && it.origen === 'menu') it.origen = 'manual'
}

export function esborraItem(ll, id, compra = null) {
  const it = (ll.items ?? []).find((x) => x.id === id)
  if (it?.origen === 'menu' && compra) registraExclous(compra, it.nom)
  ll.items = (ll.items ?? []).filter((x) => x.id !== id)
}

export function netejaComprats(ll) {
  const abans = (ll.items ?? []).length
  ll.items = (ll.items ?? []).filter((x) => !x.comprat)
  return abans - ll.items.length
}

export function comptatge(ll) {
  const items = ll?.items ?? []
  const comprats = items.filter((i) => i.comprat).length
  return { total: items.length, comprats, pct: items.length ? Math.round((comprats / items.length) * 100) : 0 }
}

// Items agrupats per categoria, en l'ordre de les categories (les desconegudes a "altres")
export function itemsPerCategoria(ll, compra) {
  const cats = catsDe(compra)
  const groups = cats.map((c) => ({ cat: c, items: [] }))
  const index = Object.fromEntries(cats.map((c, i) => [c.id, i]))
  const ultim = index[CAT_ALTRES] ?? cats.length - 1
  for (const it of ll?.items ?? []) {
    groups[index[it.cat] ?? ultim].items.push(it)
  }
  for (const g of groups) g.items = ordena(g.items)
  return groups.filter((g) => g.items.length)
}

// --- Catàleg de productes desats ---

export function productesDe(compra) {
  return compra?.productes ?? []
}

export function desaProducte(compra, nom, cat = CAT_ALTRES) {
  const n = String(nom ?? '').trim()
  if (!n) return null
  compra.productes ??= []
  const trobat = compra.productes.find((p) => mateixNom(p.nom, n))
  if (trobat) return trobat
  const p = { id: rid('p'), nom: n, cat: catsDe(compra).some((c) => c.id === cat) ? cat : CAT_ALTRES }
  compra.productes.push(p)
  return p
}

export function actualitzaProducte(compra, id, canvis) {
  const p = productesDe(compra).find((x) => x.id === id)
  if (p) Object.assign(p, canvis)
}

export function esborraProducte(compra, id) {
  compra.productes = productesDe(compra).filter((x) => x.id !== id)
}

export function productesPerCategoria(compra) {
  const cats = catsDe(compra)
  const groups = cats.map((c) => ({ cat: c, items: [] }))
  const index = Object.fromEntries(cats.map((c, i) => [c.id, i]))
  const ultim = index[CAT_ALTRES] ?? cats.length - 1
  for (const p of productesDe(compra)) {
    groups[index[p.cat] ?? ultim].items.push(p)
  }
  for (const g of groups) g.items = ordena(g.items)
  return groups.filter((g) => g.items.length)
}

// --- Categories ---

export function afegeixCat(compra, nom, icona = '🏷️') {
  compra.cats ??= CATS_DEFAULT.map((c) => ({ ...c }))
  const existent = compra.cats.find((c) => c.nom.toLowerCase() === nom.trim().toLowerCase())
  if (existent) return existent.id
  const id = rid('k')
  const lloc = compra.cats.find((c) => c.id === CAT_ALTRES)
  const nova = { id, nom: nom.trim(), icona }
  if (lloc) compra.cats.splice(compra.cats.indexOf(lloc), 0, nova)
  else compra.cats.push(nova)
  return id
}

export function actualitzaCat(compra, id, nom) {
  const c = catsDe(compra).find((x) => x.id === id)
  if (c && nom.trim()) c.nom = nom.trim()
}

export function esborraCat(compra, id) {
  if (id === CAT_ALTRES) return
  const cats = catsDe(compra)
  if (!cats.some((c) => c.id === id)) return
  compra.cats = cats.filter((c) => c.id !== id)
  for (const l of llistesDe(compra)) {
    for (const it of l.items ?? []) if (it.cat === id) it.cat = CAT_ALTRES
  }
}

// --- Llista automàtica generada del menú ---

const REGLES = [
  [/(tom|patat|ceba|pastanag|carbass|cogombre|llett|espinac|pebre|alberg|monget|poma|pl[aà]tan|taron|llim[oó]|maduix|s[ií]ndria|mel[oó]|banana|kiwi)/i, 'fruta'],
  [/(llet|iogur|formatg|manteg|ous|nata|crema)/i, 'lactics'],
  [/(pollastre|vedell|carn|bacall|salm[oó]|talla|llom|cansalad|muslo|gallina)/i, 'carn'],
  [/(^pa |^pa$|pa de|croissant|baguette|coca|barreta)/i, 'pa'],
  [/(arr[oò]s|macarr|pasta|lentill|cigron|oli|sal |sucre|farina|caf|cereal|galet|t[oò]nyina|thonyina|conserva|sopa|especi)/i, 'rebost'],
  [/(aigua|suc |^vi |cerves|refr|gasosa|beguda|llimonad)/i, 'begudes'],
  [/(detergent|sab[oó]|paper|raspall|netej|lleixiu|esponja|bols|sac |xamp|plat |desengr|amoni)/i, 'neteja'],
  [/(paracetamol|ibuprof|farm|vitamin|comprim|tirita|gasosa de|locion|protector)/i, 'farma'],
]

export function catPerNom(compra, nom) {
  for (const [re, cat] of REGLES) if (re.test(nom) && catsDe(compra).some((c) => c.id === cat)) return cat
  return CAT_ALTRES
}

export function sincronitzaMenu(compra, menu) {
  const l = llistesDe(compra).find((x) => x.automatica)
  if (!l || !menu) return false
  const compte = llistaCompra(menu)
  const noms = new Set(Object.keys(compte))
  l.items ??= []
  let canvi = false

  const abans = l.items.length
  l.items = l.items.filter((it) => it.origen !== 'menu' || noms.has(it.nom))
  if (l.items.length !== abans) canvi = true

  for (const [nom, n] of Object.entries(compte)) {
    const existent = l.items.find((it) => it.nom === nom)
    const q = n > 1 ? `×${n}` : ''
    if (!existent) {
      if (esExclous(compra, nom)) continue
      l.items.push({
        id: rid('i'),
        nom,
        quantitat: q,
        cat: catPerNom(compra, nom),
        comprat: false,
        origen: 'menu',
      })
      canvi = true
    } else if (existent.origen === 'menu' && existent.quantitat !== q) {
      existent.quantitat = q
      canvi = true
    }
  }
  return canvi
}

export function asseguraCompra(compra, menu) {
  const c = compra && Array.isArray(compra.llistes) ? compra : compraDefault()
  if (!Array.isArray(c.cats) || !c.cats.length) c.cats = CATS_DEFAULT.map((x) => ({ ...x }))
  if (!Array.isArray(c.exclous)) c.exclous = []
  if (!c.llistes.some((l) => l.automatica)) {
    c.llistes.unshift({ id: LLISTA_MENU, nom: 'De la setmana', icona: '🛒', automatica: true, items: [] })
  }
  sincronitzaMenu(c, menu)
  if (!Array.isArray(c.productes)) {
    const auto = c.llistes.find((l) => l.automatica)
    c.productes = []
    for (const it of auto?.items ?? []) desaProducte(c, it.nom, it.cat)
  }
  return c
}
