<script lang="ts">
  import { theme, siteSettings, adminAuth } from '$lib/stores';
  import { Sun, Moon, Menu, X } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let mobileMenuOpen = false;
  let mounted = false;

  onMount(async () => {
    mounted = true;
    // Load site settings to get dynamic platform name
    await siteSettings.load();
    // Check authentication status
    adminAuth.checkAuth();
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-b border-dark-200 dark:border-dark-700">
  <nav class="section-padding">
    <div class="container-max">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="/" class="flex items-center space-x-2 group" on:click={closeMobileMenu}>
          <div class="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-lg">
            <!-- Custom Donation Icon: Hands with Heart -->
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <!-- Giving hands -->
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
              <!-- Heart in center -->
              <path d="M12 8.5C10.5 8.5 9.3 9.7 9.3 11.2C9.3 13.2 12 16 12 16S14.7 13.2 14.7 11.2C14.7 9.7 13.5 8.5 12 8.5Z"/>
              <!-- Left hand -->
              <path d="M6 10C4.9 10 4 10.9 4 12V16C4 17.1 4.9 18 6 18H8V10H6Z"/>
              <!-- Right hand -->
              <path d="M18 10C19.1 10 20 10.9 20 12V16C20 17.1 19.1 18 18 18H16V10H18Z"/>
              <!-- Connection lines -->
              <path d="M8 12H10M14 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="font-display font-bold text-xl gradient-text">
            {$siteSettings.platform_name || 'DonateAnon'}
          </span>
        </a>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <a 
            href="/" 
            class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
            class:text-primary-600={$page.url.pathname === '/'}
            class:dark:text-primary-400={$page.url.pathname === '/'}
          >
            Home
          </a>
          <a 
            href="/projects" 
            class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
            class:text-primary-600={$page.url.pathname === '/projects'}
            class:dark:text-primary-400={$page.url.pathname === '/projects'}
          >
            Projects
          </a>
          <a
            href="/about"
            class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
            class:text-primary-600={$page.url.pathname === '/about'}
            class:dark:text-primary-400={$page.url.pathname === '/about'}
          >
            About
          </a>
          {#if !$adminAuth.isAuthenticated}
            <a
              href="/admin/login"
              class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
              class:text-primary-600={$page.url.pathname.startsWith('/admin')}
              class:dark:text-primary-400={$page.url.pathname.startsWith('/admin')}
            >
              Admin Login
            </a>
          {/if}
        </div>

        <!-- Theme Toggle & Mobile Menu -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          {#if mounted}
            <button
              on:click={theme.toggle}
              class="p-2 rounded-lg bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {#if $theme === 'dark'}
                <Sun class="w-5 h-5 text-primary-600" />
              {:else}
                <Moon class="w-5 h-5 text-primary-600" />
              {/if}
            </button>
          {/if}

          <!-- Mobile Menu Button -->
          <button
            on:click={toggleMobileMenu}
            class="md:hidden p-2 rounded-lg bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {#if mobileMenuOpen}
              <X class="w-5 h-5 text-dark-700 dark:text-dark-300" />
            {:else}
              <Menu class="w-5 h-5 text-dark-700 dark:text-dark-300" />
            {/if}
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      {#if mobileMenuOpen}
        <div class="md:hidden py-4 border-t border-dark-200 dark:border-dark-700 animate-slide-up">
          <div class="flex flex-col space-y-4">
            <a 
              href="/" 
              class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 py-2"
              class:text-primary-600={$page.url.pathname === '/'}
              class:dark:text-primary-400={$page.url.pathname === '/'}
              on:click={closeMobileMenu}
            >
              Home
            </a>
            <a 
              href="/projects" 
              class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 py-2"
              class:text-primary-600={$page.url.pathname === '/projects'}
              class:dark:text-primary-400={$page.url.pathname === '/projects'}
              on:click={closeMobileMenu}
            >
              Projects
            </a>
            <a
              href="/about"
              class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 py-2"
              class:text-primary-600={$page.url.pathname === '/about'}
              class:dark:text-primary-400={$page.url.pathname === '/about'}
              on:click={closeMobileMenu}
            >
              About
            </a>
            {#if !$adminAuth.isAuthenticated}
              <a
                href="/admin/login"
                class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 py-2"
                on:click={closeMobileMenu}
              >
                Admin Login
              </a>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </nav>
</header>
