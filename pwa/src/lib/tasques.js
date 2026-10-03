import { adults, nens } from './config.js'
import { diesSetmana, setmanaKey } from './dates.js'
import { esFestiu, festiu } from './festius.js'

export const TASQUES_DEFAULT = [
  { id: 'super', nom: 'Comprar al super', dies: ['ds'], tipus: 'rotatiu' },
  { id: 'esmorzars', nom: 'Preparar els esmorzars', dies: ['dl', 'dt', 'dc', 'dj', 'dv'], tipus: 'rotatiu' },
  { id: 'sopars', nom: 'Cuinar el sopar', dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'], tipus: 'rotatiu' },
  { id: 'portar_cole', nom: "Portar les nenes a l'escola", dies: ['dl', 'dt', 'dc', 'dj', 'dv'], tipus: 'escola' },
  { id: 'recollir_cole', nom: "Recollir les nenes de l'escola", dies: ['dl', 'dt', 'dc', 'dj', 'dv'], tipus: 'escola' },
  { id: 'dormir', nom: 'Posar les nenes a dormir', dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'], tipus: 'rotatiu' },
  { id: 'roba', nom: 'Rentar i plegar la roba', dies: ['dl', 'dj', 'ds'], tipus: 'rotatiu' },
  { id: 'neteja', nom: 'Netejar banys i cuina', dies: ['ds'], tipus: 'familia' },
  { id: 'brossa', nom: 'Treure la brossa i reciclatge', dies: ['dl', 'dj'], tipus: 'rotatiu' },
  { id: 'deures', nom: 'Deures / estudi amb les nenes', dies: ['dl', 'dt', 'dc', 'dj'], tipus: 'rotatiu' },
  { id: 'mascota', nom: 'Cuidar la mascota', dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'], tipus: 'rotatiu' },
]

export const TASQUES_NENES = [
  { id: 'llit', nom: 'Fer el llit', punts: 2, dies: ['dl', 'dt', 'dc', 'dj', 'dv'] },
  { id: 'habitacio', nom: "Recollir l'habitacio", punts: 3, dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds'] },
  { id: 'deures_nena', nom: 'Fer els deures', punts: 3, dies: ['dl', 'dt', 'dc', 'dj'] },
  { id: 'taula', nom: 'Parar / desparar la taula', punts: 2, dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'] },
  { id: 'dents', nom: "Rentar-se les dents", punts: 1, dies: ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'] },
]

const CAP_DE_SETMANA = new Set(['ds', 'dg'])
const HORA_ENTRADA = '08:45'
const HORA_SORTIDA = '17:00'

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

export function generateSetmana(cfg, dia) {
  const adultsList = adults(cfg)
  const nensList = nens(cfg)
  const week = setmanaKey(dia)
  const dies = diesSetmana(dia)
  const files = []
  const nAss = Object.fromEntries(adultsList.map((a) => [a.id, 0]))

  TASQUES_DEFAULT.forEach((t, idx) => {
    for (const d of t.dies) {
      const dataDia = dies[d]
      if (esFestiu(dataDia) && ['portar_cole', 'recollir_cole', 'deures'].includes(t.id)) continue
      let assignat
      let nota = ''
      if (t.tipus === 'escola') {
        const hora = t.id === 'portar_cole' ? HORA_ENTRADA : HORA_SORTIDA
        const [a, ok] = assignaEscola(adultsList, d, hora, nAss)
        assignat = a
        nAss[assignat] = (nAss[assignat] ?? 0) + 1
        nota = ok ? '' : "Cal organitzar-se (ningu lliure en aquesta hora)"
      } else if (t.tipus === 'familia') {
        assignat = 'familia'
        nota = 'Ho feu tots dos junts'
      } else {
        assignat = ownerRotatiu(adultsList, week, idx)
      }
      const f = festiu(dataDia)
      files.push({ task_id: t.id, nom: t.nom, dia: d, assignat, tipus: t.tipus, nota, festiu: f ? f.nom : null })
    }
  })

  for (const t of TASQUES_NENES) {
    for (const nen of nensList) {
      for (const d of t.dies) {
        if (CAP_DE_SETMANA.has(d) && t.id === 'deures_nena') continue
        files.push({ task_id: `${t.id}_${nen.id}`, nom: t.nom, dia: d, assignat: nen.id, tipus: 'nenes', punts: t.punts, nota: '' })
      }
    }
  }
  return files
}

export function tasquesDelDia(cfg, diaDate, diaKey) {
  return generateSetmana(cfg, diaDate).filter((f) => f.dia === diaKey)
}

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
