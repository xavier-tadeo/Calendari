import { nens } from './config.js'
import { setmanaKey } from './dates.js'

export const PREMIS_DEFAULT = [
  { id: 'pelicula', nom: 'Triar la pel·lícula del divendres', cost: 10 },
  { id: 'gelat', nom: 'Un gelat el cap de setmana', cost: 15 },
  { id: 'joc', nom: '1 hora extra de jocs', cost: 20 },
  { id: 'sortida', nom: 'Sortida especial amb un adult', cost: 30 },
]

export function estatInicial(cfg, week) {
  return {
    setmana: week,
    checkins: {},
    punts: Object.fromEntries(nens(cfg).map((n) => [n.id, 0])),
    premis: PREMIS_DEFAULT.map((p) => ({ ...p })),
    premis_bescanviats: [],
  }
}

export function asseguraSetmana(cfg, estat, dia) {
  const week = setmanaKey(dia)
  if (estat?.setmana !== week) return estatInicial(cfg, week)
  return estat
}

export function marcar(estat, clau, kid, punts, fet = true) {
  estat.checkins ??= {}
  estat.punts ??= {}
  if (fet && !estat.checkins[clau]) {
    estat.checkins[clau] = true
    estat.punts[kid] = (estat.punts[kid] ?? 0) + punts
  } else if (!fet && estat.checkins[clau]) {
    delete estat.checkins[clau]
    estat.punts[kid] = Math.max(0, (estat.punts[kid] ?? 0) - punts)
  }
  return estat
}

export function potBescanviar(estat, kid, cost) {
  return (estat?.punts?.[kid] ?? 0) >= cost
}

export function bescanviar(estat, premiId, kid) {
  const premis = estat?.premis ?? PREMIS_DEFAULT
  const premi = premis.find((p) => p.id === premiId)
  if (premi && potBescanviar(estat, kid, premi.cost)) {
    estat.punts[kid] -= premi.cost
    estat.premis_bescanviats ??= []
    estat.premis_bescanviats.push({ premi: premiId, nena: kid })
  }
  return estat
}
