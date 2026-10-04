import { DIES } from './dates.js'
import { nens } from './config.js'

function minuts(hhmm) {
  if (!hhmm) return null
  const [h, m] = String(hhmm).split(':').map(Number)
  if (Number.isNaN(h)) return null
  return h * 60 + (m || 0)
}

export function extraescolars(cfg) {
  return cfg?.extraescolars ?? []
}

export function afegeixExtra(cfg, x) {
  cfg.extraescolars ??= []
  cfg.extraescolars.push({ recollida: true, ...x })
  return cfg.extraescolars.length - 1
}

export function actualitzaExtra(cfg, i, canvis) {
  const x = cfg.extraescolars?.[i]
  if (x) Object.assign(x, canvis)
}

export function esborraExtra(cfg, i) {
  if (!cfg.extraescolars) return
  cfg.extraescolars = cfg.extraescolars.filter((_, k) => k !== i)
}

// Xoc d'horaris d'una extraescolar amb les altres de la mateixa nina i dia
export function xoc(cfg, candidat, excepte = -1) {
  const avui = minuts(candidat.inici) ?? 0
  const avuiFi = minuts(candidat.fi) ?? 0
  if (avuiFi <= avui) return 'L’hora de fi ha de ser posterior a la d’inici'
  const altres = extraescolars(cfg)
  for (let i = 0; i < altres.length; i++) {
    if (i === excepte) continue
    const x = altres[i]
    if (x.nina !== candidat.nina || x.dia !== candidat.dia) continue
    const ini = minuts(x.inici) ?? 0
    const fi = minuts(x.fi) ?? 0
    if (avui < fi && ini < avuiFi) return `Xoca amb ${x.nom} (${x.inici}–${x.fi})`
  }
  return null
}

export function grupaPerNina(cfg) {
  const llista = extraescolars(cfg)
  const colors = Object.fromEntries(nens(cfg).map((n) => [n.id, n.color]))
  return nens(cfg).map((n) => ({
    id: n.id,
    nom: n.nom,
    color: n.color,
    items: llista.map((x, i) => ({ x, i })).filter((e) => e.x.nina === n.id),
  }))
}
