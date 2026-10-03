<script>
  import { app } from '../lib/state.svelte.js'
  import { adults, colorsMembres } from '../lib/config.js'
  import { DIES_NOM } from '../lib/dates.js'
  import { assigna, toggleFet, eliminaInstancia } from '../lib/setmanes.js'
  import { fixaPersona, esborraPla } from '../lib/tasques.js'
  import { saveConfig, saveSetmanes } from '../lib/load.js'

  let { inst, refDate, onclose, oneditar } = $props()

  const opcions = $derived([{ id: 'familia', nom: 'Familia' }, ...adults(app.config)])
  const colors = $derived(colorsMembres(app.config))

  let sel = $state(inst.assignat)
  let fet = $state(inst.fet)

  async function reassigna(id) {
    sel = id
    assigna(app.setmanes, refDate, inst.key, id)
    await saveSetmanes()
  }
  async function sempre() {
    fixaPersona(app.config, inst.task_id, sel)
    await saveConfig()
  }
  async function canviaFet() {
    fet = !fet
    toggleFet(app.setmanes, refDate, inst.key, fet)
    await saveSetmanes()
  }
  async function esborraSetmana() {
    eliminaInstancia(app.setmanes, refDate, inst.key)
    await saveSetmanes()
    onclose()
  }
  async function esborraSempre() {
    esborraPla(app.config, inst.task_id)
    await saveConfig()
    onclose()
  }
  function editar() {
    oneditar(inst)
    onclose()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 4px">
      <h2 class="titol">{inst.nom}</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>
    <div class="suau" style="margin-bottom: 12px">
      {DIES_NOM[inst.dia]}{#if inst.custom} · tasca puntual{/if}
    </div>

    {#if inst.nota}
      <p class="suau" style="margin: 0 0 12px">⚠️ {inst.nota}</p>
    {/if}

    <span class="etiqueta" style="margin-top: 0">Qui ho fa</span>
    <div class="opcions">
      {#each opcions as o (o.id)}
        <button
          class="opcio"
          class:actiu={sel === o.id}
          onclick={() => reassigna(o.id)}
          type="button"
        >
          <span class="punt" style="background: {colors[o.id] || '#9aa4b8'}"></span>
          {o.nom}
        </button>
      {/each}
    </div>

    {#if !inst.custom}
      <button class="boto secundari" style="width: 100%; margin-top: 10px" onclick={sempre}>
        📌 Que sempre la faci {opcions.find((o) => o.id === sel)?.nom ?? sel}
      </button>
    {/if}

    <button class="boto" style="width: 100%; margin-top: 10px" onclick={canviaFet}>
      {fet ? '↩︎ Marcar com a pendent' : '✓ Marcar com a feta'}
    </button>

    <div class="fila" style="gap: 8px; margin-top: 10px">
      <button class="boto secundari" style="flex: 1" onclick={editar}>✏️ Editar</button>
      <button class="boto ghost" style="flex: 1; color: var(--perill)" onclick={esborraSetmana}>
        🗑️ Aquesta setmana
      </button>
    </div>

    {#if !inst.custom}
      <button class="boto ghost" style="width: 100%; margin-top: 6px; color: var(--perill)" onclick={esborraSempre}>
        Treure del pla (totes les setmanes)
      </button>
    {/if}
  </div>
</div>

<style>
  .opcions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .opcio {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 13px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--linia);
    font-weight: 600;
  }
  .opcio.actiu {
    background: var(--primari-suau);
    border-color: var(--primari);
    color: var(--primari);
  }
</style>
