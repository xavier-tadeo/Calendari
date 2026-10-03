export const PESOS = {
  1: 'Lleugera',
  2: 'Mitjana',
  3: 'Feixuga',
}

export const CATEGORIES = [
  { id: 'cuina', nom: 'Cuina', icona: '🍳' },
  { id: 'neteja', nom: 'Neteja', icona: '🧹' },
  { id: 'roba', nom: 'Roba', icona: '🧺' },
  { id: 'compra', nom: 'Compra', icona: '🛒' },
  { id: 'cole', nom: 'Cole i nenes', icona: '🎒' },
  { id: 'casa', nom: 'Casa i manteniment', icona: '🔧' },
  { id: 'mascota', nom: 'Mascota', icona: '🐾' },
  { id: 'admin', nom: 'Administració', icona: '📋' },
]

const TOTS = ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg']
const LABO = ['dl', 'dt', 'dc', 'dj', 'dv']

export const BIBLIOTECA = [
  // --- Cuina ---
  { id: 'b_esmorzars', cat: 'cuina', nom: 'Preparar els esmorzars', dies: LABO, hora: '07:30', tipus: 'rotatiu', pes: 1 },
  { id: 'b_dinar_cap', cat: 'cuina', nom: 'Cuinar el dinar del cap de setmana', dies: ['ds', 'dg'], hora: '13:30', tipus: 'rotatiu', pes: 2 },
  { id: 'b_sopars', cat: 'cuina', nom: 'Cuinar el sopar', dies: TOTS, hora: '20:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_plats', cat: 'cuina', nom: 'Rentar els plats', dies: TOTS, hora: '21:00', tipus: 'rotatiu', pes: 1 },
  { id: 'b_rentavaixelles', cat: 'cuina', nom: 'Posar i treure el rentavaixelles', dies: LABO, hora: '20:30', tipus: 'rotatiu', pes: 1 },
  { id: 'b_berenar', cat: 'cuina', nom: 'Preparar el berenar de les nenes', dies: LABO, hora: '16:45', tipus: 'rotatiu', pes: 1 },
  { id: 'b_cuina_fons', cat: 'cuina', nom: 'Netejar la cuina a fons', dies: ['ds'], hora: '10:30', tipus: 'rotatiu', pes: 3, freq: 'quinzenal' },
  { id: 'b_nevera', cat: 'cuina', nom: 'Buidar i netejar la nevera', dies: ['ds'], hora: '11:00', tipus: 'rotatiu', pes: 2, freq: 'mensual', dia_mes: 4 },
  { id: 'b_forn', cat: 'cuina', nom: 'Netejar el forn', dies: ['ds'], hora: '11:30', tipus: 'rotatiu', pes: 3, freq: 'mensual', dia_mes: 11 },

  // --- Neteja ---
  { id: 'b_llits', cat: 'neteja', nom: 'Fer els llits', dies: LABO, hora: '07:15', tipus: 'rotatiu', pes: 1 },
  { id: 'b_escombrar', cat: 'neteja', nom: 'Escombrar i fregar el terra', dies: ['ds'], hora: '09:30', tipus: 'rotatiu', pes: 2 },
  { id: 'b_aspirador', cat: 'neteja', nom: 'Passar l’aspirador', dies: ['ds'], hora: '10:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_pols', cat: 'neteja', nom: 'Treure la pols', dies: ['ds'], hora: '09:00', tipus: 'rotatiu', pes: 1 },
  { id: 'b_banys', cat: 'neteja', nom: 'Netejar banys i cuina', dies: ['ds'], hora: '10:00', tipus: 'familia', pes: 3 },
  { id: 'b_bany_petit', cat: 'neteja', nom: 'Fregar el bany petit', dies: ['dj'], hora: '19:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_vidres', cat: 'neteja', nom: 'Netejar els vidres', dies: ['ds'], hora: '11:30', tipus: 'rotatiu', pes: 2, freq: 'quinzenal' },
  { id: 'b_menjador', cat: 'neteja', nom: 'Recollir i ordenar el menjador', dies: LABO, hora: '21:30', tipus: 'rotatiu', pes: 1 },
  { id: 'b_armaris', cat: 'neteja', nom: 'Ordenar armaris i calaixos', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 3, freq: 'mensual', dia_mes: 18 },

  // --- Roba ---
  { id: 'b_roba', cat: 'roba', nom: 'Rentar i plegar la roba', dies: ['dl', 'dj', 'ds'], hora: '19:30', tipus: 'rotatiu', pes: 2 },
  { id: 'b_llençols', cat: 'roba', nom: 'Canviar els llençols', dies: ['ds'], hora: '11:00', tipus: 'rotatiu', pes: 1, freq: 'quinzenal' },
  { id: 'b_bugada_blancs', cat: 'roba', nom: 'Posar una bugada de blancs', dies: ['dc'], hora: '19:30', tipus: 'rotatiu', pes: 1 },
  { id: 'b_planxar', cat: 'roba', nom: 'Planxar', dies: ['dg'], hora: '18:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_edredons', cat: 'roba', nom: 'Rentar abrics i edredons', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 3, freq: 'mensual', dia_mes: 25 },
  { id: 'b_sabates', cat: 'roba', nom: 'Netejar i ordenar el calçat', dies: ['dg'], hora: '17:30', tipus: 'rotatiu', pes: 2, freq: 'quinzenal' },

  // --- Compra ---
  { id: 'b_super', cat: 'compra', nom: 'Comprar al super', dies: ['ds'], hora: '11:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_llista', cat: 'compra', nom: 'Fer la llista de la compra', dies: ['dv'], hora: '19:00', tipus: 'rotatiu', pes: 1 },
  { id: 'b_mercat', cat: 'compra', nom: 'Anar al mercat', dies: ['ds'], hora: '10:00', tipus: 'rotatiu', pes: 1 },
  { id: 'b_neteja_compra', cat: 'compra', nom: 'Reposar productes de neteja', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 1, freq: 'mensual', dia_mes: 8 },
  { id: 'b_farmacia', cat: 'compra', nom: 'Anar a la farmàcia', dies: ['dl'], hora: '17:30', tipus: 'rotatiu', pes: 1 },

  // --- Cole i nenes ---
  { id: 'b_portar_cole', cat: 'cole', nom: 'Portar les nenes a l’escola', dies: LABO, hora: '08:45', tipus: 'escola', pes: 1 },
  { id: 'b_recollir_cole', cat: 'cole', nom: 'Recollir les nenes de l’escola', dies: LABO, hora: '17:00', tipus: 'escola', pes: 1 },
  { id: 'b_extraescolars', cat: 'cole', nom: 'Acompanyar a les extraescolars', dies: ['dl', 'dt', 'dc', 'dj'], hora: '17:00', tipus: 'escola', pes: 1 },
  { id: 'b_deures', cat: 'cole', nom: 'Deures i estudi amb les nenes', dies: ['dl', 'dt', 'dc', 'dj'], hora: '17:30', tipus: 'rotatiu', pes: 2 },
  { id: 'b_motxilles', cat: 'cole', nom: 'Preparar les motxilles', dies: LABO, hora: '20:30', tipus: 'rotatiu', pes: 1 },
  { id: 'b_roba_endemà', cat: 'cole', nom: 'Preparar la roba de l’endemà', dies: LABO, hora: '21:00', tipus: 'rotatiu', pes: 1 },
  { id: 'b_bany_nenes', cat: 'cole', nom: 'Bany de les nenes', dies: LABO, hora: '19:30', tipus: 'rotatiu', pes: 1 },
  { id: 'b_dormir', cat: 'cole', nom: 'Contes i rutina de son', dies: TOTS, hora: '21:00', tipus: 'rotatiu', pes: 1 },

  // --- Casa i manteniment ---
  { id: 'b_brossa', cat: 'casa', nom: 'Treure la brossa i reciclatge', dies: ['dl', 'dj'], hora: '21:15', tipus: 'rotatiu', pes: 1 },
  { id: 'b_plantes', cat: 'casa', nom: 'Regar les plantes', dies: ['dt', 'ds'], hora: '09:00', tipus: 'rotatiu', pes: 1 },
  { id: 'b_rentaplats_filtre', cat: 'casa', nom: 'Netejar el filtre del rentavaixelles', dies: ['ds'], hora: '10:30', tipus: 'rotatiu', pes: 2, freq: 'mensual', dia_mes: 15 },
  { id: 'b_cafetera', cat: 'casa', nom: 'Descalcificar la cafetera', dies: ['ds'], hora: '10:45', tipus: 'rotatiu', pes: 2, freq: 'mensual', dia_mes: 21 },
  { id: 'b_caldera', cat: 'casa', nom: 'Revisar la caldera', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 2, freq: 'mensual', dia_mes: 2 },
  { id: 'b_gasolina', cat: 'casa', nom: 'Posar gasolina', dies: ['dv'], hora: '18:00', tipus: 'rotatiu', pes: 1 },
  { id: 'b_cotxe', cat: 'casa', nom: 'Repassar el cotxe', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 3, freq: 'mensual', dia_mes: 6 },
  { id: 'b_bombetes', cat: 'casa', nom: 'Petites reparacions de casa', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 3, freq: 'mensual', dia_mes: 28 },
  { id: 'b_joguines', cat: 'casa', nom: 'Ordenar i revisar les joguines', dies: ['dg'], hora: '17:00', tipus: 'rotatiu', pes: 2, freq: 'quinzenal' },

  // --- Mascota ---
  { id: 'b_mascota', cat: 'mascota', nom: 'Cuidar la mascota', dies: TOTS, hora: '20:30', tipus: 'rotatiu', pes: 1 },
  { id: 'b_passeig', cat: 'mascota', nom: 'Treure a passejar el gos', dies: TOTS, hora: '19:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_safata', cat: 'mascota', nom: 'Netejar la safata o la gàbia', dies: ['ds'], hora: '10:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_pinso', cat: 'mascota', nom: 'Comprar el menjar de la mascota', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 1, freq: 'mensual', dia_mes: 14 },
  { id: 'b_veterinari', cat: 'mascota', nom: 'Portar la mascota al veterinari', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 3, freq: 'mensual', dia_mes: 22 },

  // --- Administració ---
  { id: 'b_menus', cat: 'admin', nom: 'Fer els menús de la setmana', dies: ['dg'], hora: '19:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_rebuts', cat: 'admin', nom: 'Pagar rebuts i revisar comptes', dies: ['dg'], hora: '11:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_agenda', cat: 'admin', nom: 'Revisar l’agenda familiar', dies: ['dg'], hora: '20:00', tipus: 'familia', pes: 1 },
  { id: 'b_cap_de_setmana', cat: 'admin', nom: 'Planificar el cap de setmana', dies: ['dj'], hora: '20:00', tipus: 'familia', pes: 1 },
  { id: 'b_cites', cat: 'admin', nom: 'Gestionar cites mèdiques', dies: ['dl'], hora: '10:00', tipus: 'rotatiu', pes: 3, freq: 'mensual', dia_mes: 3 },
  { id: 'b_dentista', cat: 'admin', nom: 'Demanar hora al dentista de les nenes', dies: ['dl'], hora: '10:00', tipus: 'rotatiu', pes: 3, freq: 'mensual', dia_mes: 9 },
  { id: 'b_paperassa', cat: 'admin', nom: 'Gestionar correu i paperassa', dies: ['dc'], hora: '19:00', tipus: 'rotatiu', pes: 2 },
  { id: 'b_regals', cat: 'admin', nom: 'Comprar regals i detalls', dies: ['ds'], hora: '12:00', tipus: 'rotatiu', pes: 2, freq: 'mensual', dia_mes: 20 },
]

export function tascaBiblioteca(id) {
  return BIBLIOTECA.find((t) => t.id === id)
}

// --- Biblioteca editable (es guarda a config) ---

export function catsBiblioteca(cfg) {
  return cfg?.biblio_cats?.length ? cfg.biblio_cats : CATEGORIES
}

export function tasquesBiblioteca(cfg) {
  return cfg?.biblioteca?.length ? cfg.biblioteca : BIBLIOTECA
}

export function asseguraBiblioteca(cfg) {
  if (!cfg.biblio_cats?.length) cfg.biblio_cats = CATEGORIES.map((c) => ({ ...c }))
  if (!cfg.biblioteca?.length)
    cfg.biblioteca = BIBLIOTECA.map((t) => ({ ...t, dies: [...(t.dies ?? [])] }))
  return cfg
}

export function afegeixCategoria(cfg, cat) {
  asseguraBiblioteca(cfg).biblio_cats.push(cat)
}

export function actualitzaCategoria(cfg, id, canvis) {
  const c = asseguraBiblioteca(cfg).biblio_cats.find((x) => x.id === id)
  if (c) Object.assign(c, canvis)
}

export function esborraCategoria(cfg, id) {
  asseguraBiblioteca(cfg)
  cfg.biblio_cats = cfg.biblio_cats.filter((c) => c.id !== id)
  cfg.biblioteca = cfg.biblioteca.filter((t) => t.cat !== id)
}

export function afegeixTascaBib(cfg, tasca) {
  asseguraBiblioteca(cfg).biblioteca.push(tasca)
}

export function actualitzaTascaBib(cfg, id, canvis) {
  const t = asseguraBiblioteca(cfg).biblioteca.find((x) => x.id === id)
  if (t) Object.assign(t, canvis)
}

export function esborraTascaBib(cfg, id) {
  asseguraBiblioteca(cfg)
  cfg.biblioteca = cfg.biblioteca.filter((t) => t.id !== id)
}
