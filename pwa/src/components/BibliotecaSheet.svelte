<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import {
    PESOS,
    catsBiblioteca,
    tasquesBiblioteca,
    afegeixCategoria,
    actualitzaCategoria,
    esborraCategoria,
    afegeixTascaBib,
    actualitzaTascaBib,
    esborraTascaBib,
  } from '../lib/biblioteca.js'
  import { plaTasques, afegeixPla, esborraPla } from '../lib/tasques.js'
  import { saveConfig } from '../lib/load.js'

  let { onclose } = $props()

  const rid = (p) => p + Math.random().toString(16).slice(2, 9)
  const PES_OPCIONS = [1, 2, 3]

  let catSel = $state('')
  let busca = $state('')

  const cats = $derived(catsBiblioteca(app.config))
  const bib = $derived(tasquesBiblioteca(app.config))
  const idsPla = $derived(new Set(plaTasques(app.config).map((t) => t.id)))
  const catActiu = $derived(cats.some((c) => c.id === catSel) ? catSel : (cats[0]?.id ?? ''))
  const catObj = $derived(cats.find((c) => c.id === catActiu))
  const llista = $derived(
    bib
      .filter((t) => t.cat === catActiu)
      .filter((t) => t.nom.toLowerCase().includes(busca.trim().toLowerCase())),
  )
  const pendents = $derived(bib.filter((t) => !idsPla.has(t.id)).length)

  function meta(t) {
    const parts = [PESOS[t.pes] ?? 'Mitjana']
    if (t.freq === 'quinzenal') parts.push('cada 2 setm.')
    else if (t.freq === 'mensual') parts.push(`mensual (dia ${t.dia_mes ?? 1})`)
    if (t.hora) parts.push(t.hora)
    return parts.join(' · ')
  }

  // --- Afegir al pla (triar dies) ---
  let add = $state(null)
  function obrirAdd(t) {
    add = { base: t, dies: [...(t.dies ?? [])], pes: t.pes ?? 2 }
  }
  function alternaAdd(d) {
    add.dies = add.dies.includes(d) ? add.dies.filter((x) => x !== d) : [...add.dies, d]
  }
  const addValid = $derived(add && (add.base.freq === 'mensual' || add.dies.length > 0))
  async function confirmarAdd() {
    const b = add.base
    if (!addValid) return
    const nova = {
      id: b.id,
      nom: b.nom,
      dies: [...add.dies],
      tipus: b.tipus ?? 'rotatiu',
      fix: null,
      hora: b.hora ?? null,
      pes: add.pes,
      freq: b.freq ?? 'setmanal',
    }
    if (b.paritat !== undefined) nova.paritat = b.paritat
    if (b.dia_mes !== undefined) nova.dia_mes = b.dia_mes
    afegeixPla(app.config, nova)
    await saveConfig()
    add = null
  }
  async function treure(t) {
    esborraPla(app.config, t.id)
    await saveConfig()
  }

  // --- Editar una tasca de la biblioteca ---
  let edit = $state(null)
  function obrirNova() {
    edit = { id: rid('bl'), cat: catActiu, nom: '', dies: [], hora: null, tipus: 'rotatiu', pes: 2, freq: 'setmanal', nova: true }
  }
  function obrirEdit(t) {
    edit = { ...t, dies: [...(t.dies ?? [])], nova: false }
  }
  function alternaEdit(d) {
    edit.dies = edit.dies.includes(d) ? edit.dies.filter((x) => x !== d) : [...edit.dies, d]
  }
  const editValid = $derived(edit && edit.nom.trim() && (edit.freq === 'mensual' || edit.dies.length > 0))
  async function desarEdit() {
    if (!editValid) return
    const canvis = {
      nom: edit.nom.trim(),
      cat: edit.cat,
      dies: [...edit.dies],
      hora: edit.hora || null,
      tipus: edit.tipus ?? 'rotatiu',
      pes: edit.pes,
      freq: edit.freq,
    }
    if (edit.freq === 'quinzenal') canvis.paritat = edit.paritat ?? 0
    if (edit.freq === 'mensual') canvis.dia_mes = edit.dia_mes ?? 1
    if (edit.nova) afegeixTascaBib(app.config, { id: edit.id, ...canvis })
    else actualitzaTascaBib(app.config, edit.id, canvis)
    await saveConfig()
    if (edit.cat) catSel = edit.cat
    edit = null
  }
  async function esborrarEdit() {
    if (!edit || edit.nova) return
    esborraTascaBib(app.config, edit.id)
    await saveConfig()
    edit = null
  }

  // --- Categories (subgrups) ---
  let catForm = $state(null)
  function obrirNovaCat() {
    catForm = { id: rid('cat'), nom: '', icona: '📌', nova: true }
  }
  function obrirEditCat() {
    if (catObj) catForm = { ...catObj, nova: false }
  }
  async function desarCat() {
    if (!catForm.nom.trim()) return
    const dades = { nom: catForm.nom.trim(), icona: catForm.icona?.trim() || '📌' }
    if (catForm.nova) {
      afegeixCategoria(app.config, { id: catForm.id, ...dades })
      catSel = catForm.id
    } else {
      actualitzaCategoria(app.config, catForm.id, dades)
    }
    await saveConfig()
    catForm = null
  }
  async function esborrarCat() {
    const id = catObj?.id
    if (!id) return
    if (!window.confirm(`Esborrar el subgrup «${catObj.nom}» i les seves tasques?`)) return
    esborraCategoria(app.config, id)
    catSel = ''
    await saveConfig()
    catForm = null
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
      Toca una tasca per afegir-la al pla triant els dies. {pendents} sense afegir.
    </p>

    <input class="camp" bind:value={busca} placeholder="Cercar tasca..." />

    <div class="cats">
      {#each cats as c (c.id)}
        <button class="cat" class:actiu={catActiu === c.id} onclick={() => (catSel = c.id)} type="button">
          {c.icona} {c.nom}
        </button>
      {/each}
      <button class="cat nova-cat" onclick={obrirNovaCat} type="button">＋ Subgrup</button>
    </div>

    {#if catObj}
      <div class="cat-accions">
        <button class="mini" onclick={obrirEditCat} type="button">✏️ {catObj.nom}</button>
        <button class="mini" onclick={esborrarCat} type="button">🗑 Esborrar subgrup</button>
      </div>
    {/if}

    <div class="llista">
      {#each llista as t (t.id)}
        {@const dins = idsPla.has(t.id)}
        <div class="item" class:dins>
          <button class="info" onclick={() => obrirEdit(t)} type="button">
            <strong>{t.nom}</strong>
            <span class="meta">{meta(t)}</span>
          </button>
          {#if dins}
            <button class="boto ghost petit" onclick={() => treure(t)} type="button">✓ Traure</button>
          {:else}
            <button class="boto petit" onclick={() => obrirAdd(t)} type="button">＋ Afegir</button>
          {/if}
        </div>
      {:else}
        <p class="suau">Cap tasca coincideix.</p>
      {/each}
    </div>

    <button class="boto ghost" style="width: 100%; margin-top: 8px" onclick={obrirNova} type="button">
      ＋ Nova tasca a «{catObj?.nom ?? ''}»
    </button>
  </div>
</div>

{#if add}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={() => (add = null)} role="presentation">
    <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="fila espai" style="margin-bottom: 6px">
        <h2 class="titol">Afegir al pla</h2>
        <button class="boto ghost" onclick={() => (add = null)}>✕</button>
      </div>
      <p class="suau" style="margin: 0 0 10px">{add.base.nom}</p>

      {#if add.base.freq === 'mensual'}
        <p class="suau">Un cop al mes, dia {add.base.dia_mes ?? 1}.</p>
      {:else}
        <span class="etiqueta">Dies</span>
        <div class="dies">
          {#each DIES as d (d)}
            <button class="xip-dia" class:actiu={add.dies.includes(d)} onclick={() => alternaAdd(d)} type="button">
              {DIES_NOM[d].slice(0, 3)}
            </button>
          {/each}
        </div>
        {#if add.base.freq === 'quinzenal'}
          <p class="suau" style="margin-top: 6px">Cada 2 setmanes.</p>
        {/if}
      {/if}

      <span class="etiqueta">Esforç</span>
      <div class="xips">
        {#each PES_OPCIONS as p (p)}
          <button class="xip-llarg" class:actiu={add.pes === p} onclick={() => (add.pes = p)} type="button">
            {PESOS[p]}
          </button>
        {/each}
      </div>

      <div class="fila" style="gap: 8px; margin-top: 16px">
        <button class="boto secundari" style="flex: 1" onclick={() => (add = null)}>Cancel·lar</button>
        <button class="boto" style="flex: 1" onclick={confirmarAdd} disabled={!addValid}>Afegir</button>
      </div>
    </div>
  </div>
{/if}

{#if edit}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={() => (edit = null)} role="presentation">
    <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="fila espai" style="margin-bottom: 6px">
        <h2 class="titol">{edit.nova ? 'Nova tasca' : 'Editar tasca'}</h2>
        <button class="boto ghost" onclick={() => (edit = null)}>✕</button>
      </div>

      <label class="etiqueta" for="b-nom">Nom</label>
      <input id="b-nom" class="camp" bind:value={edit.nom} placeholder="p. ex. Rentar la terrassa" />

      <label class="etiqueta" for="b-cat">Subgrup</label>
      <select id="b-cat" class="camp" bind:value={edit.cat}>
        {#each cats as c (c.id)}
          <option value={c.id}>{c.icona} {c.nom}</option>
        {/each}
      </select>

      <span class="etiqueta">Repetició</span>
      <div class="xips">
        {#each [['setmanal', 'Cada setmana'], ['quinzenal', 'Cada 2 setmanes'], ['mensual', 'Un cop al mes']] as [v, n] (v)}
          <button class="xip-llarg" class:actiu={edit.freq === v} onclick={() => (edit.freq = v)} type="button">
            {n}
          </button>
        {/each}
      </div>

      {#if edit.freq === 'mensual'}
        <label class="etiqueta" for="b-dia-mes">Dia del mes (1-28)</label>
        <input id="b-dia-mes" class="camp" type="number" min="1" max="28" bind:value={edit.dia_mes} />
      {:else}
        <span class="etiqueta">Dies</span>
        <div class="dies">
          {#each DIES as d (d)}
            <button class="xip-dia" class:actiu={edit.dies.includes(d)} onclick={() => alternaEdit(d)} type="button">
              {DIES_NOM[d].slice(0, 3)}
            </button>
          {/each}
        </div>
      {/if}

      <label class="etiqueta" for="b-hora">Hora (aprox.)</label>
      <div class="fila" style="gap: 6px; align-items: center">
        <input id="b-hora" class="camp" type="time" bind:value={edit.hora} style="flex: 1" />
        <button class="boto ghost" onclick={() => (edit.hora = null)} disabled={!edit.hora}>Sense hora</button>
      </div>

      <span class="etiqueta">Esforç</span>
      <div class="xips">
        {#each PES_OPCIONS as p (p)}
          <button class="xip-llarg" class:actiu={edit.pes === p} onclick={() => (edit.pes = p)} type="button">
            {PESOS[p]}
          </button>
        {/each}
      </div>

      <div class="fila" style="gap: 8px; margin-top: 16px">
        {#if !edit.nova}
          <button class="boto secundari" onclick={esborrarEdit}>🗑</button>
        {/if}
        <button class="boto secundari" style="flex: 1" onclick={() => (edit = null)}>Cancel·lar</button>
        <button class="boto" style="flex: 1" onclick={desarEdit} disabled={!editValid}>Desar</button>
      </div>
    </div>
  </div>
{/if}

{#if catForm}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={() => (catForm = null)} role="presentation">
    <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <div class="fila espai" style="margin-bottom: 6px">
        <h2 class="titol">{catForm.nova ? 'Nou subgrup' : 'Editar subgrup'}</h2>
        <button class="boto ghost" onclick={() => (catForm = null)}>✕</button>
      </div>

      <label class="etiqueta" for="c-icona">Icona</label>
      <input id="c-icona" class="camp" bind:value={catForm.icona} maxlength="2" placeholder="📌" style="width: 80px" />

      <label class="etiqueta" for="c-nom">Nom</label>
      <input id="c-nom" class="camp" bind:value={catForm.nom} placeholder="p. ex. Estiu" />

      <div class="fila" style="gap: 8px; margin-top: 16px">
        <button class="boto secundari" style="flex: 1" onclick={() => (catForm = null)}>Cancel·lar</button>
        <button class="boto" style="flex: 1" onclick={desarCat} disabled={!catForm.nom.trim()}>Desar</button>
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
  .cat.nova-cat {
    border-style: dashed;
  }
  .cat-accions {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
  }
  .mini {
    flex: 1;
    padding: 6px 8px;
    border-radius: 8px;
    background: #f6f6f7;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-size: 11px;
    font-weight: 600;
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
  .item.dins .info strong {
    color: var(--suau);
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
  .xips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .xip-llarg {
    flex: 1;
    min-width: 72px;
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
</style>
