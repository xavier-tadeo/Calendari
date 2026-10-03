<script>
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import { app } from '../lib/state.svelte.js'
  import { adults } from '../lib/config.js'
  import { afegeixPla, actualitzaPla } from '../lib/tasques.js'
  import { afegeixCustom, actualitzaCustom } from '../lib/setmanes.js'
  import { saveConfig, saveSetmanes } from '../lib/load.js'

  let { tasca = null, custom = false, dia = 'dl', refDate, onclose } = $props()

  const adultsList = adults(app.config)

  const ATAJOS_HORA = [
    { nom: 'Matí', hora: '08:00' },
    { nom: 'Migdia', hora: '13:00' },
    { nom: 'Tarda', hora: '17:00' },
    { nom: 'Nit', hora: '20:00' },
  ]

  let nom = $state(tasca?.nom ?? '')
  let dies = $state(tasca?.dies ? [...tasca.dies] : dia ? [dia] : [])
  let assignat = $state(
    custom
      ? (tasca?.assignat || 'familia')
      : tasca?.fix
        ? tasca.fix
        : tasca?.tipus === 'familia'
          ? 'familia'
          : 'rotatiu',
  )
  let permanent = $state(!custom)
  let hora = $state(tasca?.hora ?? '')
  let pes = $state(tasca?.pes ?? 2)
  let freq = $state(tasca?.freq ?? 'setmanal')
  let paritat = $state(tasca?.paritat ?? 0)
  let diaMes = $state(tasca?.dia_mes ?? 1)

  const PES_OPCIONS = [
    { valor: 1, nom: 'Lleugera' },
    { valor: 2, nom: 'Mitjana' },
    { valor: 3, nom: 'Feixuga' },
  ]

  const FREQ_OPCIONS = [
    { valor: 'setmanal', nom: 'Cada setmana' },
    { valor: 'quinzenal', nom: 'Cada 2 setmanes' },
    { valor: 'mensual', nom: 'Un cop al mes' },
  ]

  const esPla = $derived(tasca ? !custom : permanent)
  const esMensual = $derived(esPla && freq === 'mensual')
  const potDesar = $derived(
    Boolean(nom.trim()) && (esMensual ? diaMes >= 1 && diaMes <= 28 : dies.length > 0),
  )

  function alterna(d) {
    dies = dies.includes(d) ? dies.filter((x) => x !== d) : [...dies, d]
  }

  async function desar() {
    if (!nom.trim()) return
    if (!esMensual && dies.length === 0) return
    if (tasca) {
      if (custom) {
        actualitzaCustom(app.setmanes, refDate, tasca.id, {
          nom: nom.trim(),
          dies,
          assignat,
          hora: hora || null,
          pes,
        })
        await saveSetmanes()
      } else {
        const canvis = { nom: nom.trim(), dies, hora: hora || null, pes, freq }
        if (freq === 'quinzenal') canvis.paritat = paritat
        else delete canvis.paritat
        if (freq === 'mensual') canvis.dia_mes = diaMes
        else delete canvis.dia_mes
        if (assignat === 'familia') {
          canvis.tipus = 'familia'
          canvis.fix = null
        } else if (assignat === 'rotatiu') {
          canvis.tipus = tasca.tipus === 'escola' ? 'escola' : 'rotatiu'
          canvis.fix = null
        } else {
          canvis.tipus = 'rotatiu'
          canvis.fix = assignat
        }
        actualitzaPla(app.config, tasca.id, canvis)
        await saveConfig()
      }
    } else if (permanent) {
      const nova = {
        id: 't' + Math.random().toString(16).slice(2, 9),
        nom: nom.trim(),
        dies,
        tipus: 'rotatiu',
        fix: null,
        hora: hora || null,
        pes,
        freq,
      }
      if (freq === 'quinzenal') nova.paritat = paritat
      if (freq === 'mensual') nova.dia_mes = diaMes
      if (assignat === 'familia') nova.tipus = 'familia'
      else if (assignat !== 'rotatiu') nova.fix = assignat
      afegeixPla(app.config, nova)
      await saveConfig()
    } else {
      afegeixCustom(app.setmanes, refDate, {
        id: 'c' + Math.random().toString(16).slice(2, 9),
        nom: nom.trim(),
        dies,
        assignat,
        hora: hora || null,
        pes,
      })
      await saveSetmanes()
    }
    onclose()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">{tasca ? 'Editar tasca' : 'Nova tasca'}</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>

    <label class="etiqueta" for="tasca-nom">Nom</label>
    <input id="tasca-nom" class="camp" bind:value={nom} placeholder="p. ex. Rentar el cotxe" />

    {#if esPla}
      <span class="etiqueta">Repetició</span>
      <div class="xips">
        {#each FREQ_OPCIONS as f (f.valor)}
          <button
            class="xip-llarg"
            class:actiu={freq === f.valor}
            onclick={() => (freq = f.valor)}
            type="button"
          >
            {f.nom}
          </button>
        {/each}
      </div>
      {#if freq === 'quinzenal'}
        <div class="xips" style="margin-top: 6px">
          <button class="xip-llarg" class:actiu={paritat === 0} onclick={() => (paritat = 0)} type="button">
            Setmanes parells
          </button>
          <button class="xip-llarg" class:actiu={paritat === 1} onclick={() => (paritat = 1)} type="button">
            Setmanes senars
          </button>
        </div>
      {/if}
    {/if}

    {#if esMensual}
      <label class="etiqueta" for="tasca-dia-mes">Dia del mes (1-28)</label>
      <input
        id="tasca-dia-mes"
        class="camp"
        type="number"
        min="1"
        max="28"
        bind:value={diaMes}
      />
    {:else}
      <span class="etiqueta">Dies</span>
      <div class="dies">
        {#each DIES as d (d)}
          <button class="xip-dia" class:actiu={dies.includes(d)} onclick={() => alterna(d)} type="button">
            {DIES_NOM[d].slice(0, 3)}
          </button>
        {/each}
      </div>
    {/if}

    <label class="etiqueta" for="tasca-obs">Qui la fa</label>
    <select id="tasca-obs" class="camp" bind:value={assignat}>
      {#if !custom}
        <option value="rotatiu">Rotatiu (la menys carregada)</option>
      {/if}
      <option value="familia">Els dos / Familia</option>
      {#each adultsList as a (a.id)}
        <option value={a.id}>{a.nom}</option>
      {/each}
    </select>

    <label class="etiqueta" for="tasca-hora">Hora (aprox.)</label>
    <div class="fila" style="gap: 6px; align-items: center">
      <input id="tasca-hora" class="camp" type="time" bind:value={hora} style="flex: 1" />
      <button class="boto ghost" onclick={() => (hora = '')} disabled={!hora}>Sense hora</button>
    </div>
    <div class="hores">
      {#each ATAJOS_HORA as a (a.nom)}
        <button
          class="xip-hora"
          class:actiu={hora === a.hora}
          onclick={() => (hora = a.hora)}
          type="button"
        >
          {a.nom}
        </button>
      {/each}
    </div>

    <span class="etiqueta">Esforç</span>
    <div class="xips">
      {#each PES_OPCIONS as p (p.valor)}
        <button
          class="xip-llarg"
          class:actiu={pes === p.valor}
          onclick={() => (pes = p.valor)}
          type="button"
        >
          {p.nom}
        </button>
      {/each}
    </div>

    {#if !tasca && !custom}
      <label class="fila" style="gap: 8px; margin-top: 14px; align-items: center">
        <input type="checkbox" bind:checked={permanent} />
        <span>Afegir al pla de cada setmana (si no, només aquesta)</span>
      </label>
    {/if}

    {#if tasca && !custom}
      <p class="suau" style="margin-top: 10px">
        Aquesta és una tasca del pla: els canvis afecten totes les setmanes.
      </p>
    {/if}

    <div class="fila" style="gap: 8px; margin-top: 16px">
      <button class="boto secundari" style="flex: 1" onclick={onclose}>Cancel·lar</button>
      <button class="boto" style="flex: 1" onclick={desar} disabled={!potDesar}>Desar</button>
    </div>
  </div>
</div>

<style>
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
  .hores {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 6px;
  }
  .xip-hora {
    flex: 1;
    min-width: 56px;
    padding: 7px 0;
    border-radius: 10px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-weight: 600;
    font-size: 12px;
  }
  .xip-hora.actiu {
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
