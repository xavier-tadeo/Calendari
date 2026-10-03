<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM, iso, parseISO, todayISO, diesSetmana } from '../lib/dates.js'
  import { nens } from '../lib/config.js'
  import { TASQUES_NENES } from '../lib/tasques.js'
  import { marcar, potBescanviar, bescanviar } from '../lib/punts.js'
  import { saveEstat } from '../lib/load.js'

  const kids = $derived(nens(app.config))
  const dies = diesSetmana(parseISO(todayISO()))

  function clau(t, nen, d) {
    return `${t.id}_${nen.id}_${iso(d)}`
  }

  async function toggle(t, nen, d, checked) {
    marcar(app.estat, clau(t, nen, d), nen.id, t.punts, checked)
    await saveEstat()
  }

  async function bescanvia(premiId, kid) {
    bescanviar(app.estat, premiId, kid)
    await saveEstat()
  }
</script>

<h1 class="titol" style="margin-bottom: 12px">Punts de les nenes</h1>

{#each kids as nen (nen.id)}
  <div class="targeta" style="margin-bottom: 12px">
    <div class="fila espai" style="margin-bottom: 8px">
      <div class="fila" style="gap: 8px">
        <span class="punt" style="background: {nen.color}"></span>
        <strong>{nen.nom}</strong>
      </div>
      <span class="xip">⭐ {app.estat?.punts?.[nen.id] ?? 0} punts</span>
    </div>

    {#each DIES as d (d)}
      {@const dt = dies[d]}
      <div class="dia">
        <span class="suau">{DIES_NOM[d]}</span>
        {#each TASQUES_NENES.filter((t) => t.dies.includes(d)) as t (t.id)}
          <label class="fila" style="gap: 8px; padding: 3px 0">
            <input
              type="checkbox"
              checked={Boolean(app.estat?.checkins?.[clau(t, nen, dt)])}
              onchange={(e) => toggle(t, nen, dt, e.currentTarget.checked)}
            />
            <span style="flex: 1">{t.nom}</span>
            <span class="suau">+{t.punts}</span>
          </label>
        {/each}
      </div>
    {/each}
  </div>
{/each}

<h2 class="titol" style="font-size: 18px; margin: 16px 0 6px">Premis</h2>
{#each kids as nen (nen.id)}
  <div class="targeta" style="margin-bottom: 10px">
    <strong>{nen.nom}</strong>
    {#each app.estat?.premis ?? [] as p (p.id)}
      <div class="fila espai" style="padding: 5px 0">
        <span style="flex: 1">{p.nom}</span>
        <span class="suau">{p.cost}</span>
        <button
          class="boto secundari"
          disabled={!potBescanviar(app.estat, nen.id, p.cost)}
          onclick={() => bescanvia(p.id, nen.id)}
        >
          Bescanviar
        </button>
      </div>
    {/each}
  </div>
{/each}

<style>
  .dia {
    border-top: 1px solid var(--linia);
    padding: 6px 0;
  }
</style>
