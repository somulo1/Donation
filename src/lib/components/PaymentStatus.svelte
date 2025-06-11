<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { CheckCircle, XCircle, Clock, Smartphone, RefreshCw } from 'lucide-svelte';
  import { toasts } from '$lib/stores';

  export let donationId: number;
  export let checkoutRequestId: string;
  export let amount: number;
  export let projectTitle: string;
  export let demoMode: boolean = false;

  const dispatch = createEventDispatcher();

  let status: 'processing' | 'completed' | 'failed' | 'timeout' = 'processing';
  let message = 'Please complete the payment on your phone';
  let remainingTime = 30;
  let transactionId = '';
  let checking = false;
  let interval: NodeJS.Timeout;

  onMount(() => {
    // Start checking payment status
    checkPaymentStatus();
    
    // Check every 3 seconds
    interval = setInterval(() => {
      checkPaymentStatus();
    }, 3000);

    // Auto-timeout after 5 minutes
    setTimeout(() => {
      if (status === 'processing') {
        status = 'timeout';
        message = 'Payment timeout. Please try again.';
        clearInterval(interval);
      }
    }, 300000);
  });

  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  async function checkPaymentStatus() {
    if (checking || status === 'completed' || status === 'failed') return;

    try {
      checking = true;

      // Check donation status using the donations API
      const response = await fetch(`/api/donations/status?donation_id=${donationId}&checkout_request_id=${checkoutRequestId}`);
      const result = await response.json();

      console.log('Payment status check result:', result);

      if (result.success) {
        if (result.status === 'completed') {
          status = 'completed';
          message = result.message || 'Payment completed successfully!';

          if (result.donation?.transaction_id || result.donation?.mpesa_transaction_id) {
            transactionId = result.donation.transaction_id || result.donation.mpesa_transaction_id;
          }

          clearInterval(interval);
          toasts.add({
            type: 'success',
            message: 'Payment completed successfully! Thank you for your donation.'
          });

          // Dispatch success event after a short delay to show success state
          setTimeout(() => {
            dispatch('success', {
              donationId,
              transactionId,
              amount
            });
          }, 2000);
        } else if (result.status === 'pending' || result.status === 'processing') {
          // Still pending, continue checking
          message = result.message || 'Please complete the payment on your phone';
          remainingTime = result.remaining_time || 0;
          console.log('Payment still pending, continuing to check...');
        } else {
          // Failed, cancelled, expired, etc.
          status = 'failed';
          message = result.message || 'Payment failed. Please try again.';

          clearInterval(interval);
          toasts.add({
            type: 'error',
            message: result.message || 'Payment failed. Please try again.'
          });
        }
      } else {
        // API call failed, but don't immediately mark as failed
        console.log('Status check API failed, will retry:', result.error);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Don't mark as failed on network errors, just continue checking
    } finally {
      checking = false;
    }
  }

  function handleRetry() {
    dispatch('retry');
  }

  function handleClose() {
    dispatch('close');
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }
</script>

<!-- Modal Backdrop -->
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <!-- Modal Content -->
  <div class="bg-white dark:bg-dark-800 rounded-xl shadow-2xl max-w-md w-full p-6">
    
    {#if status === 'processing'}
      <!-- Processing State -->
      <div class="text-center">
        <div class="mb-6">
          <div class="relative mx-auto w-20 h-20 mb-4">
            <div class="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            <Smartphone class="absolute inset-0 m-auto w-8 h-8 text-primary-600" />
          </div>
          <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-2">
            {demoMode ? 'Demo Payment Processing' : 'Complete Payment on Your Phone'}
          </h3>
          <p class="text-dark-600 dark:text-dark-400 mb-4">
            {message}
          </p>
          {#if demoMode}
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                <strong>Demo Mode:</strong> This is a demonstration payment. In real mode, you would receive an M-Pesa prompt on your phone.
              </p>
            </div>
          {/if}
          <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
            <p class="text-sm text-primary-800 dark:text-primary-200">
              <strong>Amount:</strong> {formatCurrency(amount)}<br>
              <strong>Project:</strong> {projectTitle}
            </p>
          </div>
          {#if remainingTime > 0}
            <p class="text-sm text-dark-500 dark:text-dark-400">
              Time remaining: {remainingTime}s
            </p>
          {/if}
        </div>

        <div class="space-y-3">
          <div class="flex items-center space-x-3 text-sm text-dark-600 dark:text-dark-400">
            <div class="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
              <CheckCircle class="w-4 h-4 text-white" />
            </div>
            <span>{demoMode ? 'Demo payment initiated' : 'M-Pesa prompt sent to your phone'}</span>
          </div>
          <div class="flex items-center space-x-3 text-sm text-dark-600 dark:text-dark-400">
            <div class="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center">
              <Clock class="w-4 h-4 text-primary-600 animate-pulse" />
            </div>
            <span>{demoMode ? 'Payment will complete automatically in 10 seconds' : 'Enter your M-Pesa PIN to complete'}</span>
          </div>
        </div>

        <button
          on:click={handleClose}
          class="btn-outline w-full mt-6"
        >
          Cancel
        </button>
      </div>

    {:else if status === 'completed'}
      <!-- Success State -->
      <div class="text-center">
        <div class="mb-6">
          <div class="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle class="w-10 h-10 text-green-600" />
          </div>
          <h3 class="font-display text-xl font-semibold text-green-600 mb-2">
            Payment Successful!
          </h3>
          <p class="text-dark-600 dark:text-dark-400 mb-4">
            Thank you for your generous donation
          </p>
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
            <p class="text-sm text-green-800 dark:text-green-200">
              <strong>Amount:</strong> {formatCurrency(amount)}<br>
              <strong>Project:</strong> {projectTitle}<br>
              {#if transactionId}
                <strong>Transaction ID:</strong> {transactionId}
              {/if}
            </p>
          </div>
        </div>

        <button
          on:click={handleClose}
          class="btn-primary w-full"
        >
          Done
        </button>
      </div>

    {:else if status === 'failed' || status === 'timeout'}
      <!-- Failed State -->
      <div class="text-center">
        <div class="mb-6">
          <div class="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle class="w-10 h-10 text-red-600" />
          </div>
          <h3 class="font-display text-xl font-semibold text-red-600 mb-2">
            Payment {status === 'timeout' ? 'Timeout' : 'Failed'}
          </h3>
          <p class="text-dark-600 dark:text-dark-400 mb-4">
            {message}
          </p>
          <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
            <p class="text-sm text-red-800 dark:text-red-200">
              <strong>Amount:</strong> {formatCurrency(amount)}<br>
              <strong>Project:</strong> {projectTitle}
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <button
            on:click={handleRetry}
            class="btn-primary w-full"
          >
            <RefreshCw class="w-4 h-4 mr-2" />
            Try Again
          </button>
          <button
            on:click={handleClose}
            class="btn-outline w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}

    <!-- Status Indicator -->
    <div class="mt-4 text-center">
      <p class="text-xs text-dark-500 dark:text-dark-400">
        {#if checking}
          <RefreshCw class="w-3 h-3 inline animate-spin mr-1" />
          Checking status...
        {:else}
          Secure payment powered by M-Pesa
        {/if}
      </p>
    </div>
  </div>
</div>
