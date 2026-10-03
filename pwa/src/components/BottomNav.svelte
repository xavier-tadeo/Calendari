<script>
  import { app } from '../lib/state.svelte.js'

  const pestanyes = [
    { id: 'calendari', nom: 'Calendari', icona: '📅' },
    { id: 'setmana', nom: 'Setmana', icona: '🗓️' },
    { id: 'menu', nom: 'Menú', icona: '🍽️' },
    { id: 'punts', nom: 'Punts', icona: '⭐' },
    { id: 'config', nom: 'Config', icona: '⚙️' },
  ]
</script>

<nav class="barra">
  {#each pestanyes as p (p.id)}
    <button
      class="pestanya"
      class:activa={app.tab === p.id}
      onclick={() => (app.tab = p.id)}
      aria-label={p.nom}
    >
      <span class="icona">{p.icona}</span>
      <span class="nom">{p.nom}</span>
    </button>
  {/each}
</nav>

<style>
  .barra {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--linia);
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 40;
  }
  .pestanya {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 0 6px;
    color: var(--suau);
    font-size: 10px;
    font-weight: 600;
  }
  .pestanya.activa {
    color: var(--primari);
  }
  .icona {
    font-size: 20px;
    line-height: 1;
  }
  @media (min-width: 620px) {
    .barra {
      max-width: 560px;
      margin: 0 auto;
      border-radius: 16px 16px 0 0;
    }
  }
</style>
