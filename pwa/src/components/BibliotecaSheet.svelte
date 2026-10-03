<script>
  import { app } from '../lib/state.svelte.js'
  import { CATEGORIES, BIBLIOTECA, PESOS } from '../lib/biblioteca.js'
  import { afegeixPla, esborraPla, plaTasques } from '../lib/tasques.js'
  import { saveConfig } from '../lib/load.js'

  let { onclose } = $props()

  let cat = $state(CATEGORIES[0].id)
  let busca = $state('')

  const idsPla = $derived(new Set(plaTasques(app.config).map((t) => t.id)))

  const llista = $derived(
    BIBLIOTECA.filter((t) => t.cat === cat).filter((t) =>
      t.nom.toLowerCase().includes(busca.trim().toLowerCase()),
    ),
  )

  const pendents = $derived(BIBLIOTECA.filter((t) => !idsPla.has(t.id)).length)

  async function afegir(t) {
    if (idsPla.has(t.id)) return
    const nova = {
      id: t.id,
      nom: t.nom,
      dies: [...t.dies],
      tipus: t.tipus,
      fix: null,
      hora: t.hora ?? null,
      pes: t.pes ?? 2,
      freq: t.freq ?? 'setmanal',
    }
    if (t.paritat !== undefined) nova.paritat = t.paritat
    if (t.dia_mes !== undefined) nova.dia_mes = t.dia_mes
    afegeixPla(app.config, nova)
    await saveConfig()
  }

  async function treure(t) {
    esborraPla(app.config, t.id)
    await saveConfig()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">Biblioteca de tasques</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>
    <p class="suau" style="margin: 0 0 8px">
      Toca una tasca per afegir-la al pla setmanal. {pendents} sense afegir.
    </p>

    <input class="camp" bind:value={busca} placeholder="Cercar tasca..." />

    <div class="cats">
      {#each CATEGORIES as c (c.id)}
        <button class="cat" class:actiu={cat === c.id} onclick={() => (cat = c.id)} type="button">
          {c.icona} {c.nom}
        </button>
      {/each}
    </div>

    <div class="llista">
      {#each llista as t (t.id)}
        {@const dins = idsPla.has(t.id)}
        <div class="item" class:dins>
          <div class="info">
            <strong>{t.nom}</strong>
            <span class="meta">
              {PESOS[t.pes] ?? 'Mitjana'}{#if t.freq === 'quinzenal'} · cada 2 setm.{:else if t.freq === 'mensual'} · mensual{/if}{#if t.hora} · {t.hora}{/if}
            </span>
          </div>
          {#if dins}
            <button class="boto ghost petit" onclick={() => treure(t)} type="button">✓ Traure</button>
          {:else}
            <button class="boto petit" onclick={() => afegir(t)} type="button">＋ Afegir</button>
          {/if}
        </div>
      {:else}
        <p class="suau">Cap tasca coincideix.</p>
      {/each}
    </div>
  </div>
</div>

<style>
  .cats {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 6px 0;
    margin-top: 8px;
  }
  .cat {
    flex: none;
    padding: 7px 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-weight: 600;
    font-size: 12px;
    white-space: nowrap;
  }
  .cat.actiu {
    background: var(--primari-suau);
    border-color: var(--primari);
    color: var(--primari);
  }
  .llista {
    margin-top: 8px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 4px;
    border-bottom: 1px solid var(--linia);
  }
  .item.dins .info strong {
    color: var(--suau);
  }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .info strong {
    font-size: 14px;
  }
  .meta {
    font-size: 11px;
    color: var(--suau);
  }
  .boto.petit {
    padding: 6px 10px;
    font-size: 12px;
    flex: none;
  }
</style>
