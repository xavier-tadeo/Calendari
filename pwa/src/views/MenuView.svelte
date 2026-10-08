<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import { menuActual, estatMeal, personesMenu, platsCataleg } from '../lib/menu.js'
  import { llistesDe, llistaDe, comptatge, afegeixLlista, esborraLlista } from '../lib/compra.js'
  import { saveMenu, saveCompra } from '../lib/load.js'
  import MenuSheet from '../components/MenuSheet.svelte'
  import PlatsSheet from '../components/PlatsSheet.svelte'
  import CompraSheet from '../components/CompraSheet.svelte'

  let menu = $state(menuActual(app.menu))
  let sheet = $state(null)
  let platsSheet = $state(false)
  let oberta = $state(null)
  let editant = $state(null)

  const persones = $derived(personesMenu(app.config))
  const llistes = $derived(llistesDe(app.compra))

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

  function novaLlista() {
    editant = { id: null, nom: '', nova: true }
  }

  function editarLlista(l) {
    editant = { id: l.id, nom: l.nom, nova: false }
  }

  async function desarLlista() {
    const nom = editant?.nom.trim()
    if (!nom) return
    if (editant.nova) afegeixLlista(app.compra, nom)
    else {
      const l = llistaDe(app.compra, editant.id)
      if (l) l.nom = nom
    }
    await saveCompra()
    editant = null
  }

  async function esborrarLlista() {
    if (!editant || editant.nova) return
    esborraLlista(app.compra, editant.id)
    if (oberta === editant.id) oberta = null
    await saveCompra()
    editant = null
  }

  function cancelarEdicio() {
    editant = null
  }

  function obrirLlista(id) {
    oberta = id
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

<h2 class="titol" style="font-size: 18px; margin: 16px 0 6px">Llistes de la compra</h2>
{#each llistes as l (l.id)}
  {@const ct = comptatge(l)}
  <div class="targeta llista-card">
    <div class="fila espai">
      <button class="obre-llista" onclick={() => obrirLlista(l.id)} type="button">
        <span class="nom-llista">{l.icona} {l.nom}</span>
        <span class="suau">{ct.comprats}/{ct.total}</span>
      </button>
      <button class="boto ghost petit" onclick={() => editarLlista(l)} aria-label="Editar llista" type="button">
        ✏️
      </button>
    </div>
    <div class="barra">
      <div class="farcit" style="width: {ct.pct}%"></div>
    </div>
    {#if l.automatica}
      <span class="suau nota-llista">Generada amb els ingredients del menú</span>
    {:else if ct.total === 0}
      <span class="suau nota-llista">Buida · toca per obrir-la</span>
    {/if}
  </div>
{/each}
<button class="boto ghost" style="width: 100%" onclick={novaLlista} type="button">＋ Nova llista</button>

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

{#if oberta && llistaDe(app.compra, oberta)}
  <CompraSheet llista={llistaDe(app.compra, oberta)} onclose={() => (oberta = null)} />
{/if}

{#if editant}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={cancelarEdicio} role="presentation">
    <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="fila espai" style="margin-bottom: 6px">
        <h2 class="titol">{editant.nova ? 'Nova llista' : 'Editar llista'}</h2>
        <button class="boto ghost" onclick={cancelarEdicio}>✕</button>
      </div>

      <label class="etiqueta" for="l-nom">Nom</label>
      <input
        id="l-nom"
        class="camp"
        bind:value={editant.nom}
        onkeydown={(e) => e.key === 'Enter' && desarLlista()}
        placeholder="p. ex. Mercat, Farmàcia, Rebost..."
      />

      <div class="fila" style="gap: 8px; margin-top: 16px">
        {#if !editant.nova && !llistaDe(app.compra, editant.id)?.automatica}
          <button class="boto secundari" onclick={esborrarLlista}>🗑</button>
        {/if}
        <button class="boto secundari" style="flex: 1" onclick={cancelarEdicio}>Cancel·lar</button>
        <button class="boto" style="flex: 1" onclick={desarLlista} disabled={!editant.nom.trim()}>
          Desar
        </button>
      </div>
    </div>
  </div>
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
  .llista-card {
    margin-bottom: 10px;
  }
  .obre-llista {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    text-align: left;
    padding: 2px 0;
  }
  .nom-llista {
    font-size: 15px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .barra {
    height: 6px;
    border-radius: 999px;
    background: #eceff1;
    overflow: hidden;
    margin-top: 8px;
  }
  .farcit {
    height: 100%;
    background: var(--primari);
    transition: width 0.2s;
  }
  .nota-llista {
    display: block;
    margin-top: 6px;
    font-size: 11px;
  }
  .boto.petit {
    padding: 6px 10px;
    font-size: 12px;
    flex: none;
  }
</style>
