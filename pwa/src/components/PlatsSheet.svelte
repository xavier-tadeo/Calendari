<script>
  import { app } from '../lib/state.svelte.js'
  import { CAT_MENJAR, platsCataleg, afegeixPlat, actualitzaPlat, esborraPlat } from '../lib/menu.js'
  import { saveConfig } from '../lib/load.js'

  let { onclose } = $props()

  const rid = (p) => p + Math.random().toString(16).slice(2, 9)

  let cat = $state(CAT_MENJAR[0].id)
  let busca = $state('')

  const plats = $derived(platsCataleg(app.config))
  const llista = $derived(
    plats
      .filter((p) => p.cat === cat)
      .filter((p) => p.nom.toLowerCase().includes(busca.trim().toLowerCase())),
  )

  let edit = $state(null)
  function obrirNova() {
    edit = { id: rid('mp'), cat, nom: '', ingredients: [], nova: true }
  }
  function obrirEdit(p) {
    edit = { ...p, ingredients: [...(p.ingredients ?? [])], nova: false, ing: (p.ingredients ?? []).join(', ') }
  }
  const valid = $derived(edit && edit.nom.trim())

  async function desar() {
    if (!valid) return
    const ingredients = (edit.ing ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const canvis = { nom: edit.nom.trim(), cat: edit.cat, ingredients }
    if (edit.nova) afegeixPlat(app.config, { id: edit.id, ...canvis })
    else actualitzaPlat(app.config, edit.id, canvis)
    await saveConfig()
    cat = edit.cat
    edit = null
  }
  async function esborrar() {
    if (!edit || edit.nova) return
    esborraPlat(app.config, edit.id)
    await saveConfig()
    edit = null
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">Llista de plats</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>
    <p class="suau" style="margin: 0 0 8px">Crea, renombra o esborra els plats que surten al menú.</p>

    <input class="camp" bind:value={busca} placeholder="Cercar plat..." />

    <div class="cats">
      {#each CAT_MENJAR as c (c.id)}
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
            {#if p.ingredients?.length}<span class="meta">{p.ingredients.join(', ')}</span>{/if}
          </button>
          <button class="boto ghost petit" onclick={() => obrirEdit(p)} type="button">✏️</button>
        </div>
      {:else}
        <p class="suau">Cap plat coincideix.</p>
      {/each}
    </div>

    <button class="boto ghost" style="width: 100%; margin-top: 8px" onclick={obrirNova} type="button">
      ＋ Nou plat a «{CAT_MENJAR.find((c) => c.id === cat)?.nom}»
    </button>
  </div>
</div>

{#if edit}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={() => (edit = null)} role="presentation">
    <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="fila espai" style="margin-bottom: 6px">
        <h2 class="titol">{edit.nova ? 'Nou plat' : 'Editar plat'}</h2>
        <button class="boto ghost" onclick={() => (edit = null)}>✕</button>
      </div>

      <label class="etiqueta" for="p-nom">Nom</label>
      <input id="p-nom" class="camp" bind:value={edit.nom} placeholder="p. ex. Croquetes" />

      <label class="etiqueta" for="p-cat">Tipus</label>
      <select id="p-cat" class="camp" bind:value={edit.cat}>
        {#each CAT_MENJAR as c (c.id)}
          <option value={c.id}>{c.icona} {c.nom}</option>
        {/each}
      </select>

      <label class="etiqueta" for="p-ing">Ingredients (separats per comes)</label>
      <input id="p-ing" class="camp" bind:value={edit.ing} placeholder="p. ex. patates, ou, ceba" />

      <div class="fila" style="gap: 8px; margin-top: 16px">
        {#if !edit.nova}
          <button class="boto secundari" onclick={esborrar}>🗑</button>
        {/if}
        <button class="boto secundari" style="flex: 1" onclick={() => (edit = null)}>Cancel·lar</button>
        <button class="boto" style="flex: 1" onclick={desar} disabled={!valid}>Desar</button>
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
