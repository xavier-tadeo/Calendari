import { iso, parseISO } from './dates.js'

export const PALETA = [
  '#1f77b4', '#d62728', '#2ca02c', '#ff7f0e', '#9467bd',
  '#8c564b', '#e377c2', '#17becf', '#bcbd22', '#7f7f7f',
]

export const COLOR_NOMS = {
  '#1f77b4': 'Blau',
  '#d62728': 'Vermell',
  '#2ca02c': 'Verd',
  '#ff7f0e': 'Taronja',
  '#9467bd': 'Lila',
  '#8c564b': 'Marro',
  '#e377c2': 'Rosa',
  '#17becf': 'Turquesa',
  '#bcbd22': 'Verd oliva',
  '#7f7f7f': 'Gris',
}

export const COLOR_FESTIU = '#d32f2f'

export const RECURRENCIES = [
  { id: 'cap', nom: 'No es repeteix' },
  { id: 'diari', nom: 'Cada dia' },
  { id: 'setmanal', nom: 'Cada setmana' },
  { id: 'mensual', nom: 'Cada mes' },
]

export function nomColor(hex) {
  return COLOR_NOMS[hex] ?? hex
}

export function nouId() {
  return Math.random().toString(16).slice(2, 10)
}

function _data(ev) {
  return parseISO(ev?.data)
}

export function ocorre(ev, dia) {
  const inici = _data(ev)
  if (!inici || dia < new Date(inici.getFullYear(), inici.getMonth(), inici.getDate())) return false
  const fin = ev.fins ? parseISO(ev.fins) : null
  if (fin && dia > fin) return false
  const r = ev.recurrencia || 'cap'
  if (r === 'cap') return iso(dia) === iso(inici)
  if (r === 'diari') return true
  if (r === 'setmanal') return dia.getDay() === inici.getDay()
  if (r === 'mensual') {
    const ultim = new Date(dia.getFullYear(), dia.getMonth() + 1, 0).getDate()
    return dia.getDate() === Math.min(inici.getDate(), ultim)
  }
  return false
}

export function delDia(events, dia) {
  return (events || []).filter((e) => ocorre(e, dia))
}

export function ordenats(events) {
  return [...events].sort((a, b) => {
    const ta = a.tot_el_dia === false ? 1 : 0
    const tb = b.tot_el_dia === false ? 1 : 0
    if (ta !== tb) return ta - tb
    return (a.hora_inici || '00:00').localeCompare(b.hora_inici || '00:00')
  })
}

export function propers(events, dia, dies = 1) {
  const out = []
  for (let i = 0; i <= dies; i++) {
    const d = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + i)
    for (const e of delDia(events, d)) out.push({ dia: d, ev: e })
  }
  return out
}
