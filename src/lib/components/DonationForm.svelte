<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Heart, Phone, User, CreditCard } from 'lucide-svelte';
  import { toasts, loading } from '$lib/stores';
  import PaymentStatus from './PaymentStatus.svelte';
  import type { Project } from '$lib/types';

  export let project: Project;

  const dispatch = createEventDispatcher();

  let formData = {
    amount: '',
    donor_name: '',
    phone_number: ''
  };

  let errors: Record<string, string> = {};
  let submitting = false;
  let showPaymentStatus = false;
  let paymentData = {
    donationId: 0,
    checkoutRequestId: '',
    amount: 0,
    projectTitle: '',
    demoMode: false
  };

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  function validateForm(): boolean {
    errors = {};

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      errors.amount = 'Please enter a valid amount';
    } else if (amount < 10) {
      errors.amount = 'Minimum donation is KES 10';
    } else if (amount > 1000000) {
      errors.amount = 'Maximum donation is KES 1,000,000';
    }

    // Validate phone number
    if (!formData.phone_number) {
      errors.phone_number = 'Phone number is required for Mpesa payment';
    } else if (!/^(254|0)[17]\d{8}$/.test(formData.phone_number.replace(/\s+/g, ''))) {
      errors.phone_number = 'Please enter a valid Kenyan phone number (e.g., 0712345678)';
    }



    return Object.keys(errors).length === 0;
  }

  function formatPhoneNumber(phone: string): string {
    // Remove spaces and format
    phone = phone.replace(/\s+/g, '');
    if (phone.startsWith('0')) {
      return '254' + phone.slice(1);
    }
    return phone;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      submitting = true;
      loading.set(true);

      const donationData = {
        project_id: project.id,
        amount: parseFloat(formData.amount),
        donor_name: formData.donor_name || null,
        phone_number: formatPhoneNumber(formData.phone_number)
      };

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(donationData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show payment status modal
        paymentData = {
          donationId: result.donation_id,
          checkoutRequestId: result.checkout_request_id,
          amount: parseFloat(formData.amount),
          projectTitle: project.title,
          demoMode: result.demo_mode || false
        };
        showPaymentStatus = true;

        toasts.add({
          type: 'info',
          message: result.demo_mode
            ? 'Demo payment initiated. Your payment will be automatically completed in 10 seconds.'
            : 'M-Pesa prompt sent to your phone. Please enter your PIN to complete the payment.'
        });
      } else {
        toasts.add({
          type: 'error',
          message: result.error || 'Failed to process donation'
        });
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      toasts.add({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      submitting = false;
      loading.set(false);
    }
  }

  function selectAmount(amount: number) {
    formData.amount = amount.toString();
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handlePaymentSuccess(event: CustomEvent) {
    showPaymentStatus = false;
    toasts.add({
      type: 'success',
      message: `Thank you! Your donation of ${formatCurrency(event.detail.amount)} has been completed successfully.`
    });
    dispatch('success', event.detail);
  }

  function handlePaymentRetry() {
    showPaymentStatus = false;
    // Reset form to allow retry
  }

  function handlePaymentClose() {
    showPaymentStatus = false;
  }
</script>

<!-- Modal Backdrop -->
<div 
  class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  on:click={handleBackdropClick}
  role="dialog"
  aria-modal="true"
  aria-labelledby="donation-form-title"
>
  <!-- Modal Content -->
  <div class="bg-white dark:bg-dark-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
          <Heart class="w-5 h-5 text-white" />
        </div>
        <h2 id="donation-form-title" class="font-display text-xl font-semibold text-dark-900 dark:text-white">
          Make a Donation
        </h2>
      </div>
      <button
        on:click={handleClose}
        class="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors duration-200"
        aria-label="Close donation form"
      >
        <X class="w-5 h-5 text-dark-500 dark:text-dark-400" />
      </button>
    </div>

    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="p-6">
      <!-- Project Info -->
      <div class="mb-6 p-4 bg-dark-50 dark:bg-dark-700 rounded-lg">
        <h3 class="font-medium text-dark-900 dark:text-white mb-1">
          {project.title}
        </h3>
        <p class="text-sm text-dark-600 dark:text-dark-400">
          {project.category}
        </p>
      </div>

      <!-- Amount Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
          Donation Amount (KES) *
        </label>
        
        <!-- Predefined Amounts -->
        <div class="grid grid-cols-3 gap-2 mb-3">
          {#each predefinedAmounts as amount}
            <button
              type="button"
              on:click={() => selectAmount(amount)}
              class="p-3 text-sm border border-dark-300 dark:border-dark-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200"
              class:border-primary-500={formData.amount === amount.toString()}
              class:bg-primary-50={formData.amount === amount.toString()}
            >
              {formatCurrency(amount)}
            </button>
          {/each}
        </div>

        <!-- Custom Amount -->
        <div class="relative">
          <CreditCard class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="number"
            placeholder="Enter custom amount"
            bind:value={formData.amount}
            class="input-field pl-10"
            class:border-red-500={errors.amount}
            min="10"
            max="1000000"
            step="1"
          />
        </div>
        {#if errors.amount}
          <p class="text-red-600 text-sm mt-1">{errors.amount}</p>
        {/if}
      </div>

      <!-- Phone Number -->
      <div class="mb-6">
        <label for="phone" class="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          Phone Number (for Mpesa) *
        </label>
        <div class="relative">
          <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            id="phone"
            type="tel"
            placeholder="0712345678 or 254712345678"
            bind:value={formData.phone_number}
            class="input-field pl-10"
            class:border-red-500={errors.phone_number}
            required
          />
        </div>
        {#if errors.phone_number}
          <p class="text-red-600 text-sm mt-1">{errors.phone_number}</p>
        {/if}
        <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
          You'll receive an Mpesa prompt on this number
        </p>
      </div>

      <!-- Optional Donor Name -->
      <div class="mb-6">
        <label for="name" class="block text-sm text-dark-600 dark:text-dark-400 mb-2">
          Your Name (optional - leave blank to remain anonymous)
        </label>
        <div class="relative">
          <User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            id="name"
            type="text"
            placeholder="Anonymous"
            bind:value={formData.donor_name}
            class="input-field pl-10"
          />
        </div>
        <p class="text-xs text-dark-500 dark:text-dark-400 mt-1">
          If left blank, your donation will be recorded as "Anonymous"
        </p>
      </div>

      <!-- Privacy Notice -->
      <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <p class="text-sm text-green-800 dark:text-green-200">
          <strong>🔒 Complete Privacy:</strong> Your phone number is only used for M-Pesa payment processing and is never stored in our database. Only your donation amount and optional name (or "Anonymous") are recorded. No personal contact information is saved.
        </p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={submitting}
        class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if submitting}
          <div class="flex items-center justify-center space-x-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        {:else}
          Donate {formData.amount ? formatCurrency(parseFloat(formData.amount)) : ''}
        {/if}
      </button>

      <p class="text-xs text-center text-dark-500 dark:text-dark-400 mt-3">
        Secure payment powered by Mpesa
      </p>
    </form>
  </div>
</div>

<!-- Payment Status Modal -->
{#if showPaymentStatus}
  <PaymentStatus
    donationId={paymentData.donationId}
    checkoutRequestId={paymentData.checkoutRequestId}
    amount={paymentData.amount}
    projectTitle={paymentData.projectTitle}
    demoMode={paymentData.demoMode}
    on:success={handlePaymentSuccess}
    on:retry={handlePaymentRetry}
    on:close={handlePaymentClose}
  />
{/if}
