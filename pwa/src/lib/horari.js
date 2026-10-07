import { DIES, DIES_NOM, DIES_CURT } from './dates.js'

export const LLOCS = [
  { id: 'oficina', nom: 'Oficina' },
  { id: 'teletreball', nom: 'Teletreball' },
  { id: null, nom: 'No especificat' },
]

function minuts(hhmm) {
  if (!hhmm) return null
  const [h, m] = String(hhmm).split(':').map(Number)
  if (Number.isNaN(h)) return null
  return h * 60 + (m || 0)
}

export function diaDe(adult, dia) {
  return adult?.horari?.[dia] ?? null
}

// Omple l'horari de la mare un sol cop, només si encara no està definit
export const HORARI_SEED = 1

export function asseguraHorari(cfg) {
  if (cfg.horariSeed === HORARI_SEED) return false
  cfg.horariSeed = HORARI_SEED
  const mama = (cfg?.familia?.adults ?? []).find((a) => a.id === 'mama')
  if (!mama?.per_definir) return false
  const oficina = (ini, fi) => ({ feina: [ini, fi], lloc: 'oficina', fora: [ini, fi] })
  const horari = {
    dl: oficina('08:30', '16:30'),
    dt: oficina('08:30', '16:30'),
    dc: oficina('08:30', '16:30'),
    dj: oficina('08:30', '16:30'),
    dv: oficina('08:30', '18:00'),
  }
  mama.horari = { ...(mama.horari ?? {}), ...horari }
  mama.per_definir = false
  return true
}

export function esLaborable(adult, dia) {
  return Boolean(adult?.horari?.[dia])
}

export function validRang(ini, fi) {
  const a = minuts(ini)
  const b = minuts(fi)
  return a != null && b != null && b > a
}

// Crea / actualitza el dia mantenint sempre la forma del model
export function setDia(adult, dia, dades) {
  adult.horari ??= {}
  adult.horari[dia] = { ...adult.horari[dia], ...dades }
}

export function esborraDia(adult, dia) {
  if (adult.horari) delete adult.horari[dia]
}

export function copiaDies(adult, origen, destins) {
  const base = diaDe(adult, origen)
  if (!base) return
  for (const d of destins) if (d !== origen) setDia(adult, d, { ...base })
}

export const DIES_LABORABLES = ['dl', 'dt', 'dc', 'dj', 'dv']

function rangSetmana(dies) {
  if (dies.length === 1) return DIES_NOM[dies[0]]
  return `${DIES_CURT[dies[0]]}–${DIES_CURT[dies[dies.length - 1]]}`
}

function textDia(h) {
  if (!h) return 'lliure'
  const bits = []
  if (h.feina?.length === 2) bits.push(`${h.feina[0]}–${h.feina[1]}`)
  if (h.lloc) bits.push(h.lloc)
  if (h.fora?.length === 2) bits.push(`fora ${h.fora[0]}–${h.fora[1]}`)
  return bits.join(' · ') || 'lliure'
}

// Resum agrupat de dies amb el mateix horari: [{ dies: 'Dl–Dv', text: '...' }]
export function resumHorari(adult) {
  const grup = []
  for (const d of DIES) {
    const text = textDia(diaDe(adult, d))
    const ultim = grup[grup.length - 1]
    if (ultim && ultim.text === text) ultim.days.push(d)
    else grup.push({ text, days: [d] })
  }
  const out = []
  for (const g of grup) out.push({ dies: rangSetmana(g.days), text: g.text, days: g.days })
  // els dies lliures no aclareixen la targeta si hi ha almenys un de laborable
  if (out.length > 1 && out.some((r) => r.text !== 'lliure')) {
    return out.filter((r) => r.text !== 'lliure')
  }
  return out
}
