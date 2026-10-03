<script>
  import { app } from '../lib/state.svelte.js'
  import {
    graellaMes,
    nomMes,
    iso,
    parseISO,
    DIES,
    DIES_CURT,
    pyWeekday,
    todayISO,
  } from '../lib/dates.js'
  import { delDia, ordenats } from '../lib/esdeveniments.js'
  import { festiu } from '../lib/festius.js'
  import { colorsMembres, adults, nens } from '../lib/config.js'
  import { tasquesDelDia } from '../lib/tasques.js'
  import { saveEsdeveniments } from '../lib/load.js'
  import DaySheet from '../components/DaySheet.svelte'
  import EventForm from '../components/EventForm.svelte'

  let mostra = $state(false)
  let formEv = $state(null)

  const avui = todayISO()
  const files = $derived(graellaMes(app.viewAny, app.viewMes))
  const colors = $derived(colorsMembres(app.config))
  const noms = $derived(
    Object.fromEntries(
      [...adults(app.config), ...nens(app.config)].map((m) => [m.id, m.nom]),
    ),
  )

  const diaDate = $derived(parseISO(app.dia))
  const diaKey = $derived(DIES[pyWeekday(diaDate)])
  const esdDia = $derived(ordenats(delDia(app.esdeveniments, diaDate)))
  const fest = $derived(festiu(diaDate))
  const tasques = $derived(tasquesDelDia(app.config, diaDate, diaKey))
  const extra = $derived((app.config?.extraescolars ?? []).filter((x) => x.dia === diaKey))

  function canviaMes(offset) {
    let m = app.viewMes + offset
    let a = app.viewAny
    if (m < 1) {
      m = 12
      a--
    } else if (m > 12) {
      m = 1
      a++
    }
    app.viewMes = m
    app.viewAny = a
  }

  function selecciona(d) {
    app.dia = iso(d)
    if (d.getMonth() + 1 !== app.viewMes || d.getFullYear() !== app.viewAny) {
      app.viewMes = d.getMonth() + 1
      app.viewAny = d.getFullYear()
    }
    mostra = true
  }

  function colorEv(ev) {
    return ev.color || colors[ev.persona] || '#7f7f7f'
  }

  function evsDelDia(d) {
    return ordenats(delDia(app.esdeveniments, d))
  }

  function obrirNou() {
    formEv = { _nou: true, data: app.dia }
    mostra = false
  }

  function obrirEditar(ev) {
    formEv = { ...ev }
    mostra = false
  }

  async function desar(ev) {
    const i = app.esdeveniments.findIndex((x) => x.id === ev.id)
    if (i >= 0) app.esdeveniments[i] = ev
    else app.esdeveniments.push(ev)
    formEv = null
    await saveEsdeveniments()
    mostra = true
  }

  async function esborrar(id) {
    app.esdeveniments = app.esdeveniments.filter((e) => e.id !== id)
    await saveEsdeveniments()
  }
</script>

<div class="fila espai" style="margin-bottom: 10px">
  <button class="boto ghost" onclick={() => canviaMes(-1)} aria-label="Mes anterior">‹</button>
  <h1 class="titol">{nomMes(app.viewAny, app.viewMes)}</h1>
  <button class="boto ghost" onclick={() => canviaMes(1)} aria-label="Mes seguent">›</button>
</div>

<div class="capcalera-setmana">
  {#each DIES as d (d)}
    <span>{DIES_CURT[d]}</span>
  {/each}
</div>

<div class="graella">
  {#each files as setmana, si (si)}
    {#each setmana as d, di (di)}
      {#if d}
        {@const isAvui = iso(d) === avui}
        {@const isSel = iso(d) === app.dia}
        {@const f = festiu(d)}
        {@const evs = evsDelDia(d)}
        <button
          class="cella"
          class:avui={isAvui}
          class:sel={isSel}
          class:festiu={Boolean(f)}
          onclick={() => selecciona(d)}
        >
          <span class="numero" class:avui-num={isAvui}>{d.getDate()}</span>
          <span class="marques">
            {#each evs.slice(0, 3) as ev (ev.id)}
              <span class="marca" style="background: {colorEv(ev)}"></span>
            {/each}
            {#if evs.length > 3}
              <span class="mes">+{evs.length - 3}</span>
            {/if}
          </span>
        </button>
      {:else}
        <span class="cella buit"></span>
      {/if}
    {/each}
  {/each}
</div>

<p class="suau" style="margin-top: 10px; text-align: center">
  Toca un dia per veure el resum i afegir esdeveniments.
</p>

{#if mostra}
  <DaySheet
    dia={diaDate}
    {diaKey}
    esd={esdDia}
    {tasques}
    {extra}
    {colors}
    {noms}
    {fest}
    onclose={() => (mostra = false)}
    oneditar={obrirEditar}
    onesborrar={esborrar}
    onafegir={obrirNou}
  />
{/if}

{#if formEv}
  <EventForm ev={formEv} onclose={() => (formEv = null)} onsave={desar} />
{/if}

<style>
  .capcalera-setmana {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--suau);
    margin-bottom: 4px;
  }
  .graella {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  .cella {
    position: relative;
    height: 62px;
    background: var(--targeta);
    border-radius: 10px;
    box-shadow: var(--ombra);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px 2px 3px;
    overflow: hidden;
  }
  .cella.buit {
    background: transparent;
    box-shadow: none;
  }
  .numero {
    font-size: 14px;
    font-weight: 600;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  .avui-num {
    background: var(--primari);
    color: #fff;
  }
  .cella.festiu .numero {
    color: var(--perill);
  }
  .cella.festiu .avui-num {
    color: #fff;
  }
  .cella.sel {
    outline: 2px solid var(--primari);
    outline-offset: -2px;
  }
  .marques {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-top: 3px;
    width: 100%;
  }
  .marca {
    width: 78%;
    height: 4px;
    border-radius: 2px;
  }
  .mes {
    font-size: 9px;
    color: var(--suau);
    font-weight: 700;
  }
</style>
