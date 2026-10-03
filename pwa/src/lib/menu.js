import { DIES } from './dates.js'
import { adults, nens } from './config.js'

export const CAT_MENJAR = [
  { id: 'esmorzar', nom: 'Esmorzars', icona: '🍎' },
  { id: 'sopar', nom: 'Sopars', icona: '🍽️' },
]

// Llista de plats per defecte (es pot editar i ampliar)
export const PLATS_DEFAULT = [
  // --- Esmorzars ---
  { id: 'm_poma', cat: 'esmorzar', nom: 'Poma', ingredients: [] },
  { id: 'm_raim', cat: 'esmorzar', nom: 'Raïm', ingredients: [] },
  { id: 'm_platan', cat: 'esmorzar', nom: 'Plàtan', ingredients: [] },
  { id: 'm_maduixes', cat: 'esmorzar', nom: 'Maduixes', ingredients: [] },
  { id: 'm_sindria', cat: 'esmorzar', nom: 'Síndria', ingredients: [] },
  { id: 'm_pistatxos', cat: 'esmorzar', nom: 'Pistatxos', ingredients: [] },
  { id: 'm_ametlles', cat: 'esmorzar', nom: 'Ametlles', ingredients: [] },
  { id: 'm_llonganissa', cat: 'esmorzar', nom: 'Llonganissa', ingredients: [] },
  { id: 'm_fuets', cat: 'esmorzar', nom: 'Fuets', ingredients: [] },
  { id: 'm_babybel', cat: 'esmorzar', nom: 'Babybel', ingredients: [] },
  { id: 'm_formatget', cat: 'esmorzar', nom: 'Formatget', ingredients: [] },
  { id: 'm_bocata_pernil', cat: 'esmorzar', nom: 'Bocata de pernil', ingredients: ['pa', 'pernil'] },
  { id: 'm_bocata_fuet', cat: 'esmorzar', nom: 'Bocata de fuet', ingredients: ['pa', 'fuet'] },
  { id: 'm_iogurt', cat: 'esmorzar', nom: 'Iogurt de beure', ingredients: [] },
  { id: 'm_galetes', cat: 'esmorzar', nom: 'Galetes salades', ingredients: [] },

  // --- Sopars ---
  { id: 'm_mandonguilles', cat: 'sopar', nom: 'Mandonguilles', ingredients: ['carn picada', 'ou', 'pa ratllat'] },
  { id: 'm_pure_carbassa', cat: 'sopar', nom: 'Puré de carbassa', ingredients: ['carbassa', 'patata'] },
  { id: 'm_pure_carbasso', cat: 'sopar', nom: 'Puré de carbassó', ingredients: ['carbassó', 'patata', 'ceba'] },
  { id: 'm_salsitxes', cat: 'sopar', nom: 'Salsitxes de pollastre', ingredients: ['salsitxes de pollastre'] },
  { id: 'm_pollastre', cat: 'sopar', nom: 'Pollastre a la planxa', ingredients: ['pollastre'] },
  { id: 'm_bikinis', cat: 'sopar', nom: 'Bikinis', ingredients: ['pa de motlle', 'formatge', 'pernil'] },
  { id: 'm_pa_tomaquet', cat: 'sopar', nom: 'Pa amb tomàquet i embotit', ingredients: ['pa', 'tomàquet', 'embotit'] },
  { id: 'm_pizza', cat: 'sopar', nom: 'Pizza', ingredients: ['massa de pizza', 'formatge', 'tomàquet'] },
  { id: 'm_hamburgueses', cat: 'sopar', nom: 'Hamburgueses', ingredients: ['hamburguesa', 'pa'] },
  { id: 'm_truita', cat: 'sopar', nom: 'Truita', ingredients: ['ous'] },
  { id: 'm_truita_patates', cat: 'sopar', nom: 'Truita de patates', ingredients: ['ous', 'patates'] },
  { id: 'm_amanida', cat: 'sopar', nom: 'Amanida de cogombre, tomàquet i tonyina', ingredients: ['cogombre', 'tomàquet', 'tonyina'] },
  { id: 'm_tortetes', cat: 'sopar', nom: 'Tortetes de pollastre', ingredients: ['pollastre'] },
]

// --- Biblioteca de plats editable (es guarda a config) ---

export function platsCataleg(cfg) {
  return cfg?.menjar?.length ? cfg.menjar : PLATS_DEFAULT
}

export function asseguraPlats(cfg) {
  if (!cfg.menjar?.length)
    cfg.menjar = PLATS_DEFAULT.map((p) => ({ ...p, ingredients: [...(p.ingredients ?? [])] }))
  return cfg
}

export function afegeixPlat(cfg, plat) {
  asseguraPlats(cfg).menjar.push(plat)
}

export function actualitzaPlat(cfg, id, canvis) {
  const p = asseguraPlats(cfg).menjar.find((x) => x.id === id)
  if (p) Object.assign(p, canvis)
}

export function esborraPlat(cfg, id) {
  asseguraPlats(cfg)
  cfg.menjar = cfg.menjar.filter((x) => x.id !== id)
}

export function personesMenu(cfg) {
  return [...adults(cfg), ...nens(cfg)]
}

// --- Menu setmanal ---

export function mealBuida() {
  return { tots: [], per: {} }
}

export function normalitzaMeal(m) {
  if (!m) return mealBuida()
  if (Array.isArray(m.tots) || m.per) return { tots: m.tots ?? [], per: m.per ?? {} }
  if (m.nom) return { tots: [{ nom: m.nom, ingredients: m.ingredients ?? [] }], per: {} }
  return mealBuida()
}

export function normalitzaDia(d) {
  return { esmorzar: normalitzaMeal(d?.esmorzar), sopar: normalitzaMeal(d?.sopar) }
}

export const MENU_DEFAULT = {
  dl: { esmorzar: { nom: 'Llet, cereals i fruita', ingredients: ['llet', 'cereals', 'fruita'] }, sopar: { nom: 'Truita i amanida', ingredients: ['ous', 'patates', 'enciam', 'tomàquet'] } },
  dt: { esmorzar: { nom: 'Torrades amb melmelada', ingredients: ['pa', 'melmelada', 'mantega'] }, sopar: { nom: 'Llenties estofades', ingredients: ['llenties', 'pastanaga', 'ceba', 'salsitxes'] } },
  dc: { esmorzar: { nom: 'Iogurt amb fruits secs', ingredients: ['iogurt', 'nous', 'ametlles'] }, sopar: { nom: 'Macarrons a la bolonyesa', ingredients: ['macarrons', 'carn picada', 'tomàquet', 'ceba'] } },
  dj: { esmorzar: { nom: 'Sandvitx de formatge', ingredients: ['pa de motlle', 'formatge'] }, sopar: { nom: 'Pollastre al forn amb verdures', ingredients: ['pollastre', 'carbassó', 'patates', 'ceba'] } },
  dv: { esmorzar: { nom: 'Fruita i galetes', ingredients: ['fruita', 'galetes'] }, sopar: { nom: 'Pizza casolana', ingredients: ['massa de pizza', 'formatge', 'tomàquet', 'pernil'] } },
  ds: { esmorzar: { nom: 'Esmorzar especial', ingredients: ['pa', 'xorico', 'meló'] }, sopar: { nom: 'Arròs de verdures', ingredients: ['arròs', 'verdures', 'brou'] } },
  dg: { esmorzar: { nom: 'Xocolata desfeta amb xurros', ingredients: ['xocolata', 'xurros'] }, sopar: { nom: 'Peix a la planxa amb amanida', ingredients: ['salmó', 'amanida'] } },
}

export function menuActual(menu) {
  const base = menu && Object.keys(menu).length ? menu : MENU_DEFAULT
  const out = {}
  for (const d of DIES) out[d] = normalitzaDia(base[d])
  return out
}

export function estatMeal(meal) {
  if (!meal) return 'buit'
  if (Object.values(meal.per ?? {}).some((a) => a?.length)) return 'diferent'
  if ((meal.tots ?? []).length) return 'igual'
  return 'buit'
}

export function platsPersona(meal, id) {
  if (id === 'tots') return meal?.tots ?? []
  return meal?.per?.[id]?.length ? meal.per[id] : (meal?.tots ?? [])
}

export function validar(menu) {
  const avisos = []
  for (const d of DIES) {
    const dia = menu?.[d] ?? {}
    for (const tipus of ['esmorzar', 'sopar']) {
      if (estatMeal(dia[tipus]) === 'buit') avisos.push(`${d}: falta ${tipus === 'esmorzar' ? "l'esmorzar" : 'el sopar'}`)
    }
  }
  return avisos
}

export function llistaCompra(menu, extra = []) {
  const compte = {}
  const afegir = (plats) => {
    for (const p of plats ?? []) {
      for (const ing of p.ingredients ?? []) compte[ing] = (compte[ing] ?? 0) + 1
    }
  }
  for (const d of DIES) {
    const dia = menu?.[d] ?? {}
    for (const tipus of ['esmorzar', 'sopar']) {
      const m = dia[tipus]
      if (!m) continue
      afegir(m.tots)
      for (const arr of Object.values(m.per ?? {})) afegir(arr)
    }
  }
  for (const ing of extra) compte[ing] = (compte[ing] ?? 0) + 1
  return compte
}
