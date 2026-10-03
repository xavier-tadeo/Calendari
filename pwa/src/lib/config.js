export const ESTAT_DEFAULT = {
  setmana: null,
  checkins: {},
  punts: {},
  premis: [],
  premis_bescanviats: [],
}

export function adults(cfg) {
  return cfg?.familia?.adults ?? []
}

export function nens(cfg) {
  return cfg?.familia?.nens ?? []
}

export function nomMembre(cfg, id) {
  for (const m of [...adults(cfg), ...nens(cfg)]) {
    if (m.id === id) return m.nom ?? id
  }
  return { familia: 'Familia', nens: 'Nenes' }[id] ?? id
}

export function colorsMembres(cfg) {
  const out = {}
  for (const m of [...adults(cfg), ...nens(cfg)]) out[m.id] = m.color ?? '#888'
  return out
}
