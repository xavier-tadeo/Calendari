import { adults } from './config.js'
import { diesSetmana, setmanaKey, iso, pyWeekday, DIES } from './dates.js'
import { esFestiu, festiu } from './festius.js'

// El pla es crea de zero: la llista de tasques per defecte és buida
export const TASQUES_DEFAULT = []

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

export function setmanaNum(dia) {
  return parseInt(setmanaKey(dia).split('-W')[1], 10)
}

// freq: 'setmanal' (per defecte) | 'quinzenal' (paritat 0=parell, 1=senar) | 'mensual' (dia_mes 1-28)
export function tocaSetmana(t, dia) {
  const freq = t.freq ?? 'setmanal'
  if (freq === 'quinzenal') return setmanaNum(dia) % 2 === (t.paritat ?? 0)
  return freq !== 'mensual'
}

function ownerRotatiu(list, week, idx, dia, hora, carrega) {
  if (!list.length) return 'familia'
  const disponibles = hora ? list.filter((a) => disponible(a, dia, hora)) : list
  const pool = disponibles.length ? disponibles : list
  const min = Math.min(...pool.map((a) => carrega[a.id] ?? 0))
  const candidats = pool.filter((a) => (carrega[a.id] ?? 0) === min)
  const num = parseInt(week.split('-W')[1], 10)
  return candidats[(num + idx) % candidats.length].id
}

function assignaEscola(list, dia, hora, carrega) {
  const lliures = list.filter((a) => disponible(a, dia, hora)).map((a) => a.id)
  if (!lliures.length) return [list[0]?.id ?? 'familia', false]
  lliures.sort((a, b) => (carrega[a] ?? 0) - (carrega[b] ?? 0))
  return [lliures[0], true]
}

// --- Pla habitual (config.tasques) ---

export function plaTasques(cfg) {
  const base = cfg?.tasques ?? TASQUES_DEFAULT
  const perHora = Object.fromEntries(TASQUES_DEFAULT.map((t) => [t.id, t.hora]))
  const perPes = Object.fromEntries(TASQUES_DEFAULT.map((t) => [t.id, t.pes]))
  return base.map((t) => ({
    pes: 2,
    ...t,
    ...(t.hora === undefined && perHora[t.id] ? { hora: perHora[t.id] } : {}),
    ...(t.pes === undefined && perPes[t.id] ? { pes: perPes[t.id] } : {}),
  }))
}

// Puja a 2 per buidar el pla: torna a sembrar TASQUES_DEFAULT i neteja
// les assignacions/tasques antigues de cada setmana.
export const PLA_SEED = 2

export function asseguraPla(cfg) {
  if (cfg.plaSeed !== PLA_SEED) {
    cfg.tasques = TASQUES_DEFAULT.map((t) => ({ ...t, dies: [...t.dies] }))
    cfg.plaSeed = PLA_SEED
  }
  return cfg.tasques
}

export function netejaPla(setmanes) {
  for (const w of Object.values(setmanes ?? {})) {
    delete w.assignat
    delete w.fet
    delete w.eliminats
    delete w.custom
  }
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
  const carrega = Object.fromEntries(adultsList.map((a) => [a.id, 0]))

  function afegeixInstancia(t, d, idx) {
    const dataDia = dies[d]
    if (!dataDia) return
    if (esFestiu(dataDia) && (SALTA_FESTIU.includes(t.id) || t.tipus === 'escola')) return
    const pes = t.pes ?? 2
    let hora = t.hora ?? null
    if (t.id === 'portar_cole' && cfg?.cole?.entrada) hora = cfg.cole.entrada
    if (t.id === 'recollir_cole' && cfg?.cole?.sortida) hora = cfg.cole.sortida
    let assignat = 'familia'
    let nota = ''
    if (t.fix) {
      assignat = t.fix
    } else if (t.tipus === 'escola') {
      const [a, ok] = assignaEscola(adultsList, d, hora, carrega)
      assignat = a
      nota = ok ? '' : 'Cal organitzar-se (ningú lliure en aquesta hora)'
    } else if (t.tipus === 'familia') {
      assignat = 'familia'
      nota = 'Ho feu tots dos junts'
    } else {
      assignat = ownerRotatiu(adultsList, week, idx, d, hora, carrega)
    }
    if (carrega[assignat] !== undefined) carrega[assignat] += pes
    const f = festiu(dataDia)
    out.push({
      key: instanciaKey(t.id, d),
      task_id: t.id,
      nom: t.nom,
      dia: d,
      data: iso(dataDia),
      hora,
      assignat,
      tipus: t.tipus,
      pes,
      nota,
      festiu: f ? f.nom : null,
      fet: false,
      custom: false,
    })
  }

  plan.forEach((t, idx) => {
    const freq = t.freq ?? 'setmanal'
    if (freq === 'mensual') {
      const d = DIES.find((x) => dies[x]?.getDate() === t.dia_mes)
      if (d) afegeixInstancia(t, d, idx)
      return
    }
    if (!tocaSetmana(t, dia)) return
    for (const d of t.dies ?? []) afegeixInstancia(t, d, idx)
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
        pes: c.pes ?? 2,
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

// Repartiment de carrega de la setmana (compte + pes d'esforc)
export function balancSetmana(cfg, setmanes, diaDate) {
  const adultsList = adults(cfg)
  const inst = tasquesSetmana(cfg, setmanes, diaDate)
  const per = Object.fromEntries(
    adultsList.map((a) => [a.id, { id: a.id, nom: a.nom, color: a.color, count: 0, pes: 0, fet: 0 }]),
  )
  const total = { count: 0, pes: 0, fet: 0 }
  for (const t of inst) {
    const pes = t.pes ?? 2
    total.count++
    total.pes += pes
    if (t.fet) total.fet++
    const a = per[t.assignat]
    if (a) {
      a.count++
      a.pes += pes
      if (t.fet) a.fet++
    }
  }
  const adultsBalanc = adultsList.map((a) => per[a.id])
  const maxPes = Math.max(1, ...adultsBalanc.map((a) => a.pes))
  return { adults: adultsBalanc, total, maxPes }
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
