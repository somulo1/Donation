<script lang="ts">
  import { onMount } from 'svelte';
  import { Settings, Save, RefreshCw, Shield, TestTube } from 'lucide-svelte';
  import { toasts, siteSettings } from '$lib/stores';

  let settings = {
    platform_name: 'DonateAnon',
    platform_description: 'Anonymous donation platform for social projects',
    contact_email: 'admin@donateanon.com',
    mpesa_business_code: '174379',
    mpesa_environment: 'sandbox',
    mpesa_consumer_key: 'uNzRpYZ8BOAQApcpuUax9WUi3cA9GqMviC0P0vUug8bGR4yT',
    mpesa_consumer_secret: 'lddErn3XqkaJHWMm2zSz9o2UFADahr3Rl4L1dnbTRNGi3R7n3eJ2tNMRufbaCHTB',
    mpesa_passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    deposit_phone_number: '254712345678',
    enable_notifications: true,
    auto_approve_projects: false,
    featured_projects_limit: 3
  };

  let saving = false;
  let loading = true;
  let testing = false;

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

  async function testMpesaConfiguration() {
    try {
      testing = true;

      const response = await fetch('/api/mpesa/test');
      const result = await response.json();

      if (result.success) {
        toasts.add({
          type: 'success',
          message: 'M-Pesa configuration test successful!'
        });
      } else {
        toasts.add({
          type: 'error',
          message: `M-Pesa test failed: ${result.error}`
        });
      }
    } catch (error) {
      toasts.add({
        type: 'error',
        message: 'Failed to test M-Pesa configuration'
      });
    } finally {
      testing = false;
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

        <div class="space-y-6">
          <!-- M-Pesa API Configuration -->
          <div class="bg-dark-50 dark:bg-dark-700 rounded-lg p-4">
            <h4 class="font-medium text-dark-900 dark:text-white mb-3">M-Pesa API Configuration</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="mpesa-business-code" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Business Short Code
                </label>
                <input
                  id="mpesa-business-code"
                  type="text"
                  bind:value={settings.mpesa_business_code}
                  class="input-field"
                  placeholder="174379"
                />
                <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
                  Your M-Pesa business shortcode for receiving payments
                </p>
              </div>

              <div>
                <label for="mpesa-environment" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Environment
                </label>
                <select id="mpesa-environment" bind:value={settings.mpesa_environment} class="input-field">
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="production">Production (Live)</option>
                </select>
                <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
                  Use sandbox for testing, production for live payments
                </p>
              </div>

              <div>
                <label for="mpesa-consumer-key" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Consumer Key
                </label>
                <input
                  id="mpesa-consumer-key"
                  type="text"
                  bind:value={settings.mpesa_consumer_key}
                  class="input-field"
                  placeholder="Your M-Pesa consumer key"
                />
                <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
                  API consumer key from Safaricom developer portal
                </p>
              </div>

              <div>
                <label for="mpesa-consumer-secret" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Consumer Secret
                </label>
                <input
                  id="mpesa-consumer-secret"
                  type="password"
                  bind:value={settings.mpesa_consumer_secret}
                  class="input-field"
                  placeholder="Your M-Pesa consumer secret"
                />
                <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
                  API consumer secret from Safaricom developer portal
                </p>
              </div>

              <div class="md:col-span-2">
                <label for="mpesa-passkey" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Passkey
                </label>
                <input
                  id="mpesa-passkey"
                  type="password"
                  bind:value={settings.mpesa_passkey}
                  class="input-field"
                  placeholder="Your M-Pesa passkey"
                />
                <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
                  STK Push passkey for your business shortcode
                </p>
              </div>
            </div>

            <!-- Test Configuration Button -->
            <div class="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
              <button
                on:click={testMpesaConfiguration}
                disabled={testing}
                class="btn-outline inline-flex items-center space-x-2"
              >
                <TestTube class="w-4 h-4" />
                <span>{testing ? 'Testing...' : 'Test Configuration'}</span>
              </button>
              <p class="text-xs text-dark-500 dark:text-dark-400 mt-2">
                Test your M-Pesa API credentials and configuration
              </p>
            </div>
          </div>

          <!-- Deposit Configuration -->
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 class="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              Deposit Configuration
            </h4>
            <div>
              <label for="deposit-phone-number" class="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Deposit Phone Number
              </label>
              <input
                id="deposit-phone-number"
                type="tel"
                bind:value={settings.deposit_phone_number}
                class="input-field border-green-300 dark:border-green-700 focus:border-green-500 focus:ring-green-500"
                placeholder="254712345678"
              />
              <p class="text-xs text-green-700 dark:text-green-300 mt-1">
                Phone number where all donations will be deposited. Format: 254XXXXXXXXX
              </p>
            </div>
          </div>


        </div>
      </div>
    </div>
  </div>
  {/if}
</div>
