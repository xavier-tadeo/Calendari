import { load, loadFestius, loadConfigDefault, save } from './data.js'
import { setFestius } from './festius.js'
import { asseguraSetmana } from './punts.js'
import { app } from './state.svelte.js'
import { ESTAT_DEFAULT } from './config.js'
import { parseISO } from './dates.js'

export async function loadAll() {
  app.error = null
  try {
    const [config, festius, esd, menu, estat] = await Promise.all([
      load('config', loadConfigDefault),
      loadFestius(),
      load('esdeveniments', () => ({ esdeveniments: [] })),
      load('menu', () => ({})),
      load('estat', () => null),
    ])
    setFestius(festius)
    app.config = config ?? {}
    app.festius = festius
    app.esdeveniments = esd?.esdeveniments ?? []
    app.menu = menu ?? {}
    app.estat = asseguraSetmana(app.config, { ...ESTAT_DEFAULT, ...(estat ?? {}) }, parseISO(app.dia))
    app.ready = true
  } catch (e) {
    app.error = e?.message ?? String(e)
  }
}

export async function saveEsdeveniments() {
  await save('esdeveniments', { esdeveniments: app.esdeveniments })
}

export async function saveEstat() {
  await save('estat', app.estat)
}

export async function saveMenu() {
  await save('menu', app.menu)
}

export async function saveConfig() {
  await save('config', app.config)
}
