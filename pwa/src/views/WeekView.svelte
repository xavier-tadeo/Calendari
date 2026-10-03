<script>
  import { app } from '../lib/state.svelte.js'
  import {
    DIES,
    DIES_NOM,
    iso,
    parseISO,
    todayISO,
    addDies,
    diesSetmana,
    setmanaKey,
  } from '../lib/dates.js'
  import { colorsMembres, adults } from '../lib/config.js'
  import { tasquesSetmana, plaTasques, grupsDelDia } from '../lib/tasques.js'
  import { toggleFet } from '../lib/setmanes.js'
  import { saveSetmanes } from '../lib/load.js'
  import TaskSheet from '../components/TaskSheet.svelte'
  import TaskForm from '../components/TaskForm.svelte'
  import NotaSheet from '../components/NotaSheet.svelte'

  let ref = $state(todayISO())
  const refDate = $derived(parseISO(ref))
  const dies = $derived(diesSetmana(refDate))
  const week = $derived(setmanaKey(refDate))
  const instancies = $derived(tasquesSetmana(app.config, app.setmanes, refDate))
  const colors = $derived(colorsMembres(app.config))
  const noms = $derived(Object.fromEntries(adults(app.config).map((m) => [m.id, m.nom])))
  const notes = $derived(app.setmanes[week]?.notes ?? {})

  let sheetInst = $state(null)
  let form = $state(null)
  let nota = $state(null)

  function mou(n) {
    ref = iso(addDies(refDate, n * 7))
  }

  function delDia(k) {
    return instancies.filter((t) => t.dia === k)
  }

  async function toggle(t) {
    toggleFet(app.setmanes, refDate, t.key, !t.fet)
    await saveSetmanes()
  }

  function obrirNova(k) {
    form = { tasca: null, custom: false, dia: k }
  }

  function obrirEditar(inst) {
    if (inst.custom) {
      const c = (app.setmanes[week]?.custom ?? []).find((x) => x.id === inst.task_id)
      form = {
        tasca: c ?? { id: inst.task_id, nom: inst.nom, dies: [inst.dia], assignat: inst.assignat },
        custom: true,
        dia: inst.dia,
      }
    } else {
      const t = plaTasques(app.config).find((x) => x.id === inst.task_id)
      form = {
        tasca: t ?? { id: inst.task_id, nom: inst.nom, dies: [inst.dia], tipus: 'rotatiu' },
        custom: false,
        dia: inst.dia,
      }
    }
  }

  function obrirNota(k) {
    nota = { diaKey: k, valor: notes[k] ?? '' }
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

    {#if notes[d]}
      <button class="nota-dia" onclick={() => obrirNota(d)}>📝 {notes[d]}</button>
    {/if}

    {#if files.length === 0}
      <span class="suau">Sense tasques</span>
    {:else}
      {#each grupsDelDia(files) as g (g.id)}
        <div class="bloc" style="background: {g.color}">
          <span class="bloc-nom">{g.nom}</span>
          {#each g.tasques as t (t.key)}
            <div class="tasca" class:fet={t.fet}>
              <button
                class="casella"
                aria-label={t.fet ? 'Marcar com a pendent' : 'Marcar com a feta'}
                onclick={() => toggle(t)}
              >
                {t.fet ? '✓' : ''}
              </button>
              <button class="obre" onclick={() => (sheetInst = t)}>
                <span class="punt" style="background: {colors[t.assignat] || '#888'}"></span>
                {#if t.hora}<span class="hora">{t.hora}</span>{/if}
                <span class="nom-t">{t.nom}</span>
                <span class="suau">{noms[t.assignat] ?? t.assignat}</span>
              </button>
            </div>
          {/each}
        </div>
      {/each}
    {/if}

    <div class="accions-dia">
      <button class="boto ghost" onclick={() => obrirNova(d)}>＋ Tasca</button>
      <button class="boto ghost" onclick={() => obrirNota(d)}>{notes[d] ? '✏️ Nota' : '＋ Nota'}</button>
    </div>
  </div>
{/each}

{#if sheetInst}
  <TaskSheet
    inst={sheetInst}
    {refDate}
    onclose={() => (sheetInst = null)}
    oneditar={obrirEditar}
  />
{/if}

{#if form}
  <TaskForm
    tasca={form.tasca}
    custom={form.custom}
    dia={form.dia}
    {refDate}
    onclose={() => (form = null)}
  />
{/if}

{#if nota}
  <NotaSheet diaKey={nota.diaKey} valor={nota.valor} {refDate} onclose={() => (nota = null)} />
{/if}

<style>
  .bloc {
    border-radius: 12px;
    padding: 6px 8px;
    margin-bottom: 6px;
  }
  .bloc-nom {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #7a7a7a;
    margin-bottom: 3px;
  }
  .hora {
    flex: none;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    min-width: 33px;
  }
  .tasca {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
  }
  .casella {
    width: 22px;
    height: 22px;
    flex: none;
    border: 2px solid var(--linia);
    border-radius: 7px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #fff;
  }
  .tasca.fet .casella {
    background: var(--primari);
    border-color: var(--primari);
  }
  .obre {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
    padding: 4px 0;
  }
  .nom-t {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tasca.fet .nom-t {
    text-decoration: line-through;
    color: var(--suau);
  }
  .nota-dia {
    display: block;
    width: 100%;
    text-align: left;
    background: #fff7e6;
    border: 1px solid #ffe0a8;
    border-radius: 10px;
    padding: 8px 10px;
    margin-bottom: 6px;
    font-size: 13px;
  }
  .accions-dia {
    display: flex;
    gap: 4px;
    margin-top: 8px;
  }
  .accions-dia .boto {
    padding: 7px 12px;
  }
</style>
