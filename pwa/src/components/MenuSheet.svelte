<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES_NOM } from '../lib/dates.js'
  import { estatMeal, afegeixPlat } from '../lib/menu.js'
  import { saveConfig } from '../lib/load.js'

  let { dia, tipus, meal, persones, plats, personaInicial = null, oncanvi, onclose } = $props()

  const TIPUS_NOM = { esmorzar: 'Esmorzar', sopar: 'Sopar' }
  const rid = (p) => p + Math.random().toString(16).slice(2, 9)

  let mode = $state(personaInicial || estatMeal(meal) === 'diferent' ? 'diferent' : 'igual')
  let persona = $state(personaInicial ?? persones[0]?.id ?? '')
  let nou = $state('')

  function target() {
    if (mode === 'igual') {
      meal.tots ??= []
      return meal.tots
    }
    meal.per ??= {}
    meal.per[persona] ??= []
    return meal.per[persona]
  }

  function seleccionat(plat) {
    return target().some((p) => p.nom === plat.nom)
  }

  function alternaPlat(plat) {
    const arr = target()
    const i = arr.findIndex((p) => p.nom === plat.nom)
    if (i >= 0) arr.splice(i, 1)
    else arr.push({ nom: plat.nom, ingredients: [...(plat.ingredients ?? [])] })
    oncanvi()
  }

  function treu(i) {
    target().splice(i, 1)
    oncanvi()
  }

  function canviaMode(m) {
    if (m === mode) return
    mode = m
    if (m === 'diferent') {
      const base = [...(meal.tots ?? [])]
      meal.per ??= {}
      for (const p of persones) if (!meal.per[p.id]?.length) meal.per[p.id] = base.map((x) => ({ ...x }))
      meal.tots = []
    } else {
      meal.per = {}
      meal.tots ??= []
    }
    oncanvi()
  }

  async function afegeixNou() {
    const nom = nou.trim()
    if (!nom) return
    const plat = { id: rid('mp'), cat: tipus, nom, ingredients: [] }
    afegeixPlat(app.config, plat)
    await saveConfig()
    if (!seleccionat(plat)) target().push({ nom: plat.nom, ingredients: [] })
    nou = ''
    oncanvi()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">{DIES_NOM[dia]} · {TIPUS_NOM[tipus]}</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>

    <span class="etiqueta">Per a qui</span>
    <div class="xips">
      <button class="xip-llarg" class:actiu={mode === 'igual'} onclick={() => canviaMode('igual')} type="button">
        Igual per a tots
      </button>
      <button class="xip-llarg" class:actiu={mode === 'diferent'} onclick={() => canviaMode('diferent')} type="button">
        Diferent per persona
      </button>
    </div>

    {#if mode === 'diferent'}
      <div class="persones">
        {#each persones as p (p.id)}
          <button class="persona" class:actiu={persona === p.id} onclick={() => (persona = p.id)} type="button">
            <span class="punt" style="background: {p.color}"></span>
            {p.nom}
            {#if meal.per?.[p.id]?.length}<span class="compte">{meal.per[p.id].length}</span>{/if}
          </button>
        {/each}
      </div>
    {/if}

    <span class="etiqueta">Triat</span>
    {#if target().length === 0}
      <p class="suau" style="margin: 2px 0 8px">Encara no hi ha cap plat.</p>
    {:else}
      <div class="triats">
        {#each target() as pl, i (pl.nom)}
          <button class="triat" onclick={() => treu(i)} type="button">
            {pl.nom} <span class="x">✕</span>
          </button>
        {/each}
      </div>
    {/if}

    <span class="etiqueta">Plats</span>
    <div class="cataleg">
      {#each plats as pl (pl.id)}
        <button class="opcio-plat" class:sel={seleccionat(pl)} onclick={() => alternaPlat(pl)} type="button">
          {pl.nom}
        </button>
      {/each}
    </div>

    <div class="fila" style="gap: 6px; margin-top: 10px">
      <input
        class="camp"
        bind:value={nou}
        placeholder="Nou plat..."
        onkeydown={(e) => e.key === 'Enter' && afegeixNou()}
      />
      <button class="boto ghost" onclick={afegeixNou} type="button" disabled={!nou.trim()}>Afegir</button>
    </div>

    <div class="fila" style="gap: 8px; margin-top: 16px">
      <button class="boto" style="flex: 1" onclick={onclose}>Fet</button>
    </div>
  </div>
</div>

<style>
  .xips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .xip-llarg {
    flex: 1;
    min-width: 110px;
    padding: 8px 6px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-weight: 600;
    font-size: 12px;
  }
  .xip-llarg.actiu {
    background: var(--primari-suau);
    border-color: var(--primari);
    color: var(--primari);
  }
  .persones {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .persona {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-weight: 600;
    font-size: 12px;
  }
  .persona.actiu {
    border-color: var(--primari);
    color: var(--text);
  }
  .compte {
    background: var(--primari);
    color: #fff;
    border-radius: 999px;
    font-size: 10px;
    padding: 0 5px;
  }
  .triats {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin: 2px 0 8px;
  }
  .triat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--primari-suau);
    border: 1px solid var(--primari);
    color: var(--primari);
    font-size: 12px;
    font-weight: 600;
  }
  .triat .x {
    font-size: 10px;
  }
  .cataleg {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .opcio-plat {
    padding: 7px 11px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--text);
    font-size: 12px;
  }
  .opcio-plat.sel {
    background: var(--primari);
    border-color: var(--primari);
    color: #fff;
  }
</style>
