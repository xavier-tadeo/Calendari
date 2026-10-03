<script>
  import { app } from '../lib/state.svelte.js'
  import { PALETA, RECURRENCIES, nomColor, nouId } from '../lib/esdeveniments.js'
  import { adults, nens } from '../lib/config.js'
  import { todayISO } from '../lib/dates.js'

  let { ev = null, onclose, onsave } = $props()

  const membres = [...adults(app.config), ...nens(app.config)]

  let titol = $state(ev?.titol ?? '')
  let data = $state(ev?.data ?? todayISO())
  let totElDia = $state(ev ? ev.tot_el_dia !== false : true)
  let horaInici = $state(ev?.hora_inici ?? '17:00')
  let horaFi = $state(ev?.hora_fi ?? '')
  let persona = $state(ev?.persona ?? '')
  let color = $state(ev?.color ?? '')
  let lloc = $state(ev?.lloc ?? '')
  let nota = $state(ev?.nota ?? '')
  let recurrencia = $state(ev?.recurrencia ?? 'cap')
  let fins = $state(ev?.fins ?? '')

  function desar() {
    if (!titol.trim()) return
    onsave({
      id: ev?.id ?? nouId(),
      titol: titol.trim(),
      data,
      tot_el_dia: totElDia,
      hora_inici: totElDia ? null : horaInici,
      hora_fi: totElDia ? null : horaFi || null,
      persona: persona || null,
      color: color || null,
      lloc: lloc.trim() || null,
      nota: nota.trim() || null,
      recurrencia: recurrencia || 'cap',
      fins: recurrencia !== 'cap' && fins ? fins : null,
    })
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom:6px">
      <h2 class="titol">{ev?.id ? 'Editar esdeveniment' : 'Nou esdeveniment'}</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>

    <label class="etiqueta" for="titol">Títol</label>
    <input id="titol" class="camp" bind:value={titol} placeholder="p. ex. Dentista" />

    <label class="etiqueta" for="data">Data</label>
    <input id="data" class="camp" type="date" bind:value={data} />

    <label class="fila" style="margin-top:14px; gap:8px">
      <input type="checkbox" bind:checked={totElDia} />
      <span>Tot el dia</span>
    </label>

    {#if !totElDia}
      <div class="fila" style="margin-top:10px; gap:10px">
        <div style="flex:1">
          <label class="etiqueta" for="hi">Hora inici</label>
          <input id="hi" class="camp" type="time" bind:value={horaInici} />
        </div>
        <div style="flex:1">
          <label class="etiqueta" for="hf">Hora fi (opcional)</label>
          <input id="hf" class="camp" type="time" bind:value={horaFi} />
        </div>
      </div>
    {/if}

    <label class="etiqueta" for="persona">Persona</label>
    <select id="persona" class="camp" bind:value={persona}>
      <option value="">— Sense assignar —</option>
      {#each membres as m (m.id)}
        <option value={m.id}>{m.nom}</option>
      {/each}
    </select>

    <div class="etiqueta">Color</div>
    <div class="colors">
      <button
        class="mostra net"
        class:sel={!color}
        onclick={() => (color = '')}
        title="Sense color"
        aria-label="Sense color"
      >—</button>
      {#each PALETA as c (c)}
        <button
          class="mostra"
          class:sel={color === c}
          style="background:{c}"
          onclick={() => (color = c)}
          title={nomColor(c)}
          aria-label={nomColor(c)}
        ></button>
      {/each}
    </div>

    <label class="etiqueta" for="lloc">Lloc</label>
    <input id="lloc" class="camp" bind:value={lloc} placeholder="opcional" />

    <label class="etiqueta" for="nota">Nota</label>
    <textarea id="nota" class="camp" rows="2" bind:value={nota} placeholder="opcional"></textarea>

    <label class="etiqueta" for="rec">Repetició</label>
    <select id="rec" class="camp" bind:value={recurrencia}>
      {#each RECURRENCIES as r (r.id)}
        <option value={r.id}>{r.nom}</option>
      {/each}
    </select>

    {#if recurrencia !== 'cap'}
      <label class="etiqueta" for="fins">Fins a (opcional)</label>
      <input id="fins" class="camp" type="date" bind:value={fins} />
    {/if}

    <div class="fila" style="margin-top:20px; gap:10px">
      <button class="boto secundari" style="flex:1" onclick={onclose}>Cancel·la</button>
      <button class="boto" style="flex:2" onclick={desar}>Desar</button>
    </div>
  </div>
</div>

<style>
  .colors {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
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
  .mostra.net {
    background: #fff;
  }
</style>
