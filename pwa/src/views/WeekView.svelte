<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM, iso, parseISO, todayISO, addDies, diesSetmana } from '../lib/dates.js'
  import { colorsMembres, adults, nens } from '../lib/config.js'
  import { generateSetmana } from '../lib/tasques.js'

  let ref = $state(todayISO())
  const refDate = $derived(parseISO(ref))
  const dies = $derived(diesSetmana(refDate))
  const tasques = $derived(generateSetmana(app.config, refDate))
  const colors = $derived(colorsMembres(app.config))
  const noms = $derived(
    Object.fromEntries([...adults(app.config), ...nens(app.config)].map((m) => [m.id, m.nom])),
  )

  function mou(n) {
    ref = iso(addDies(refDate, n * 7))
  }

  function delDia(k) {
    return tasques.filter((t) => t.dia === k)
  }

  const nomSetmana = $derived(
    `${dies.dl.getDate()}/${dies.dl.getMonth() + 1} – ${dies.dg.getDate()}/${dies.dg.getMonth() + 1}`,
  )
</script>

<div class="fila espai" style="margin-bottom: 12px">
  <button class="boto ghost" onclick={() => mou(-1)} aria-label="Setmana anterior">‹</button>
  <div style="text-align: center">
    <h1 class="titol">Setmana</h1>
    <div class="suau">{nomSetmana}</div>
  </div>
  <button class="boto ghost" onclick={() => mou(1)} aria-label="Setmana seguent">›</button>
</div>

{#each DIES as d (d)}
  {@const files = delDia(d)}
  <div class="targeta" style="margin-bottom: 10px">
    <div class="fila espai" style="margin-bottom: 6px">
      <strong>{DIES_NOM[d]}</strong>
      <span class="suau">{dies[d].getDate()}/{dies[d].getMonth() + 1}</span>
    </div>
    {#if files.length === 0}
      <span class="suau">Sense tasques</span>
    {:else}
      {#each files as t (t.task_id)}
        <div class="fila" style="gap: 8px; padding: 4px 0">
          <span class="punt" style="background: {colors[t.assignat] || '#888'}"></span>
          <span style="flex: 1">{t.nom}</span>
          <span class="suau">{noms[t.assignat] ?? t.assignat}</span>
        </div>
      {/each}
    {/if}
  </div>
{/each}
