<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { theme, toasts } from '$lib/stores';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Toast from '$lib/components/Toast.svelte';

  // Check if current page is admin page
  $: isAdminPage = $page.url.pathname.startsWith('/admin');

  onMount(async () => {
    // Initialize theme
    theme.init();

    // Initialize database on the server side
    try {
      await fetch('/api/init', { method: 'POST' });
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  });
</script>

<div class="min-h-screen flex flex-col bg-white dark:bg-dark-900 transition-colors duration-300">
  <Header />

  <main class="flex-1 pt-16">
    <slot />
  </main>

  <!-- Only show footer on non-admin pages -->
  {#if !isAdminPage}
    <Footer />
  {/if}
</div>

<!-- Toast notifications -->
{#each $toasts as toast (toast.id)}
  <Toast {toast} />
{/each}

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
