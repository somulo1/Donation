<script lang="ts">
  import { onMount } from 'svelte';
  import { CheckCircle, XCircle, Phone, DollarSign } from 'lucide-svelte';
  import { toasts } from '$lib/stores';

  let credentialsTest = {
    loading: false,
    success: false,
    error: '',
    details: null
  };

  let stkTest = {
    loading: false,
    success: false,
    error: '',
    details: null,
    phoneNumber: '',
    amount: 1
  };

  onMount(async () => {
    await testCredentials();
  });

  async function testCredentials() {
    try {
      credentialsTest.loading = true;
      credentialsTest.error = '';
      
      const response = await fetch('/api/mpesa/test');
      const result = await response.json();
      
      credentialsTest.success = result.success;
      credentialsTest.details = result;
      
      if (!result.success) {
        credentialsTest.error = result.error || 'Unknown error';
      }
    } catch (error) {
      credentialsTest.success = false;
      credentialsTest.error = 'Network error';
    } finally {
      credentialsTest.loading = false;
    }
  }

  async function testSTKPush() {
    if (!stkTest.phoneNumber) {
      toasts.add({
        type: 'error',
        message: 'Please enter a phone number'
      });
      return;
    }

    try {
      stkTest.loading = true;
      stkTest.error = '';
      
      const response = await fetch('/api/mpesa/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: stkTest.phoneNumber,
          amount: stkTest.amount
        })
      });
      
      const result = await response.json();
      
      stkTest.success = result.success;
      stkTest.details = result;
      
      if (result.success) {
        toasts.add({
          type: 'success',
          message: 'STK Push sent successfully! Check your phone.'
        });
      } else {
        stkTest.error = result.error || 'Unknown error';
        toasts.add({
          type: 'error',
          message: result.error || 'STK Push failed'
        });
      }
    } catch (error) {
      stkTest.success = false;
      stkTest.error = 'Network error';
      toasts.add({
        type: 'error',
        message: 'Network error while testing STK Push'
      });
    } finally {
      stkTest.loading = false;
    }
  }
</script>

<svelte:head>
  <title>M-Pesa Test - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="font-display text-3xl font-bold text-dark-900 dark:text-white">
      M-Pesa Integration Test
    </h1>
    <p class="text-dark-600 dark:text-dark-400 mt-2">
      Test M-Pesa credentials and STK Push functionality
    </p>
  </div>

  <!-- Credentials Test -->
  <div class="card">
    <div class="p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <CheckCircle class="w-5 h-5 text-primary-600" />
        </div>
        <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white">
          Credentials Test
        </h3>
      </div>

      {#if credentialsTest.loading}
        <div class="flex items-center space-x-3">
          <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-dark-600 dark:text-dark-400">Testing credentials...</span>
        </div>
      {:else if credentialsTest.success}
        <div class="flex items-center space-x-3 text-green-600">
          <CheckCircle class="w-5 h-5" />
          <span>M-Pesa credentials are valid</span>
        </div>
        {#if credentialsTest.details}
          <div class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <pre class="text-sm text-green-800 dark:text-green-200">{JSON.stringify(credentialsTest.details, null, 2)}</pre>
          </div>
        {/if}
      {:else}
        <div class="flex items-center space-x-3 text-red-600">
          <XCircle class="w-5 h-5" />
          <span>Credentials test failed: {credentialsTest.error}</span>
        </div>
        {#if credentialsTest.details}
          <div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <pre class="text-sm text-red-800 dark:text-red-200">{JSON.stringify(credentialsTest.details, null, 2)}</pre>
          </div>
        {/if}
        <button
          on:click={testCredentials}
          class="btn-outline mt-3"
        >
          Retry Test
        </button>
      {/if}
    </div>
  </div>

  <!-- STK Push Test -->
  <div class="card">
    <div class="p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
          <Phone class="w-5 h-5 text-secondary-600" />
        </div>
        <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white">
          STK Push Test
        </h3>
      </div>

      <div class="space-y-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Phone Number
          </label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              id="phone"
              type="tel"
              bind:value={stkTest.phoneNumber}
              placeholder="254712345678"
              class="input-field pl-10"
            />
          </div>
          <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
            Format: 254XXXXXXXXX or 07XXXXXXXX
          </p>
        </div>

        <div>
          <label for="amount" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Amount (KES)
          </label>
          <div class="relative">
            <DollarSign class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              id="amount"
              type="number"
              bind:value={stkTest.amount}
              min="1"
              max="1000"
              class="input-field pl-10"
            />
          </div>
        </div>

        <button
          on:click={testSTKPush}
          disabled={stkTest.loading || !credentialsTest.success}
          class="btn-primary disabled:opacity-50"
        >
          {#if stkTest.loading}
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending STK Push...</span>
            </div>
          {:else}
            Send Test STK Push
          {/if}
        </button>

        {#if stkTest.success}
          <div class="flex items-center space-x-3 text-green-600">
            <CheckCircle class="w-5 h-5" />
            <span>STK Push sent successfully!</span>
          </div>
        {:else if stkTest.error}
          <div class="flex items-center space-x-3 text-red-600">
            <XCircle class="w-5 h-5" />
            <span>STK Push failed: {stkTest.error}</span>
          </div>
        {/if}

        {#if stkTest.details}
          <div class="mt-3 p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
            <h4 class="font-medium text-dark-900 dark:text-white mb-2">Response Details:</h4>
            <pre class="text-sm text-dark-600 dark:text-dark-400 overflow-x-auto">{JSON.stringify(stkTest.details, null, 2)}</pre>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
