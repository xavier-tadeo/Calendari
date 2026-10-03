import { DIES } from './dates.js'

export const MENU_DEFAULT = {
  dl: { esmorzar: { nom: 'Llet, cereals i fruita', ingredients: ['llet', 'cereals', 'fruita'] }, sopar: { nom: 'Truita i amanida', ingredients: ['ous', 'patates', 'enciam', 'tomàquet'] } },
  dt: { esmorzar: { nom: 'Torrades amb melmelada', ingredients: ['pa', 'melmelada', 'mantega'] }, sopar: { nom: 'Llenties estofades', ingredients: ['llenties', 'pastanaga', 'ceba', 'salsitxes'] } },
  dc: { esmorzar: { nom: 'Iogurt amb fruits secs', ingredients: ['iogurt', 'nous', 'ametlles'] }, sopar: { nom: 'Macarrons a la bolonyesa', ingredients: ['macarrons', 'carn picada', 'tomàquet', 'ceba'] } },
  dj: { esmorzar: { nom: 'Sandvitx de formatge', ingredients: ['pa de motlle', 'formatge'] }, sopar: { nom: 'Pollastre al forn amb verdures', ingredients: ['pollastre', 'carbassó', 'patates', 'ceba'] } },
  dv: { esmorzar: { nom: 'Fruita i galetes', ingredients: ['fruita', 'galetes'] }, sopar: { nom: 'Pizza casolana', ingredients: ['massa de pizza', 'formatge', 'tomàquet', 'pernil'] } },
  ds: { esmorzar: { nom: 'Esmorzar especial', ingredients: ['pa', 'xorico', 'meló'] }, sopar: { nom: 'Arròs de verdures', ingredients: ['arròs', 'verdures', 'brou'] } },
  dg: { esmorzar: { nom: 'Xocolata desfeta amb xurros', ingredients: ['xocolata', 'xurros'] }, sopar: { nom: 'Peix a la planxa amb amanida', ingredients: ['salmó', 'amanida'] } },
}

export function menuActual(menu) {
  return menu && Object.keys(menu).length ? menu : MENU_DEFAULT
}

export function validar(menu) {
  const avisos = []
  for (const d of DIES) {
    const dia = menu?.[d] ?? {}
    if (!dia?.sopar?.nom) avisos.push(`${d}: falta el sopar`)
    if (!dia?.esmorzar?.nom) avisos.push(`${d}: falta l'esmorzar`)
  }
  return avisos
}

export function llistaCompra(menu, extra = []) {
  const compte = {}
  for (const d of DIES) {
    const dia = menu?.[d] ?? {}
    for (const menjar of ['esmorzar', 'dinar', 'sopar']) {
      for (const ing of dia?.[menjar]?.ingredients ?? []) {
        compte[ing] = (compte[ing] ?? 0) + 1
      }
    }
  }
  for (const ing of extra) compte[ing] = (compte[ing] ?? 0) + 1
  return compte
}
