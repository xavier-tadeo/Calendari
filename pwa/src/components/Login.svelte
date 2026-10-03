<script>
  import { signIn, auth } from '../lib/auth.svelte.js'
  import { hasSupabase } from '../lib/supabase.js'

  let email = ''
  let password = ''
  let enviant = false

  async function entrar(e) {
    e.preventDefault()
    enviant = true
    await signIn(email, password)
    enviant = false
  }
</script>

<div class="centrat">
  <div class="targeta" style="width: min(360px, 90vw)">
    <div style="text-align:center; font-size:40px; margin-bottom:6px">📅</div>
    <h1 class="titol" style="text-align:center">Calendari Familia</h1>
    <p class="suau" style="text-align:center; margin:6px 0 16px">
      Aquest tauler es privat. Introdueix la contrasenya per entrar.
    </p>
    <form onsubmit={entrar}>
      {#if hasSupabase}
        <label class="etiqueta" for="email">Correu</label>
        <input id="email" class="camp" type="email" bind:value={email} autocomplete="username" />
      {/if}
      <label class="etiqueta" for="pwd">Contrasenya</label>
      <input
        id="pwd"
        class="camp"
        type="password"
        bind:value={password}
        autocomplete="current-password"
      />
      {#if auth.error}
        <p class="error" style="margin-top:12px">{auth.error}</p>
      {/if}
      <button class="boto" style="width:100%; margin-top:16px" type="submit" disabled={enviant}>
        {enviant ? 'Entrant…' : 'Entrar'}
      </button>
    </form>
  </div>
</div>
