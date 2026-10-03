<script>
  import { DIES_NOM, pyWeekday, MESOS_NOM } from '../lib/dates.js'

  let { dia, diaKey, esd, tasques, extra, colors, noms, fest, onclose, oneditar, onesborrar, onafegir } =
    $props()

  const titolDia = $derived(
    `${DIES_NOM[diaKey]}, ${dia.getDate()} de ${MESOS_NOM[dia.getMonth()].toLowerCase()}`,
  )

  function hora(ev) {
    if (ev.tot_el_dia !== false) return 'Tot el dia'
    return ev.hora_fi ? `${ev.hora_inici}–${ev.hora_fi}` : ev.hora_inici
  }

  function colorEv(ev) {
    return ev.color || colors[ev.persona] || '#7f7f7f'
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
    <div class="fila espai" style="margin-bottom:10px">
      <h2 class="titol" style="text-transform: capitalize">{titolDia}</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>

    {#if fest}
      <div class="targeta" style="background: #fdeaea; margin-bottom: 12px">
        <span class="xip" style="background: #f7c9c9; color: #a01f1f">🎉 {fest.nom}</span>
      </div>
    {/if}

    <div class="fila espai" style="margin: 6px 0">
      <h3>Esdeveniments</h3>
      <button class="boto secundari" onclick={onafegir}>＋ Afegir</button>
    </div>

    {#if esd.length === 0}
      <p class="suau">Cap esdeveniment aquest dia.</p>
    {:else}
      {#each esd as ev (ev.id)}
        <div class="targeta fila" style="margin-bottom: 8px; gap: 10px; align-items: flex-start">
          <span class="punt" style="background: {colorEv(ev)}; margin-top: 6px"></span>
          <div style="flex: 1; min-width: 0">
            <strong>{ev.titol}</strong>
            <div class="suau">{hora(ev)}</div>
            {#if ev.persona}
              <div class="suau">👤 {noms[ev.persona] ?? ev.persona}</div>
            {/if}
            {#if ev.lloc}
              <div class="suau">📍 {ev.lloc}</div>
            {/if}
            {#if ev.nota}
              <div class="suau">📝 {ev.nota}</div>
            {/if}
            {#if ev.recurrencia && ev.recurrencia !== 'cap'}
              <div class="suau">🔁 {ev.recurrencia}{ev.fins ? ` fins ${ev.fins}` : ''}</div>
            {/if}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px">
            <button class="boto ghost" onclick={() => oneditar(ev)} aria-label="Editar">✏️</button>
            <button class="boto ghost" onclick={() => onesborrar(ev.id)} aria-label="Esborrar">🗑️</button>
          </div>
        </div>
      {/each}
    {/if}

    <h3 style="margin: 16px 0 6px">Tasques de casa</h3>
    {#if tasques.length === 0}
      <p class="suau">Cap tasca.</p>
    {:else}
      {#each tasques as t (t.task_id)}
        <div class="targeta fila" style="margin-bottom: 6px; gap: 10px">
          <span class="punt" style="background: {colors[t.assignat] || '#888'}"></span>
          <span style="flex: 1">{t.nom}</span>
          <span class="suau">{noms[t.assignat] ?? t.assignat}</span>
        </div>
      {/each}
    {/if}

    {#if extra.length}
      <h3 style="margin: 16px 0 6px">Extraescolars</h3>
      {#each extra as x, i (i)}
        <div class="targeta fila" style="margin-bottom: 6px; gap: 10px">
          <span class="punt" style="background: {colors[x.nina] || '#888'}"></span>
          <span style="flex: 1">{x.nom}</span>
          <span class="suau">{x.inici}–{x.fi}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>
