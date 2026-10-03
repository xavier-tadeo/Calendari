<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES_NOM } from '../lib/dates.js'
  import { setNota } from '../lib/setmanes.js'
  import { saveSetmanes } from '../lib/load.js'

  let { diaKey, valor = '', refDate, onclose } = $props()

  let text = $state(valor)

  async function desar() {
    setNota(app.setmanes, refDate, diaKey, text)
    await saveSetmanes()
    onclose()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose} role="presentation">
  <div class="full" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="fila espai" style="margin-bottom: 6px">
      <h2 class="titol">Nota · {DIES_NOM[diaKey]}</h2>
      <button class="boto ghost" onclick={onclose}>✕</button>
    </div>

    <label class="etiqueta" for="nota">Nota del dia</label>
    <textarea id="nota" class="camp" rows="4" bind:value={text} placeholder="p. ex. Avui la iaia ve a sopar"></textarea>

    <div class="fila" style="gap: 8px; margin-top: 16px">
      <button class="boto secundari" style="flex: 1" onclick={onclose}>Cancel·lar</button>
      <button class="boto" style="flex: 1" onclick={desar}>Desar</button>
    </div>
  </div>
</div>
