<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { adminAuth } from '$lib/stores';
  import { Eye, EyeOff, Lock, User, Shield } from 'lucide-svelte';

  let username = '';
  let password = '';
  let showPassword = false;
  let loginError = '';
  let isLoading = false;

  onMount(() => {
    // Check if already authenticated
    if ($adminAuth.isAuthenticated) {
      goto('/admin');
    }
  });

  async function handleLogin() {
    if (!username || !password) {
      loginError = 'Please enter both username and password';
      return;
    }

    isLoading = true;
    loginError = '';

    const result = await adminAuth.login(username, password);

    if (result.success) {
      goto('/admin');
    } else {
      loginError = result.error || 'Login failed';
    }

    isLoading = false;
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Admin Login - DonateAnon</title>
  <meta name="description" content="Admin login for DonateAnon platform management" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center section-padding">
  <div class="w-full max-w-md">
    <!-- Logo and Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-4">
        <Shield class="w-8 h-8 text-white" />
      </div>
      <h1 class="font-display text-3xl font-bold text-dark-900 dark:text-white mb-2">
        Admin Login
      </h1>
      <p class="text-dark-600 dark:text-dark-400">
        Access the DonateAnon administration panel
      </p>
    </div>

    <!-- Login Form -->
    <div class="card">
      <div class="p-8">
        <form on:submit|preventDefault={handleLogin} class="space-y-6">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Username
            </label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                id="username"
                type="text"
                bind:value={username}
                on:keypress={handleKeyPress}
                class="input-field pl-10"
                placeholder="Enter your username"
                required
                autocomplete="username"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Password
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              {#if showPassword}
                <input
                  id="password"
                  type="text"
                  bind:value={password}
                  on:keypress={handleKeyPress}
                  class="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                />
              {:else}
                <input
                  id="password"
                  type="password"
                  bind:value={password}
                  on:keypress={handleKeyPress}
                  class="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                />
              {/if}
              <button
                type="button"
                on:click={togglePasswordVisibility}
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors duration-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}
                  <EyeOff class="w-5 h-5" />
                {:else}
                  <Eye class="w-5 h-5" />
                {/if}
              </button>
            </div>
          </div>

          <!-- Error Message -->
          {#if loginError}
            <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-800 dark:text-red-400">
                {loginError}
              </p>
            </div>
          {/if}

          <!-- Login Button -->
          <button
            type="submit"
            disabled={isLoading}
            class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isLoading}
              <div class="flex items-center justify-center space-x-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            {:else}
              Sign In
            {/if}
          </button>
        </form>

        <!-- Demo Credentials -->
        <!-- <div class="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <h3 class="text-sm font-medium text-primary-800 dark:text-primary-200 mb-2">
            Demo Credentials
          </h3>
          <div class="text-sm text-primary-700 dark:text-primary-300 space-y-1">
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
          <p class="text-xs text-primary-600 dark:text-primary-400 mt-2">
            These are demo credentials for testing purposes.
          </p>
        </div> -->

        <!-- Back to Site -->
        <div class="mt-6 text-center">
          <a 
            href="/" 
            class="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            ← Back to main site
          </a>
        </div>
      </div>
    </div>

    <!-- Security Notice -->
    <div class="mt-6 text-center">
      <p class="text-xs text-dark-500 dark:text-dark-400">
        This is a secure admin area. All login attempts are logged.
      </p>
    </div>
  </div>
</div>
