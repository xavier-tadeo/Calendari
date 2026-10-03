<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import { menuActual, llistaCompra } from '../lib/menu.js'
  import { saveMenu } from '../lib/load.js'

  let menu = $state(structuredClone(menuActual(app.menu)))
  let desat = $state(true)
  let comprats = $state({})

  const compra = $derived(llistaCompra(menu))
  const ingredients = $derived(Object.entries(compra))

  async function desar() {
    app.menu = structuredClone(menu)
    await saveMenu()
    desat = true
  }

  function toca() {
    desat = false
  }
</script>

<div class="fila espai" style="margin-bottom: 12px">
  <h1 class="titol">Menú i compra</h1>
  {#if !desat}
    <button class="boto" onclick={desar}>Desar</button>
  {/if}
</div>

{#each DIES as d (d)}
  <div class="targeta" style="margin-bottom: 10px">
    <strong>{DIES_NOM[d]}</strong>

    <label class="etiqueta" for="esm-{d}">Esmorzar</label>
    <input id="esm-{d}" class="camp" bind:value={menu[d].esmorzar.nom} oninput={toca} />

    <label class="etiqueta" for="sop-{d}">Sopar</label>
    <input id="sop-{d}" class="camp" bind:value={menu[d].sopar.nom} oninput={toca} />
  </div>
{/each}

<h2 class="titol" style="font-size: 18px; margin: 16px 0 6px">Llista de la compra</h2>
<div class="targeta">
  {#if ingredients.length === 0}
    <span class="suau">Res pendent.</span>
  {:else}
    {#each ingredients as [ing, n] (ing)}
      <label class="fila" style="gap: 10px; padding: 5px 0">
        <input type="checkbox" bind:checked={comprats[ing]} />
        <span style="flex: 1" class:fet={comprats[ing]}>{ing}</span>
        {#if n > 1}<span class="xip">×{n}</span>{/if}
      </label>
    {/each}
  {/if}
</div>

<style>
  .fet {
    text-decoration: line-through;
    color: var(--suau);
  }
</style>
