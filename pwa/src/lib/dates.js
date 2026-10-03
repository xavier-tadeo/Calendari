export const DIES = ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg']

export const DIES_NOM = {
  dl: 'Dilluns',
  dt: 'Dimarts',
  dc: 'Dimecres',
  dj: 'Dijous',
  dv: 'Divendres',
  ds: 'Dissabte',
  dg: 'Diumenge',
}

export const DIES_CURT = {
  dl: 'Dl',
  dt: 'Dt',
  dc: 'Dc',
  dj: 'Dj',
  dv: 'Dv',
  ds: 'Ds',
  dg: 'Dg',
}

export const MESOS_NOM = [
  'Gener', 'Febrer', 'Marc', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
]

const pad = (n) => String(n).padStart(2, '0')

export function iso(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISO(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function todayISO() {
  return iso(new Date())
}

// Python weekday(): 0 = dilluns ... 6 = diumenge
export function pyWeekday(d) {
  return (d.getDay() + 6) % 7
}

export function iniciSetmana(d) {
  const c = new Date(d)
  c.setDate(c.getDate() - pyWeekday(c))
  c.setHours(0, 0, 0, 0)
  return c
}

export function diesSetmana(d) {
  const dilluns = iniciSetmana(d)
  const out = {}
  DIES.forEach((k, i) => {
    const x = new Date(dilluns)
    x.setDate(dilluns.getDate() + i)
    out[k] = x
  })
  return out
}

export function setmanaKey(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)
  const week = 1 + Math.round((date - firstThursday) / (7 * 24 * 3600 * 1000))
  return `${date.getUTCFullYear()}-W${pad(week)}`
}

export function nomMes(any, mes) {
  return `${MESOS_NOM[mes - 1]} ${any}`
}

export function graellaMes(any, mes) {
  const primer = new Date(any, mes - 1, 1)
  const ultim = new Date(any, mes, 0)
  const files = []
  let setmana = new Array(7).fill(null)
  for (let dia = 1; dia <= ultim.getDate(); dia++) {
    const d = new Date(any, mes - 1, dia)
    const idx = pyWeekday(d)
    if (idx === 0 && setmana.some((x) => x !== null)) {
      files.push(setmana)
      setmana = new Array(7).fill(null)
    }
    setmana[idx] = d
    if (idx === 6) {
      files.push(setmana)
      setmana = new Array(7).fill(null)
    }
  }
  if (setmana.some((x) => x !== null)) files.push(setmana)
  return files
}

export function afegeixMesos(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, d.getDate())
}

export function addDies(d, n) {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

export function dataCurta(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

export function diesEntre(a, b) {
  const ms = new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())
  return Math.round(ms / 86400000)
}
