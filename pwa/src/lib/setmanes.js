import { setmanaKey } from './dates.js'

export function setmanaBuida() {
  return { assignat: {}, fet: {}, eliminats: {}, notes: {}, custom: [] }
}

export function obtenirSetmana(setmanes, dia) {
  const week = setmanaKey(dia)
  if (!setmanes[week]) setmanes[week] = setmanaBuida()
  const sm = setmanes[week]
  sm.assignat ??= {}
  sm.fet ??= {}
  sm.eliminats ??= {}
  sm.notes ??= {}
  sm.custom ??= []
  return sm
}

export function assigna(setmanes, dia, key, memberId) {
  obtenirSetmana(setmanes, dia).assignat[key] = memberId
}

export function toggleFet(setmanes, dia, key, valor) {
  const sm = obtenirSetmana(setmanes, dia)
  if (valor) sm.fet[key] = true
  else delete sm.fet[key]
}

export function eliminaInstancia(setmanes, dia, key) {
  obtenirSetmana(setmanes, dia).eliminats[key] = true
}

export function afegeixCustom(setmanes, dia, tasca) {
  obtenirSetmana(setmanes, dia).custom.push(tasca)
}

export function actualitzaCustom(setmanes, dia, id, canvis) {
  const sm = obtenirSetmana(setmanes, dia)
  const i = sm.custom.findIndex((c) => c.id === id)
  if (i >= 0) sm.custom[i] = { ...sm.custom[i], ...canvis }
}

export function esborraCustom(setmanes, dia, id) {
  const sm = obtenirSetmana(setmanes, dia)
  sm.custom = sm.custom.filter((c) => c.id !== id)
}

export function setNota(setmanes, dia, diaKey, text) {
  const sm = obtenirSetmana(setmanes, dia)
  if (text && text.trim()) sm.notes[diaKey] = text.trim()
  else delete sm.notes[diaKey]
}
