<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import { nens } from '../lib/config.js'
  import {
    extraescolars,
    afegeixExtra,
    actualitzaExtra,
    esborraExtra,
    xoc,
    grupaPerNina,
  } from '../lib/extraescolars.js'
  import { saveConfig } from '../lib/load.js'

  let { onclose } = $props()

  let edit = $state(null)

  const nines = $derived(nens(app.config))
  const grups = $derived(grupaPerNina(app.config))
  const total = $derived(extraescolars(app.config).length)

  function obrirNova(nina) {
    edit = { i: -1, nom: '', nina: nina ?? nines[0]?.id ?? '', dia: 'dl', inici: '17:00', fi: '18:00' }
  }
  function obrir(i) {
    const x = extraescolars(app.config)[i]
    if (x) edit = { i, ...x }
  }

  const problema = $derived(edit ? xoc(app.config, edit, edit.i) : null)
  const valid = $derived(edit && edit.nom.trim() && !problema)

  async function desar() {
    if (!valid) return
    const dades = {
      nom: edit.nom.trim(),
      nina: edit.nina,
      dia: edit.dia,
      inici: edit.inici,
      fi: edit.fi,
    }
    if (edit.i < 0) afegeixExtra(app.config, dades)
    else actualitzaExtra(app.config, edit.i, dades)
    await saveConfig()
    edit = null
  }

  async function esborrar() {
    if (!edit || edit.i < 0) return
    esborraExtra(app.config, edit.i)
    await saveConfig()
    edit = null
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">Extraescolars</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>
    <p class="suau" style="margin: 0 0 10px">
      {#if total === 0}
        Encara no n'hi ha cap. Crea la primera.
      {:else}
        {total} en total. Toca'n per editar-la.
      {/if}
    </p>

    {#each grups as g (g.id)}
      <div class="grup">
        <div class="fila espai" style="margin-bottom: 4px">
          <span class="grup-nom">
            <span class="punt" style="background: {g.color}"></span>
            {g.nom}
          </span>
          <button class="boto ghost petit" onclick={() => obrirNova(g.id)} type="button">＋</button>
        </div>
        {#if g.items.length === 0}
          <div class="suau buit">Cap extraescolar</div>
        {:else}
          {#each g.items as e (e.i)}
            {@const x = e.x}
            <div class="item">
              <button class="info" onclick={() => obrir(e.i)} type="button">
                <span class="dia">{DIES_NOM[x.dia]}</span>
                <span style="flex: 1">{x.nom}</span>
                <span class="suau">{x.inici}–{x.fi}</span>
              </button>
              <button class="boto ghost petit" onclick={() => obrir(e.i)} type="button">✏️</button>
            </div>
          {/each}
        {/if}
      </div>
    {/each}

    <button class="boto ghost" style="width: 100%" onclick={() => obrirNova()} type="button">
      ＋ Nova extraescolar
    </button>
  </div>
</div>

{#if edit}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={() => (edit = null)} role="presentation">
    <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="fila espai" style="margin-bottom: 6px">
        <h2 class="titol">{edit.i < 0 ? 'Nova extraescolar' : 'Editar extraescolar'}</h2>
        <button class="boto ghost" onclick={() => (edit = null)}>✕</button>
      </div>

      <label class="etiqueta" for="x-nom">Nom</label>
      <input id="x-nom" class="camp" bind:value={edit.nom} placeholder="p. ex. Natació" />

      <span class="etiqueta">Nina</span>
      <div class="xips">
        {#each nines as n (n.id)}
          <button
            class="xip"
            class:sel={edit.nina === n.id}
            onclick={() => (edit.nina = n.id)}
            type="button"
          >
            <span class="punt" style="background: {n.color}"></span>
            {n.nom}
          </button>
        {/each}
      </div>

      <span class="etiqueta">Dia</span>
      <div class="xips">
        {#each DIES as d (d)}
          <button class="xip" class:sel={edit.dia === d} onclick={() => (edit.dia = d)} type="button">
            {DIES_NOM[d]}
          </button>
        {/each}
      </div>

      <div class="fila" style="gap: 8px">
        <div style="flex: 1">
          <label class="etiqueta" for="x-ini">Comença</label>
          <input id="x-ini" class="camp" type="time" bind:value={edit.inici} />
        </div>
        <div style="flex: 1">
          <label class="etiqueta" for="x-fi">Acaba</label>
          <input id="x-fi" class="camp" type="time" bind:value={edit.fi} />
        </div>
      </div>

      {#if problema}
        <p class="error" style="margin: 8px 0 0">⚠️ {problema}</p>
      {/if}

      <div class="fila" style="gap: 8px; margin-top: 16px">
        {#if edit.i >= 0}
          <button class="boto secundari" onclick={esborrar}>🗑</button>
        {/if}
        <button class="boto secundari" style="flex: 1" onclick={() => (edit = null)}>Cancel·lar</button>
        <button class="boto" style="flex: 1" onclick={desar} disabled={!valid}>Desar</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .grup {
    border: 1px solid var(--linia);
    border-radius: 12px;
    padding: 8px;
    margin-bottom: 10px;
  }
  .grup-nom {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    font-size: 13px;
  }
  .buit {
    font-size: 12px;
    padding: 2px 0;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid var(--linia);
  }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
    padding: 9px 0;
    font-size: 14px;
  }
  .dia {
    flex: none;
    width: 30px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--suau);
  }
  .boto.petit {
    padding: 5px 9px;
    font-size: 12px;
    flex: none;
  }
  .xips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .xip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 11px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-weight: 600;
    font-size: 12px;
  }
  .xip.sel {
    border-color: var(--primari);
    color: var(--text);
    background: var(--primari-suau);
  }
</style>
