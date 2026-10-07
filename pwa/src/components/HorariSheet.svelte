<script>
  import { DIES, DIES_CURT, DIES_NOM } from '../lib/dates.js'
  import {
    LLOCS,
    DIES_LABORABLES,
    diaDe,
    esLaborable,
    validRang,
    setDia,
    esborraDia,
    copiaDies,
  } from '../lib/horari.js'
  import { saveConfig } from '../lib/load.js'

  let { adult, onclose } = $props()

  let dia = $state('dl')
  let pendent = false
  let timer = null

  const h = $derived(diaDe(adult, dia))
  const feinaIni = $derived(h?.feina?.[0] ?? '08:00')
  const feinaFi = $derived(h?.feina?.[1] ?? '17:00')
  const fora = $derived(h?.fora ?? [])
  const ambFora = $derived(fora.length === 2)

  function desa() {
    pendent = true
    clearTimeout(timer)
    timer = setTimeout(async () => {
      pendent = false
      await saveConfig()
    }, 400)
  }

  function muta(fn) {
    fn()
    adult.per_definir = false
    desa()
  }

  function ferLaborable() {
    muta(() => setDia(adult, dia, { feina: ['08:00', '17:00'], lloc: null, fora: [] }))
  }
  function ferLliure() {
    muta(() => esborraDia(adult, dia))
  }
  function setFeina(camp, valor) {
    muta(() => {
      const ini = camp === 'ini' ? valor : feinaIni
      const fi = camp === 'fi' ? valor : feinaFi
      const actual = diaDe(adult, dia)
      const foraIgual =
        actual?.fora?.length === 2 &&
        actual.fora[0] === actual.feina?.[0] &&
        actual.fora[1] === actual.feina?.[1]
      setDia(adult, dia, { feina: [ini, fi], ...(foraIgual ? { fora: [ini, fi] } : {}) })
    })
  }
  function setFora(camp, valor) {
    muta(() => {
      const ini = camp === 'ini' ? valor : (fora[0] ?? '07:00')
      const fi = camp === 'fi' ? valor : (fora[1] ?? feinaFi)
      setDia(adult, dia, { fora: [ini, fi] })
    })
  }
  function alternaFora() {
    muta(() => {
      if (ambFora) setDia(adult, dia, { fora: [] })
      else setDia(adult, dia, { fora: validRang(feinaIni, feinaFi) ? [feinaIni, feinaFi] : ['07:00', '17:30'] })
    })
  }
  function setLloc(id) {
    muta(() => {
      setDia(adult, dia, { lloc: id })
      if (id === 'teletreball') setDia(adult, dia, { fora: [] })
      else if (id === 'oficina' && !ambFora) {
        setDia(adult, dia, { fora: validRang(feinaIni, feinaFi) ? [feinaIni, feinaFi] : ['07:00', '17:30'] })
      }
    })
  }
  function copiarAFeiners() {
    muta(() => copiaDies(adult, dia, DIES_LABORABLES))
  }

  async function tanca() {
    clearTimeout(timer)
    if (pendent) {
      pendent = false
      await saveConfig()
    }
    onclose()
  }

  const feinaInvalida = $derived(Boolean(h) && !validRang(feinaIni, feinaFi))
  const foraInvalida = $derived(ambFora && !validRang(fora[0], fora[1]))
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={tanca} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">Horari · {adult.nom}</h2>
      <button class="boto" onclick={tanca}>Fet</button>
    </div>
    <p class="suau" style="margin: 0 0 10px">
      Especifica en què treballa i com de fora de casa està cada dia. Serveix per repartir les
      tasques.
    </p>

    <div class="xips">
      {#each DIES as d (d)}
        <button class="xip" class:sel={dia === d} onclick={() => (dia = d)} type="button">
          {DIES_CURT[d]}
          <span class="punt-dia" class:lluny={esLaborable(adult, d)}></span>
        </button>
      {/each}
    </div>

    <div class="dia-capsalera">
      <strong>{DIES_NOM[dia]}</strong>
      <span class="suau">{h ? 'Laborable' : 'Lliure'}</span>
    </div>

    {#if !esLaborable(adult, dia)}
      <p class="suau">Aquest dia no hi ha jornada laboral.</p>
      <button class="boto ghost" style="width: 100%" onclick={ferLaborable} type="button">
        ＄ Marcar com a laborable
      </button>
    {:else}
      <label class="etiqueta" for="h-ini">Jornada</label>
      <div class="fila" style="gap: 8px">
        <input
          id="h-ini"
          class="camp"
          type="time"
          value={feinaIni}
          onchange={(e) => setFeina('ini', e.target.value)}
        />
        <span class="suau">–</span>
        <input
          class="camp"
          type="time"
          value={feinaFi}
          onchange={(e) => setFeina('fi', e.target.value)}
        />
      </div>
      {#if feinaInvalida}
        <p class="error" style="margin: 6px 0 0">⚠️ L’hora de fi ha de ser posterior a la d’inici.</p>
      {/if}

      <span class="etiqueta">On treballa</span>
      <div class="xips">
        {#each LLOCS as l (l.id ?? 'null')}
          <button
            class="xip"
            class:sel={(h.lloc ?? null) === l.id}
            onclick={() => setLloc(l.id)}
            type="button"
          >
            {l.nom}
          </button>
        {/each}
      </div>

      <label class="fora-fila">
        <input type="checkbox" checked={ambFora} onchange={alternaFora} />
        <span>Fora de casa (no pot fer tasques)</span>
      </label>
      {#if ambFora}
        <div class="fila" style="gap: 8px">
          <input
            class="camp"
            type="time"
            value={fora[0]}
            onchange={(e) => setFora('ini', e.target.value)}
          />
          <span class="suau">–</span>
          <input
            class="camp"
            type="time"
            value={fora[1]}
            onchange={(e) => setFora('fi', e.target.value)}
          />
        </div>
        {#if foraInvalida}
          <p class="error" style="margin: 6px 0 0">⚠️ L’hora de fi ha de ser posterior a la d’inici.</p>
        {/if}
      {/if}

      <div class="fila" style="gap: 8px; margin-top: 14px">
        <button class="boto secundari" style="flex: 1" onclick={copiarAFeiners} type="button">
          Copiar a DL–DV
        </button>
        <button class="boto secundari" onclick={ferLliure} type="button">Lliure</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .xips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .xip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 11px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--linia);
    color: var(--suau);
    font-weight: 600;
    font-size: 12px;
  }
  .xip.sel {
    border-color: var(--primari);
    color: var(--text);
    background: var(--primari-suau);
  }
  .punt-dia {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primari);
  }
  .punt-dia.lluny {
    background: #cfcfcf;
  }
  .dia-capsalera {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--linia);
    margin-bottom: 10px;
  }
  .fora-fila {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    margin-top: 10px;
  }
  .fora-fila input {
    width: 18px;
    height: 18px;
  }
</style>
