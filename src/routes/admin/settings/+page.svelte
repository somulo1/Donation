<script lang="ts">
  import { onMount } from 'svelte';
  import { Settings, Save, RefreshCw, Shield } from 'lucide-svelte';
  import { toasts, siteSettings } from '$lib/stores';

  let settings = {
    platform_name: 'DonateAnon',
    platform_description: 'Anonymous donation platform for social projects',
    contact_email: 'admin@donateanon.com',
    mpesa_business_code: '174379',
    mpesa_environment: 'sandbox',
    enable_notifications: true,
    auto_approve_projects: false,
    minimum_donation: 10,
    maximum_donation: 1000000,
    featured_projects_limit: 3
  };

  let saving = false;
  let loading = true;

  onMount(async () => {
    await loadSettings();
  });

  async function loadSettings() {
    try {
      loading = true;
      await siteSettings.load();

      // Subscribe to settings store to get current values
      const unsubscribe = siteSettings.subscribe(storeSettings => {
        if (storeSettings.loaded) {
          const { loaded, ...settingsData } = storeSettings;
          settings = { ...settingsData };
          loading = false;
        }
      });

      // Clean up subscription
      setTimeout(unsubscribe, 100);

    } catch (error) {
      console.error('Failed to load settings:', error);
      toasts.add({
        type: 'error',
        message: 'Failed to load settings'
      });
      loading = false;
    }
  }

  async function saveSettings() {
    try {
      saving = true;

      const result = await siteSettings.save(settings);

      if (result.success) {
        toasts.add({
          type: 'success',
          message: 'Settings saved successfully! Changes are now active across the site.'
        });
      } else {
        toasts.add({
          type: 'error',
          message: result.error || 'Failed to save settings'
        });
      }
    } catch (error) {
      toasts.add({
        type: 'error',
        message: 'Network error while saving settings'
      });
    } finally {
      saving = false;
    }
  }

  async function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      try {
        saving = true;

        const result = await siteSettings.reset();

        if (result.success) {
          await loadSettings(); // Reload settings from database
          toasts.add({
            type: 'success',
            message: 'Settings reset to defaults successfully!'
          });
        } else {
          toasts.add({
            type: 'error',
            message: result.error || 'Failed to reset settings'
          });
        }
      } catch (error) {
        toasts.add({
          type: 'error',
          message: 'Network error while resetting settings'
        });
      } finally {
        saving = false;
      }
    }
  }
</script>

<svelte:head>
  <title>Platform Settings - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="font-display text-3xl font-bold text-dark-900 dark:text-white">
        Platform Settings
      </h1>
      <p class="text-dark-600 dark:text-dark-400 mt-2">
        Configure platform settings and preferences - Changes take effect immediately
      </p>
    </div>
    <div class="flex space-x-3">
      <button
        on:click={resetToDefaults}
        class="btn-outline inline-flex items-center space-x-2"
      >
        <RefreshCw class="w-4 h-4" />
        <span>Reset to Defaults</span>
      </button>
      <button
        on:click={saveSettings}
        disabled={saving}
        class="btn-primary inline-flex items-center space-x-2"
      >
        {#if saving}
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {:else}
          <Save class="w-4 h-4" />
        {/if}
        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
      </button>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-3">
        <div class="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-dark-600 dark:text-dark-400">Loading settings...</span>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- General Settings -->
    <div class="card">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Settings class="w-5 h-5 text-primary-600" />
          </div>
          <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white">
            General Settings
          </h3>
        </div>

        <div class="space-y-4">
          <div>
            <label for="platform-name" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Platform Name
            </label>
            <input
              id="platform-name"
              type="text"
              bind:value={settings.platform_name}
              class="input-field"
              placeholder="Platform name"
            />
          </div>

          <div>
            <label for="platform-description" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Platform Description
            </label>
            <textarea
              id="platform-description"
              bind:value={settings.platform_description}
              class="input-field"
              rows="3"
              placeholder="Platform description"
            ></textarea>
          </div>

          <div>
            <label for="contact-email" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Contact Email
            </label>
            <input
              id="contact-email"
              type="email"
              bind:value={settings.contact_email}
              class="input-field"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label for="featured-projects-limit" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Featured Projects Limit
            </label>
            <input
              id="featured-projects-limit"
              type="number"
              bind:value={settings.featured_projects_limit}
              class="input-field"
              min="1"
              max="10"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Settings -->
    <div class="card">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
            <Shield class="w-5 h-5 text-secondary-600" />
          </div>
          <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white">
            Payment Settings
          </h3>
        </div>

        <div class="space-y-4">
          <div>
            <label for="mpesa-business-code" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Mpesa Business Code
            </label>
            <input
              id="mpesa-business-code"
              type="text"
              bind:value={settings.mpesa_business_code}
              class="input-field"
              placeholder="174379"
            />
          </div>

          <div>
            <label for="mpesa-environment" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Mpesa Environment
            </label>
            <select id="mpesa-environment" bind:value={settings.mpesa_environment} class="input-field">
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="production">Production (Live)</option>
            </select>
          </div>

          <div>
            <label for="minimum-donation" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Minimum Donation (KES)
            </label>
            <input
              id="minimum-donation"
              type="number"
              bind:value={settings.minimum_donation}
              class="input-field"
              min="1"
            />
          </div>

          <div>
            <label for="maximum-donation" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Maximum Donation (KES)
            </label>
            <input
              id="maximum-donation"
              type="number"
              bind:value={settings.maximum_donation}
              class="input-field"
              min="1"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  {/if}
</div>
