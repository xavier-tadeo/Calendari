import { todayISO } from './dates.js'

const _avui = new Date()

export const app = $state({
  ready: false,
  error: null,
  config: null,
  estat: null,
  esdeveniments: [],
  menu: null,
  festius: [],
  tab: 'calendari',
  dia: todayISO(),
  viewAny: _avui.getFullYear(),
  viewMes: _avui.getMonth() + 1,
})
