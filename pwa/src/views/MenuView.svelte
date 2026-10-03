<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import { menuActual, llistaCompra, estatMeal, personesMenu, platsCataleg } from '../lib/menu.js'
  import { saveMenu } from '../lib/load.js'
  import MenuSheet from '../components/MenuSheet.svelte'
  import PlatsSheet from '../components/PlatsSheet.svelte'

  let menu = $state(menuActual(app.menu))
  let comprats = $state({})
  let sheet = $state(null)
  let platsSheet = $state(false)

  const persones = $derived(personesMenu(app.config))
  const compra = $derived(llistaCompra(menu))
  const ingredients = $derived(Object.entries(compra))

  async function desar() {
    app.menu = $state.snapshot(menu)
    await saveMenu()
  }

  function obrir(d, tipus, persona = null) {
    sheet = { d, tipus, persona }
  }

  async function tancaSheet() {
    sheet = null
    await desar()
  }
</script>

<div class="fila espai" style="margin-bottom: 12px">
  <h1 class="titol">Menú</h1>
  <button class="boto ghost" onclick={() => (platsSheet = true)}>📚 Plats</button>
</div>

{#snippet seccio(d, tipus, titol)}
  {@const meal = menu[d][tipus]}
  {@const estat = estatMeal(meal)}
  <div class="menjar" class:igual={estat === 'igual'} class:diferent={estat === 'diferent'}>
    <div class="fila espai">
      <span class="mini-titol">{titol}</span>
      <button class="mini" onclick={() => obrir(d, tipus)} aria-label="Editar {titol}">✏️</button>
    </div>
    {#if estat === 'igual'}
      <button class="plats" onclick={() => obrir(d, tipus)}>
        {meal.tots.map((p) => p.nom).join(' · ')}
      </button>
    {:else if estat === 'diferent'}
      {#each persones as p (p.id)}
        {@const arr = meal.per?.[p.id] ?? []}
        {#if arr.length}
          <button class="fila-plat" onclick={() => obrir(d, tipus, p.id)}>
            <span class="punt" style="background: {p.color}"></span>
            <span class="qui">{p.nom}</span>
            <span class="plats-txt">{arr.map((x) => x.nom).join(' · ')}</span>
          </button>
        {/if}
      {/each}
    {:else}
      <button class="boto ghost" style="width: 100%" onclick={() => obrir(d, tipus)}>
        ＋ Afegir {titol.toLowerCase()}
      </button>
    {/if}
  </div>
{/snippet}

{#each DIES as d (d)}
  <div class="targeta" style="margin-bottom: 10px">
    <strong>{DIES_NOM[d]}</strong>
    {@render seccio(d, 'esmorzar', 'Esmorzar')}
    {@render seccio(d, 'sopar', 'Sopar')}
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

{#if sheet}
  <MenuSheet
    dia={sheet.d}
    tipus={sheet.tipus}
    meal={menu[sheet.d][sheet.tipus]}
    personaInicial={sheet.persona}
    {persones}
    plats={platsCataleg(app.config).filter((p) => p.cat === sheet.tipus)}
    oncanvi={desar}
    onclose={tancaSheet}
  />
{/if}

{#if platsSheet}
  <PlatsSheet onclose={() => (platsSheet = false)} />
{/if}

<style>
  .menjar {
    border-radius: 12px;
    padding: 8px;
    margin-top: 8px;
    background: #fafafa;
    border: 1px solid var(--linia);
  }
  .menjar.igual {
    background: #e8f5e9;
    border-color: #bfe3c1;
  }
  .menjar.diferent {
    background: #fff3e0;
    border-color: #ffd8a8;
  }
  .mini-titol {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #7a7a7a;
  }
  .mini {
    padding: 2px 8px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid var(--linia);
    font-size: 12px;
  }
  .plats {
    display: block;
    width: 100%;
    text-align: left;
    padding: 4px 0;
    font-size: 14px;
  }
  .fila-plat {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: left;
    padding: 4px 0;
  }
  .qui {
    flex: none;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    width: 54px;
  }
  .plats-txt {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .fet {
    text-decoration: line-through;
    color: var(--suau);
  }
</style>
