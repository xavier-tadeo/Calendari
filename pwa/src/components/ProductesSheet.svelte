<script>
  import { app } from '../lib/state.svelte.js'
  import {
    catsDe,
    catDe,
    catPerNom,
    CAT_ALTRES,
    desaProducte,
    actualitzaProducte,
    esborraProducte,
    productesDe,
    rid,
  } from '../lib/compra.js'
  import { saveCompra } from '../lib/load.js'

  let { onclose } = $props()

  let busca = $state('')
  let cat = $state('tots')

  const cats = $derived(catsDe(app.compra))
  const tots = $derived(
    [...productesDe(app.compra)].sort((a, b) => a.nom.localeCompare(b.nom, 'ca')),
  )
  const llista = $derived(
    tots
      .filter((p) => cat === 'tots' || p.cat === cat)
      .filter((p) => p.nom.toLowerCase().includes(busca.trim().toLowerCase())),
  )

  let edit = $state(null)

  function obrirNou() {
    const nom = busca.trim()
    edit = {
      id: rid('p'),
      nom,
      cat: nom ? catPerNom(app.compra, nom) : CAT_ALTRES,
      nova: true,
    }
  }

  function obrirEdit(p) {
    edit = { ...p, nova: false }
  }

  const valid = $derived(Boolean(edit?.nom.trim()))

  async function desar() {
    if (!valid) return
    const canvis = { nom: edit.nom.trim(), cat: edit.cat }
    if (edit.nova) desaProducte(app.compra, canvis.nom, canvis.cat)
    else actualitzaProducte(app.compra, edit.id, canvis)
    await saveCompra()
    cat = 'tots'
    busca = ''
    edit = null
  }

  async function esborrar() {
    if (!edit || edit.nova) return
    esborraProducte(app.compra, edit.id)
    await saveCompra()
    edit = null
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">Productes desats</h2>
      <button class="boto ghost" onclick={onclose} type="button">✕</button>
    </div>
    <p class="suau" style="margin: 0 0 8px">
      Els productes que guardes aquí els pots afegir a qualsevol llista sense tornar-los a escriure. S'ordenen
      alfabèticament.
    </p>

    <input class="camp" bind:value={busca} placeholder="Cercar o escriure un producte nou..." />

    <div class="cats">
      <button class="cat" class:actiu={cat === 'tots'} onclick={() => (cat = 'tots')} type="button">
        Tots ({tots.length})
      </button>
      {#each cats as c (c.id)}
        <button class="cat" class:actiu={cat === c.id} onclick={() => (cat = c.id)} type="button">
          {c.icona} {c.nom}
        </button>
      {/each}
    </div>

    <div class="llista">
      {#each llista as p (p.id)}
        <div class="item">
          <button class="info" onclick={() => obrirEdit(p)} type="button">
            <strong>{p.nom}</strong>
            <span class="meta">{catDe(app.compra, p.cat).icona} {catDe(app.compra, p.cat).nom}</span>
          </button>
          <button class="boto ghost petit" onclick={() => obrirEdit(p)} type="button">✏️</button>
        </div>
      {:else}
        <p class="suau">Cap producte coincideix.</p>
      {/each}
    </div>

    <button class="boto ghost" style="width: 100%; margin-top: 8px" onclick={obrirNou} type="button">
      ＋ Nou producte{busca.trim() ? ` «${busca.trim()}»` : ''}
    </button>
  </div>
</div>

{#if edit}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={() => (edit = null)} role="presentation">
    <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="fila espai" style="margin-bottom: 6px">
        <h2 class="titol">{edit.nova ? 'Nou producte' : 'Editar producte'}</h2>
        <button class="boto ghost" onclick={() => (edit = null)} type="button">✕</button>
      </div>

      <label class="etiqueta" for="pr-nom">Nom</label>
      <input
        id="pr-nom"
        class="camp"
        bind:value={edit.nom}
        onkeydown={(e) => e.key === 'Enter' && desar()}
        placeholder="p. ex. Llet sencera"
      />

      <label class="etiqueta" for="pr-cat">Categoria</label>
      <select id="pr-cat" class="camp" bind:value={edit.cat}>
        {#each cats as c (c.id)}
          <option value={c.id}>{c.icona} {c.nom}</option>
        {/each}
      </select>

      <div class="fila" style="gap: 8px; margin-top: 16px">
        {#if !edit.nova}
          <button class="boto secundari" onclick={esborrar} type="button">🗑</button>
        {/if}
        <button class="boto secundari" style="flex: 1" onclick={() => (edit = null)} type="button">
          Cancel·lar
        </button>
        <button class="boto" style="flex: 1" onclick={desar} disabled={!valid} type="button">Desar</button>
      </div>
    </div>
  </div>
{/if}

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
    margin-top: 4px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 2px;
    border-bottom: 1px solid var(--linia);
  }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    text-align: left;
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
