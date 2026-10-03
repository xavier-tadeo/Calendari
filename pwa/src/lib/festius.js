import { iso } from './dates.js'

let map = {}

export function setFestius(list) {
  map = {}
  for (const f of list) map[f.data] = f
}

export function festiu(d) {
  return map[iso(d)] ?? null
}

export function esFestiu(d) {
  return Boolean(festiu(d))
}
