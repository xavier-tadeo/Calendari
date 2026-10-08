<script>
  import { app } from '../lib/state.svelte.js'
  import { saveCompra } from '../lib/load.js'
  import {
    catsDe,
    itemsPerCategoria,
    comptatge,
    afegeixItem,
    actualitzaItem,
    esborraItem,
    netejaComprats,
    afegeixCat,
    actualitzaCat,
    esborraCat,
    rid,
  } from '../lib/compra.js'

  let { llista, onclose } = $props()

  let vista = $state('llista')
  let nou = $state({ nom: '', quantitat: '', cat: 'altres' })
  let editant = $state(null)
  let novaCat = $state('')
  let pendent = false
  let timer = null

  const cats = $derived(catsDe(app.compra))
  const grups = $derived(itemsPerCategoria(llista, app.compra))
  const ct = $derived(comptatge(llista))
  const suggerits = $derived([...new Set((app.compra?.llistes ?? []).flatMap((l) => (l.items ?? []).map((i) => i.nom)))])

  function desa() {
    pendent = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      pendent = false
      saveCompra()
    }, 350)
  }

  function afegeix() {
    const nom = nou.nom.trim()
    if (!nom) return
    afegeixItem(llista, { nom, quantitat: nou.quantitat.trim(), cat: nou.cat })
    nou.nom = ''
    nou.quantitat = ''
    desa()
  }

  function alterna(it) {
    it.comprat = !it.comprat
    desa()
  }

  function neteja() {
    if (!ct.comprats) return
    netejaComprats(llista)
    desa()
  }

  function obrirItem(it) {
    editant = { id: it.id, nom: it.nom, quantitat: it.quantitat ?? '', cat: it.cat }
  }

  async function desarItem() {
    if (!editant || !editant.nom.trim()) return
    actualitzaItem(llista, editant.id, {
      nom: editant.nom.trim(),
      quantitat: editant.quantitat.trim(),
      cat: editant.cat,
    })
    editant = null
    desa()
  }

  async function esborrarItem() {
    if (!editant) return
    esborraItem(llista, editant.id)
    editant = null
    desa()
  }

  async function crearCategoria() {
    const nom = novaCat.trim()
    if (!nom) return
    nou.cat = afegeixCat(app.compra, nom)
    novaCat = ''
    desa()
  }

  async function esborrarCategoria(id) {
    esborraCat(app.compra, id)
    if (nou.cat === id) nou.cat = 'altres'
    desa()
  }

  async function tanca() {
    clearTimeout(timer)
    if (pendent) {
      pendent = false
      await saveCompra()
    }
    onclose()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={tanca} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 4px">
      <h2 class="titol">{llista.icona} {llista.nom}</h2>
      <div class="fila" style="gap: 6px">
        <button
          class="boto ghost"
          onclick={() => (vista = vista === 'cats' ? 'llista' : 'cats')}
          aria-label="Categories"
          type="button"
        >
          {vista === 'cats' ? 'Tornar' : '⚙️'}
        </button>
        <button class="boto ghost" onclick={tanca} type="button">✕</button>
      </div>
    </div>

    {#if vista === 'cats'}
      <p class="suau" style="margin: 4px 0 8px">Categories per agrupar la llista (es poden reanomenar i esborrar).</p>
      {#each cats as c (c.id)}
        <div class="fila" style="gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--linia)">
          <span style="flex: none">{c.icona}</span>
          <input
            class="camp"
            style="flex: 1"
            value={c.nom}
            disabled={c.id === 'altres'}
            onchange={(e) => {
              actualitzaCat(app.compra, c.id, e.target.value)
              desa()
            }}
          />
          <button
            class="boto ghost"
            onclick={() => esborrarCategoria(c.id)}
            disabled={c.id === 'altres'}
            type="button"
          >
            🗑
          </button>
        </div>
      {/each}
      <div class="fila" style="gap: 6px; margin-top: 12px">
        <input class="camp" style="flex: 1" bind:value={novaCat} placeholder="Nova categoria..." />
        <button class="boto ghost" onclick={crearCategoria} disabled={!novaCat.trim()} type="button">
          ＋ Afegir
        </button>
      </div>
      <div class="fila" style="gap: 8px; margin-top: 16px">
        <button class="boto" style="flex: 1" onclick={() => (vista = 'llista')}>Fet</button>
      </div>
    {:else}
      {#if llista.automatica}
        <p class="suau" style="margin: 4px 0 0">
          S'actualitza amb els ingredients del menú. Els productes que hi afegeixis a mà es queden.
        </p>
      {/if}

      <div class="progres">
        <div class="fila espai" style="margin-bottom: 4px">
          <span class="suau">{ct.comprats} de {ct.total} comprats</span>
          <span class="suau">{ct.pct}%</span>
        </div>
        <div class="barra">
          <div class="farcit" style="width: {ct.pct}%"></div>
        </div>
      </div>

      <div class="fila" style="gap: 6px; margin-top: 10px">
        <input
          class="camp"
          style="flex: 1; min-width: 0"
          list="suggerits"
          bind:value={nou.nom}
          placeholder="Afegir producte..."
          onkeydown={(e) => e.key === 'Enter' && afegeix()}
        />
        <input
          class="camp"
          style="width: 64px; text-align: center"
          bind:value={nou.quantitat}
          placeholder="x1"
          onkeydown={(e) => e.key === 'Enter' && afegeix()}
        />
        <button class="boto ghost" onclick={afegeix} disabled={!nou.nom.trim()} type="button">＋</button>
      </div>
      <datalist id="suggerits">
        {#each suggerits as s (s)}
          <option value={s}></option>
        {/each}
      </datalist>
      <select class="camp" bind:value={nou.cat} aria-label="Categoria del producte" style="margin-top: 6px">
        {#each cats as c (c.id)}
          <option value={c.id}>{c.icona} {c.nom}</option>
        {/each}
      </select>

      <div class="cos">
        {#if !ct.total}
          <p class="suau" style="margin-top: 16px">La llista és buida.</p>
        {/if}
        {#each grups as g (g.cat.id)}
          <div class="grup">
            <span class="grup-titol">{g.cat.icona} {g.cat.nom}</span>
            {#each g.items as it (it.id)}
              <div class="fila item" class:comprat={it.comprat}>
                <input
                  type="checkbox"
                  checked={it.comprat}
                  onchange={() => alterna(it)}
                  aria-label="Marcar {it.nom}"
                />
                <button class="nom-item" onclick={() => alterna(it)} type="button">
                  <span class="nom-txt">{it.nom}</span>
                  {#if it.quantitat}<span class="quantitat">{it.quantitat}</span>{/if}
                </button>
                <button class="mini" onclick={() => obrirItem(it)} aria-label="Editar {it.nom}" type="button">
                  ✏️
                </button>
              </div>
            {/each}
          </div>
        {/each}
      </div>

      <div class="fila" style="gap: 8px; margin-top: 12px">
        <button class="boto secundari" style="flex: 1" onclick={neteja} disabled={!ct.comprats} type="button">
          🧹 Netejar comprats{ct.comprats ? ` (${ct.comprats})` : ''}
        </button>
      </div>
    {/if}
  </div>
</div>

{#if editant}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={() => (editant = null)} role="presentation">
    <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="fila espai" style="margin-bottom: 6px">
        <h2 class="titol">Producte</h2>
        <button class="boto ghost" onclick={() => (editant = null)}>✕</button>
      </div>

      <label class="etiqueta" for="c-nom">Nom</label>
      <input id="c-nom" class="camp" bind:value={editant.nom} />

      <label class="etiqueta" for="c-q">Quantitat</label>
      <input id="c-q" class="camp" bind:value={editant.quantitat} placeholder="p. ex. x2, 1 kg, 500 g" />

      <label class="etiqueta" for="c-cat">Categoria</label>
      <select id="c-cat" class="camp" bind:value={editant.cat}>
        {#each cats as c (c.id)}
          <option value={c.id}>{c.icona} {c.nom}</option>
        {/each}
      </select>

      <div class="fila" style="gap: 8px; margin-top: 16px">
        <button class="boto secundari" onclick={esborrarItem}>🗑</button>
        <button class="boto secundari" style="flex: 1" onclick={() => (editant = null)}>Cancel·lar</button>
        <button class="boto" style="flex: 1" onclick={desarItem} disabled={!editant.nom.trim()}>Desar</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .progres {
    margin-top: 8px;
  }
  .barra {
    height: 8px;
    border-radius: 999px;
    background: #eceff1;
    overflow: hidden;
  }
  .farcit {
    height: 100%;
    background: var(--primari);
    transition: width 0.2s;
  }
  .cos {
    margin-top: 12px;
    max-height: 46vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .grup {
    border: 1px solid var(--linia);
    border-radius: 12px;
    padding: 6px 8px;
    margin-bottom: 8px;
  }
  .grup-titol {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #7a7a7a;
    padding: 3px 0;
  }
  .item {
    gap: 10px;
    padding: 4px 0;
  }
  .item input[type='checkbox'] {
    width: 20px;
    height: 20px;
    flex: none;
    accent-color: var(--primari);
  }
  .nom-item {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 8px;
    text-align: left;
    padding: 6px 0;
    font-size: 14px;
    color: var(--text);
  }
  .nom-txt {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .quantitat {
    flex: none;
    font-size: 12px;
    font-weight: 700;
    color: var(--suau);
    background: #f1f1f1;
    border-radius: 6px;
    padding: 1px 6px;
  }
  .item.comprat .nom-txt {
    text-decoration: line-through;
    color: var(--suau);
  }
  .mini {
    flex: none;
    padding: 5px 8px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid var(--linia);
    font-size: 12px;
  }
</style>
