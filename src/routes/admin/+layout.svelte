<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { adminAuth } from '$lib/stores';
  import Footer from '$lib/components/Footer.svelte';
  import {
    LayoutDashboard,
    FolderOpen,
    DollarSign,
    Settings,
    LogOut,
    Menu,
    X,
    Smartphone
  } from 'lucide-svelte';

  let sidebarOpen = false;
  let isLoading = true;

  onMount(() => {
    // Check authentication status
    const isAuthenticated = adminAuth.checkAuth();

    if (!isAuthenticated && $page.url.pathname !== '/admin/login') {
      goto('/admin/login');
    }

    isLoading = false;
  });

  // Reactive statement to handle auth changes
  $: if (!$adminAuth.isAuthenticated && !isLoading && $page.url.pathname !== '/admin/login') {
    goto('/admin/login');
  }

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  function handleLogout() {
    adminAuth.logout();
    goto('/admin/login');
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: FolderOpen },
    { name: 'Donations', href: '/admin/donations', icon: DollarSign },
    { name: 'Payments', href: '/admin/payments', icon: DollarSign },
    { name: 'M-Pesa Test', href: '/admin/mpesa-test', icon: Smartphone },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  $: currentPath = $page.url.pathname;
</script>

{#if isLoading}
  <!-- Loading State -->
  <div class="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center">
    <div class="text-center">
      <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-dark-600 dark:text-dark-400">Loading admin panel...</p>
    </div>
  </div>
{:else if !$adminAuth.isAuthenticated && $page.url.pathname !== '/admin/login'}
  <!-- Not authenticated, will redirect -->
  <div class="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center">
    <div class="text-center">
      <p class="text-dark-600 dark:text-dark-400">Redirecting to login...</p>
    </div>
  </div>
{:else if $page.url.pathname === '/admin/login'}
  <!-- Login page -->
  <slot />
{:else}
  <!-- Authenticated admin layout -->
  <div class="min-h-screen bg-dark-50 dark:bg-dark-900">
    <!-- Admin Top Bar (full width, fixed at top, below main header) -->
    <div class="fixed top-16 left-0 right-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-b border-dark-200 dark:border-dark-700">
      <div class="flex items-center justify-between h-12 px-4">
        <button
          on:click={toggleSidebar}
          class="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors duration-200"
        >
          <Menu class="w-5 h-5 text-dark-500 dark:text-dark-400" />
        </button>

        <div class="flex items-center space-x-4 ml-auto">
          <span class="text-sm text-dark-600 dark:text-dark-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>

    <!-- Mobile sidebar backdrop -->
    {#if sidebarOpen}
      <div
        class="fixed inset-0 z-40 lg:hidden"
        on:click={closeSidebar}
        on:keydown={(e) => e.key === 'Escape' && closeSidebar()}
        role="button"
        tabindex="0"
      >
        <div class="absolute inset-0 bg-dark-600 opacity-75"></div>
      </div>
    {/if}

    <!-- Sidebar -->
    <div
      class="fixed top-28 bottom-0 left-0 z-40 w-64 bg-white dark:bg-dark-800 border-r border-dark-200 dark:border-dark-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0"
      class:translate-x-0={sidebarOpen}
      class:-translate-x-full={!sidebarOpen}
    >
    <!-- Sidebar header -->
    <div class="flex items-center justify-between h-16 px-6 border-b border-dark-200 dark:border-dark-700">
      <div class="flex items-center space-x-2">
        <span class="font-display font-bold text-lg gradient-text">Admin Panel</span>
      </div>
      <button
        on:click={closeSidebar}
        class="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors duration-200"
      >
        <X class="w-5 h-5 text-dark-500 dark:text-dark-400" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="mt-6 px-3">
      <ul class="space-y-1">
        {#each navigation as item}
          <li>
            <a
              href={item.href}
              class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              class:bg-primary-100={currentPath === item.href}
              class:text-primary-600={currentPath === item.href}
              on:click={closeSidebar}
            >
              <svelte:component this={item.icon} class="w-5 h-5" />
              <span class="font-medium">{item.name}</span>
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- User info -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-200 dark:border-dark-700">
      <div class="flex items-center space-x-3 mb-3">
        <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-medium">A</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-dark-900 dark:text-white truncate">
            {$adminAuth.user?.username || 'Admin'}
          </p>
          <p class="text-xs text-dark-500 dark:text-dark-400 truncate">
            {$adminAuth.user?.email || 'admin@donateanon.com'}
          </p>
        </div>
      </div>
      <button
        on:click={handleLogout}
        class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-dark-600 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
      >
        <LogOut class="w-4 h-4" />
        <span>Sign out</span>
      </button>
    </div>
  </div>

    <!-- Main content -->
    <div class="pl-0 lg:pl-64 pt-28 min-h-screen transition-all duration-300">
      <!-- Page content -->
      <main class="p-4 lg:p-6 w-full">
        <div class="max-w-full">
          <slot />
        </div>
      </main>

      <!-- Admin Footer with sidebar spacing -->
      <div class="w-full">
        <Footer />
      </div>
    </div>
  </div>
{/if}
