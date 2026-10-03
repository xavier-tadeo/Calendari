<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import { adults, nens } from '../lib/config.js'
  import { resumAvisos, plaTasques, actualitzaPla } from '../lib/tasques.js'
  import { PESOS } from '../lib/biblioteca.js'
  import { signOut } from '../lib/auth.svelte.js'
  import { hasSupabase } from '../lib/supabase.js'
  import { PALETA, nomColor } from '../lib/esdeveniments.js'
  import { saveConfig } from '../lib/load.js'

  const avisos = $derived(resumAvisos(app.config))
  const tasques = $derived(plaTasques(app.config))
  const PES_OPCIONS = [1, 2, 3]

  async function setColor(membre, c) {
    membre.color = c
    await saveConfig()
  }

  async function setPes(tasca, pes) {
    actualitzaPla(app.config, tasca.id, { pes })
    await saveConfig()
  }
</script>

<h1 class="titol" style="margin-bottom: 12px">Configuració</h1>

{#snippet paleta(membre)}
  <div class="colors">
    {#each PALETA as c (c)}
      <button
        class="mostra"
        class:sel={membre.color === c}
        style="background:{c}"
        onclick={() => setColor(membre, c)}
        title={nomColor(c)}
        aria-label={nomColor(c)}
      ></button>
    {/each}
  </div>
{/snippet}

{#if avisos.length}
  <div class="targeta" style="margin-bottom: 12px; background: #fff7ed">
    <strong>⚠️ Avisos</strong>
    {#each avisos as a, i (i)}
      <div class="suau" style="margin-top: 4px">{a}</div>
    {/each}
  </div>
{/if}

{#each adults(app.config) as a (a.id)}
  <div class="targeta" style="margin-bottom: 10px">
    <div class="fila" style="gap: 8px; margin-bottom: 6px">
      <span class="punt" style="background: {a.color}"></span>
      <strong>{a.nom}</strong>
      {#if a.per_definir}<span class="xip">per definir</span>{/if}
    </div>
    <div class="etiqueta" style="margin-top: 0">Color</div>
    {@render paleta(a)}
    {#each DIES as d (d)}
      {@const h = a.horari?.[d] ?? {}}
      <div class="fila espai suau" style="padding: 2px 0">
        <span>{DIES_NOM[d]}</span>
        <span>
          {#if h.fora?.length}
            fora {h.fora[0]}–{h.fora[1]}
          {:else if h.lloc}
            {h.lloc}
          {:else}
            lliure
          {/if}
        </span>
      </div>
    {/each}
  </div>
{/each}

<div class="targeta" style="margin-bottom: 10px">
  <strong>Nenes</strong>
  {#each nens(app.config) as n (n.id)}
    <div class="fila" style="gap: 8px; margin: 8px 0 0">
      <span class="punt" style="background: {n.color}"></span>
      <strong>{n.nom}</strong>
    </div>
    <div class="etiqueta" style="margin-top: 4px">Color</div>
    {@render paleta(n)}
  {/each}
</div>

<div class="targeta" style="margin-bottom: 10px">
  <strong>Extraescolars</strong>
  {#each app.config?.extraescolars ?? [] as x, i (i)}
    <div class="suau" style="margin-top: 4px">
      {DIES_NOM[x.dia]} · {x.nom} ({x.inici}–{x.fi})
    </div>
  {/each}
</div>

<div class="targeta" style="margin-bottom: 10px">
  <strong>Esforç de les tasques</strong>
  <p class="suau" style="margin: 4px 0 8px">
    El pes (1 lleugera · 2 mitjana · 3 feixuga) decideix com es reparteixen perquè la càrrega sigui justa.
  </p>
  {#each tasques as t (t.id)}
    <div class="fila-pes">
      <span class="nom-tasca">{t.nom}</span>
      <div class="pes-xips">
        {#each PES_OPCIONS as p (p)}
          <button
            class="pes-xip"
            class:sel={(t.pes ?? 2) === p}
            onclick={() => setPes(t, p)}
            title={PESOS[p]}
            aria-label={PESOS[p]}
            type="button"
          >
            {p}
          </button>
        {/each}
      </div>
    </div>
  {/each}
</div>

<div class="targeta">
  <div class="fila espai">
    <span class="suau">{hasSupabase ? 'Connectat al nuvol' : 'Mode local'}</span>
    <button class="boto secundari" onclick={signOut}>Sortir</button>
  </div>
</div>

<style>
  .colors {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 4px 0 8px;
  }
  .mostra {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid transparent;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    color: var(--suau);
  }
  .mostra.sel {
    border-color: var(--text);
  }
  .fila-pes {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-top: 1px solid var(--linia);
  }
  .nom-tasca {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }
  .pes-xips {
    display: flex;
    gap: 4px;
    flex: none;
  }
  .pes-xip {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-weight: 700;
    font-size: 12px;
  }
  .pes-xip.sel {
    background: var(--primari-suau);
    border-color: var(--primari);
    color: var(--primari);
  }
</style>
