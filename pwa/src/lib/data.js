import { supabase, hasSupabase } from './supabase.js'

const LS = 'familia:'

async function remoteGet(clau) {
  const { data, error } = await supabase
    .from('familia_store')
    .select('dades')
    .eq('clau', clau)
    .maybeSingle()
  if (error) throw error
  return data?.dades ?? null
}

async function remoteSet(clau, dades) {
  const { error } = await supabase
    .from('familia_store')
    .upsert(
      { clau, dades, actualitzat: new Date().toISOString() },
      { onConflict: 'clau' },
    )
  if (error) throw error
}

export async function load(clau, fallback = null) {
  let val = null
  if (hasSupabase) {
    try {
      val = await remoteGet(clau)
    } catch (e) {
      console.warn('No sha pogut llegir del nuvol:', clau, e.message)
    }
  }
  if (val == null) {
    const ls = localStorage.getItem(LS + clau)
    if (ls) {
      try {
        val = JSON.parse(ls)
      } catch {
        val = null
      }
    }
  }
  if (val == null && fallback) val = await fallback()
  return val
}

export async function save(clau, dades) {
  localStorage.setItem(LS + clau, JSON.stringify(dades))
  if (hasSupabase) {
    try {
      await remoteSet(clau, dades)
    } catch (e) {
      console.warn('No sha pogut desar al nuvol:', clau, e.message)
    }
  }
}

let _festius = null

export async function loadFestius() {
  if (_festius) return _festius
  try {
    const r = await fetch(import.meta.env.BASE_URL + 'festius.json')
    _festius = (await r.json()).festius ?? []
  } catch {
    _festius = []
  }
  return _festius
}

export async function loadConfigDefault() {
  try {
    const r = await fetch(import.meta.env.BASE_URL + 'config.default.json')
    return await r.json()
  } catch {
    return {}
  }
}
