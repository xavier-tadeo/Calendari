<script>
  import { onMount } from 'svelte'
  import { auth, initAuth } from './lib/auth.svelte.js'
  import { app } from './lib/state.svelte.js'
  import { loadAll } from './lib/load.js'
  import Login from './components/Login.svelte'
  import BottomNav from './components/BottomNav.svelte'
  import CalendarView from './views/CalendarView.svelte'
  import WeekView from './views/WeekView.svelte'
  import MenuView from './views/MenuView.svelte'
  import PuntsView from './views/PuntsView.svelte'
  import ConfigView from './views/ConfigView.svelte'

  onMount(initAuth)

  let started = false
  $effect(() => {
    if (auth.user && !app.ready && !started) {
      started = true
      loadAll()
    }
  })

  const vistes = {
    calendari: CalendarView,
    setmana: WeekView,
    menu: MenuView,
    punts: PuntsView,
    config: ConfigView,
  }
</script>

{#if !auth.checked}
  <div class="centrat"><div class="spinner"></div></div>
{:else if !auth.user}
  <Login />
{:else if !app.ready}
  <div class="centrat">
    {#if app.error}
      <p class="error">{app.error}</p>
    {:else}
      <div class="spinner"></div>
      <p>Carregant…</p>
    {/if}
  </div>
{:else}
  {@const Vista = vistes[app.tab] ?? CalendarView}
  <main class="app">
    <Vista />
  </main>
  <BottomNav />
{/if}
