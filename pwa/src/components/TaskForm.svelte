<script>
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import { app } from '../lib/state.svelte.js'
  import { adults } from '../lib/config.js'
  import { afegeixPla, actualitzaPla } from '../lib/tasques.js'
  import { afegeixCustom, actualitzaCustom } from '../lib/setmanes.js'
  import { saveConfig, saveSetmanes } from '../lib/load.js'

  let { tasca = null, custom = false, dia = 'dl', refDate, onclose } = $props()

  const adultsList = adults(app.config)

  let nom = $state(tasca?.nom ?? '')
  let dies = $state(tasca?.dies ? [...tasca.dies] : dia ? [dia] : [])
  let assignat = $state(
    custom
      ? (tasca?.assignat || 'familia')
      : tasca?.fix
        ? tasca.fix
        : tasca?.tipus === 'familia'
          ? 'familia'
          : 'rotatiu',
  )
  let permanent = $state(!custom)

  function alterna(d) {
    dies = dies.includes(d) ? dies.filter((x) => x !== d) : [...dies, d]
  }

  async function desar() {
    if (!nom.trim() || dies.length === 0) return
    if (tasca) {
      if (custom) {
        actualitzaCustom(app.setmanes, refDate, tasca.id, { nom: nom.trim(), dies, assignat })
        await saveSetmanes()
      } else {
        const canvis = { nom: nom.trim(), dies }
        if (assignat === 'familia') {
          canvis.tipus = 'familia'
          canvis.fix = null
        } else if (assignat === 'rotatiu') {
          canvis.tipus = tasca.tipus === 'escola' ? 'escola' : 'rotatiu'
          canvis.fix = null
        } else {
          canvis.tipus = 'rotatiu'
          canvis.fix = assignat
        }
        actualitzaPla(app.config, tasca.id, canvis)
        await saveConfig()
      }
    } else if (permanent) {
      const nova = { id: 't' + Math.random().toString(16).slice(2, 9), nom: nom.trim(), dies, tipus: 'rotatiu', fix: null }
      if (assignat === 'familia') nova.tipus = 'familia'
      else if (assignat !== 'rotatiu') nova.fix = assignat
      afegeixPla(app.config, nova)
      await saveConfig()
    } else {
      afegeixCustom(app.setmanes, refDate, {
        id: 'c' + Math.random().toString(16).slice(2, 9),
        nom: nom.trim(),
        dies,
        assignat,
      })
      await saveSetmanes()
    }
    onclose()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">{tasca ? 'Editar tasca' : 'Nova tasca'}</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>

    <label class="etiqueta" for="tasca-nom">Nom</label>
    <input id="tasca-nom" class="camp" bind:value={nom} placeholder="p. ex. Rentar el cotxe" />

    <span class="etiqueta">Dies</span>
    <div class="dies">
      {#each DIES as d (d)}
        <button class="xip-dia" class:actiu={dies.includes(d)} onclick={() => alterna(d)} type="button">
          {DIES_NOM[d].slice(0, 3)}
        </button>
      {/each}
    </div>

    <label class="etiqueta" for="tasca-obs">Qui la fa</label>
    <select id="tasca-obs" class="camp" bind:value={assignat}>
      {#if !custom}
        <option value="rotatiu">Rotatiu (es va canviant)</option>
      {/if}
      <option value="familia">Els dos / Familia</option>
      {#each adultsList as a (a.id)}
        <option value={a.id}>{a.nom}</option>
      {/each}
    </select>

    {#if !tasca && !custom}
      <label class="fila" style="gap: 8px; margin-top: 14px; align-items: center">
        <input type="checkbox" bind:checked={permanent} />
        <span>Afegir al pla de cada setmana (si no, només aquesta)</span>
      </label>
    {/if}

    {#if tasca && !custom}
      <p class="suau" style="margin-top: 10px">
        Aquesta és una tasca del pla: els canvis afecten totes les setmanes.
      </p>
    {/if}

    <div class="fila" style="gap: 8px; margin-top: 16px">
      <button class="boto secundari" style="flex: 1" onclick={onclose}>Cancel·lar</button>
      <button class="boto" style="flex: 1" onclick={desar} disabled={!nom.trim() || dies.length === 0}>Desar</button>
    </div>
  </div>
</div>

<style>
  .dies {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .xip-dia {
    flex: 1;
    min-width: 40px;
    padding: 8px 0;
    border-radius: 10px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-weight: 600;
    font-size: 12px;
  }
  .xip-dia.actiu {
    background: var(--primari-suau);
    border-color: var(--primari);
    color: var(--primari);
  }
</style>
