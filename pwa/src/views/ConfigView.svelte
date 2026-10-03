<script>
  import { app } from '../lib/state.svelte.js'
  import { DIES, DIES_NOM } from '../lib/dates.js'
  import { adults, nens } from '../lib/config.js'
  import { resumAvisos } from '../lib/tasques.js'
  import { signOut } from '../lib/auth.svelte.js'
  import { hasSupabase } from '../lib/supabase.js'

  const avisos = $derived(resumAvisos(app.config))
</script>

<h1 class="titol" style="margin-bottom: 12px">Configuració</h1>

{#if avisos.length}
  <div class="targeta" style="margin-bottom: 12px; background: #fff7ed">
    <strong>⚠️ Avisos</strong>
    {#each avisos as a, i (i)}
      <div class="suau" style="margin-top: 4px">{a}</div>
    {/each}
  </div>
{/if}

{#each adults(app.config) as a (a.id)}
  <div class="targeta" style="margin-bottom: 10px">
    <div class="fila" style="gap: 8px; margin-bottom: 6px">
      <span class="punt" style="background: {a.color}"></span>
      <strong>{a.nom}</strong>
      {#if a.per_definir}<span class="xip">per definir</span>{/if}
    </div>
    {#each DIES as d (d)}
      {@const h = a.horari?.[d] ?? {}}
      <div class="fila espai suau" style="padding: 2px 0">
        <span>{DIES_NOM[d]}</span>
        <span>
          {#if h.fora?.length}
            fora {h.fora[0]}–{h.fora[1]}
          {:else if h.lloc}
            {h.lloc}
          {:else}
            lliure
          {/if}
        </span>
      </div>
    {/each}
  </div>
{/each}

<div class="targeta" style="margin-bottom: 10px">
  <strong>Extraescolars</strong>
  {#each app.config?.extraescolars ?? [] as x, i (i)}
    <div class="suau" style="margin-top: 4px">
      {DIES_NOM[x.dia]} · {x.nom} ({x.inici}–{x.fi})
    </div>
  {/each}
</div>

<div class="targeta">
  <div class="fila espai">
    <span class="suau">{hasSupabase ? 'Connectat al nuvol' : 'Mode local'}</span>
    <button class="boto secundari" onclick={signOut}>Sortir</button>
  </div>
</div>
