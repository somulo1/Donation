<script lang="ts">
  import { theme, siteSettings } from '$lib/stores';
  import { Sun, Moon, Heart, Menu, X } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let mobileMenuOpen = false;
  let mounted = false;

  onMount(async () => {
    mounted = true;
    // Load site settings to get dynamic platform name
    await siteSettings.load();
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
          <div class="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
            <Heart class="w-6 h-6 text-white" />
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
            <a
              href="/admin/login"
              class="text-dark-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 py-2"
              on:click={closeMobileMenu}
            >
            Login
            </a>
          </div>
        </div>
      {/if}
    </div>
  </nav>
</header>
