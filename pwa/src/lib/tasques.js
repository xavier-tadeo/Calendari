import { adults } from './config.js'
import { diesSetmana, setmanaKey, iso, pyWeekday, DIES } from './dates.js'
import { esFestiu, festiu } from './festius.js'

export const TASQUES_DEFAULT = [
  { id: 'super', nom: 'Comprar al super', dies: ['ds'], tipus: 'rotatiu', hora: '11:00' },
  { id: 'esmorzars', nom: 'Preparar els esmorzars', dies: ['dl', 'dt', 'dc', 'dj', 'dv'], tipus: 'rotatiu', hora: '07:30' },
  { id: 'sopars', nom: 'Cuinar el sopar', dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'], tipus: 'rotatiu', hora: '20:00' },
  { id: 'portar_cole', nom: "Portar les nenes a l'escola", dies: ['dl', 'dt', 'dc', 'dj', 'dv'], tipus: 'escola', hora: '08:45' },
  { id: 'recollir_cole', nom: "Recollir les nenes de l'escola", dies: ['dl', 'dt', 'dc', 'dj', 'dv'], tipus: 'escola', hora: '17:00' },
  { id: 'dormir', nom: 'Posar les nenes a dormir', dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'], tipus: 'rotatiu', hora: '21:00' },
  { id: 'roba', nom: 'Rentar i plegar la roba', dies: ['dl', 'dj', 'ds'], tipus: 'rotatiu', hora: '19:30' },
  { id: 'neteja', nom: 'Netejar banys i cuina', dies: ['ds'], tipus: 'familia', hora: '10:00' },
  { id: 'brossa', nom: 'Treure la brossa i reciclatge', dies: ['dl', 'dj'], tipus: 'rotatiu', hora: '21:15' },
  { id: 'deures', nom: 'Deures / estudi amb les nenes', dies: ['dl', 'dt', 'dc', 'dj'], tipus: 'rotatiu', hora: '17:30' },
  { id: 'mascota', nom: 'Cuidar la mascota', dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'], tipus: 'rotatiu', hora: '20:30' },
]

export const BLOCS = [
  { id: 'mati', nom: 'Matí', color: '#fff8e1' },
  { id: 'migdia', nom: 'Migdia', color: '#fff3e0' },
  { id: 'tarda', nom: 'Tarda', color: '#e8f5e9' },
  { id: 'nit', nom: 'Nit', color: '#eceff1' },
]

export function minut(hora) {
  if (!hora) return null
  const [h, m] = hora.split(':').map(Number)
  if (Number.isNaN(h)) return null
  return h * 60 + (m || 0)
}

export function blocDeHora(hora) {
  const t = minut(hora)
  if (t == null) return null
  if (t >= 300 && t < 720) return 'mati'
  if (t >= 720 && t < 900) return 'migdia'
  if (t >= 900 && t < 1200) return 'tarda'
  return 'nit'
}

export function ordenaHora(tasques) {
  return [...tasques].sort((a, b) => {
    const ha = minut(a.hora)
    const hb = minut(b.hora)
    if (ha == null && hb == null) return 0
    if (ha == null) return 1
    if (hb == null) return -1
    return ha - hb
  })
}

export function grupsDelDia(tasques) {
  const ordenades = ordenaHora(tasques)
  const out = []
  for (const b of BLOCS) {
    const list = ordenades.filter((t) => blocDeHora(t.hora) === b.id)
    if (list.length) out.push({ ...b, tasques: list })
  }
  const sense = ordenades.filter((t) => !t.hora)
  if (sense.length) out.push({ id: 'altres', nom: 'Sense hora', color: '#f4f4f5', tasques: sense })
  return out
}

export const TASQUES_NENES = [
  { id: 'llit', nom: 'Fer el llit', punts: 2, dies: ['dl', 'dt', 'dc', 'dj', 'dv'] },
  { id: 'habitacio', nom: "Recollir l'habitacio", punts: 3, dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds'] },
  { id: 'deures_nena', nom: 'Fer els deures', punts: 3, dies: ['dl', 'dt', 'dc', 'dj'] },
  { id: 'taula', nom: 'Parar / desparar la taula', punts: 2, dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'] },
  { id: 'dents', nom: "Rentar-se les dents", punts: 1, dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'] },
]

const HORA_ENTRADA = '08:45'
const HORA_SORTIDA = '17:00'
const SALTA_FESTIU = ['portar_cole', 'recollir_cole', 'deures']

function minuts(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function dins(finestra, hora) {
  if (!finestra || !finestra.length) return false
  return minuts(finestra[0]) <= minuts(hora) && minuts(hora) <= minuts(finestra[1])
}

export function disponible(adult, dia, hora) {
  const h = adult?.horari?.[dia] ?? {}
  return !dins(h.fora, hora)
}

function ownerRotatiu(list, week, idx) {
  if (!list.length) return 'familia'
  const num = parseInt(week.split('-W')[1], 10)
  return list[(num + idx) % list.length].id
}

function assignaEscola(list, dia, hora, nAss) {
  const lliures = list.filter((a) => disponible(a, dia, hora)).map((a) => a.id)
  if (!lliures.length) return [list[0]?.id ?? 'familia', false]
  lliures.sort((a, b) => (nAss[a] ?? 0) - (nAss[b] ?? 0))
  return [lliures[0], true]
}

// --- Pla habitual (config.tasques) ---

export function plaTasques(cfg) {
  const base = cfg?.tasques && cfg.tasques.length ? cfg.tasques : TASQUES_DEFAULT
  const perId = Object.fromEntries(TASQUES_DEFAULT.map((t) => [t.id, t.hora]))
  return base.map((t) => (t.hora === undefined && perId[t.id] ? { ...t, hora: perId[t.id] } : t))
}

export function asseguraPla(cfg) {
  if (!cfg.tasques) cfg.tasques = TASQUES_DEFAULT.map((t) => ({ ...t, dies: [...t.dies] }))
  return cfg.tasques
}

export function afegeixPla(cfg, tasca) {
  asseguraPla(cfg).push(tasca)
}

export function actualitzaPla(cfg, id, canvis) {
  const t = asseguraPla(cfg).find((x) => x.id === id)
  if (t) Object.assign(t, canvis)
}

export function esborraPla(cfg, id) {
  cfg.tasques = asseguraPla(cfg).filter((x) => x.id !== id)
}

export function fixaPersona(cfg, id, memberId) {
  const t = asseguraPla(cfg).find((x) => x.id === id)
  if (t) t.fix = memberId
}

// --- Generacio i overrides de la setmana ---

export function instanciaKey(taskId, dia) {
  return `${taskId}_${dia}`
}

export function generaPla(cfg, dia) {
  const adultsList = adults(cfg)
  const plan = plaTasques(cfg)
  const week = setmanaKey(dia)
  const dies = diesSetmana(dia)
  const out = []
  const nAss = Object.fromEntries(adultsList.map((a) => [a.id, 0]))

  plan.forEach((t, idx) => {
    for (const d of t.dies ?? []) {
      const dataDia = dies[d]
      if (!dataDia) continue
      if (esFestiu(dataDia) && SALTA_FESTIU.includes(t.id)) continue
      let assignat = 'familia'
      let nota = ''
      if (t.fix) {
        assignat = t.fix
      } else if (t.tipus === 'escola') {
        const hora = t.id === 'portar_cole' ? HORA_ENTRADA : HORA_SORTIDA
        const [a, ok] = assignaEscola(adultsList, d, hora, nAss)
        assignat = a
        nAss[assignat] = (nAss[assignat] ?? 0) + 1
        nota = ok ? '' : 'Cal organitzar-se (ningú lliure en aquesta hora)'
      } else if (t.tipus === 'familia') {
        assignat = 'familia'
        nota = 'Ho feu tots dos junts'
      } else {
        assignat = ownerRotatiu(adultsList, week, idx)
      }
      const f = festiu(dataDia)
      let hora = t.hora ?? null
      if (t.id === 'portar_cole' && cfg?.cole?.entrada) hora = cfg.cole.entrada
      if (t.id === 'recollir_cole' && cfg?.cole?.sortida) hora = cfg.cole.sortida
      out.push({
        key: instanciaKey(t.id, d),
        task_id: t.id,
        nom: t.nom,
        dia: d,
        data: iso(dataDia),
        hora,
        assignat,
        tipus: t.tipus,
        nota,
        festiu: f ? f.nom : null,
        fet: false,
        custom: false,
      })
    }
  })
  return out
}

export function tasquesSetmana(cfg, setmanes, dia) {
  const week = setmanaKey(dia)
  const sm = setmanes?.[week] ?? {}
  const instancies = generaPla(cfg, dia)

  for (const c of sm.custom ?? []) {
    for (const d of c.dies ?? []) {
      instancies.push({
        key: instanciaKey(c.id, d),
        task_id: c.id,
        nom: c.nom,
        dia: d,
        data: null,
        hora: c.hora ?? null,
        assignat: c.assignat || 'familia',
        tipus: 'custom',
        nota: c.nota ?? '',
        festiu: null,
        fet: false,
        custom: true,
      })
    }
  }

  const res = []
  for (const t of instancies) {
    if (sm.eliminats?.[t.key]) continue
    if (sm.assignat?.[t.key]) t.assignat = sm.assignat[t.key]
    t.fet = Boolean(sm.fet?.[t.key])
    res.push(t)
  }
  const ordre = Object.fromEntries(DIES.map((d, i) => [d, i]))
  res.sort((a, b) => ordre[a.dia] - ordre[b.dia])
  return res
}

export function tasquesDelDia(cfg, setmanes, diaDate) {
  const diaKey = DIES[pyWeekday(diaDate)]
  return tasquesSetmana(cfg, setmanes, diaDate).filter((t) => t.dia === diaKey)
}

// --- Avisos ---

export function solapamentsExtraescolars(cfg) {
  const avisos = []
  const ex = cfg?.extraescolars ?? []
  for (let i = 0; i < ex.length; i++) {
    for (let j = i + 1; j < ex.length; j++) {
      const a = ex[i]
      const b = ex[j]
      if (a.nina !== b.nina || a.dia !== b.dia) continue
      if (minuts(a.inici) < minuts(b.fi) && minuts(b.inici) < minuts(a.fi)) {
        avisos.push(`${a.nom} (${a.inici}-${a.fi}) xoca amb ${b.nom} (${b.inici}-${b.fi})`)
      }
    }
  }
  return avisos
}

export function resumAvisos(cfg) {
  const avisos = solapamentsExtraescolars(cfg)
  for (const a of adults(cfg)) {
    if (a.per_definir) avisos.push(`Falta definir l'horari de ${a.nom} (ara es considera lliure).`)
  }
  return avisos
}
