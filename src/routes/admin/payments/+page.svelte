<script lang="ts">
  import { onMount } from 'svelte';
  import { CheckCircle, Clock, RefreshCw, DollarSign } from 'lucide-svelte';
  import { toasts } from '$lib/stores';

  let pendingDonations: any[] = [];
  let loading = true;
  let confirming = false;

  onMount(async () => {
    await loadPendingDonations();
  });

  async function loadPendingDonations() {
    try {
      loading = true;
      const response = await fetch('/api/donations?status=pending');
      const result = await response.json();
      
      if (result.success) {
        pendingDonations = result.donations || [];
      }
    } catch (error) {
      console.error('Error loading pending donations:', error);
      toasts.add({
        type: 'error',
        message: 'Failed to load pending donations'
      });
    } finally {
      loading = false;
    }
  }

  async function confirmPayment(donationId: number) {
    const transactionId = prompt('Enter M-Pesa transaction ID:');
    if (!transactionId) return;

    try {
      confirming = true;
      
      const response = await fetch('/api/mpesa/notification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          transaction_id: transactionId,
          confirmed_by: 'admin'
        })
      });

      const result = await response.json();

      if (result.success) {
        toasts.add({
          type: 'success',
          message: 'Payment confirmed successfully!'
        });
        await loadPendingDonations();
      } else {
        toasts.add({
          type: 'error',
          message: result.error || 'Failed to confirm payment'
        });
      }
    } catch (error) {
      toasts.add({
        type: 'error',
        message: 'Network error while confirming payment'
      });
    } finally {
      confirming = false;
    }
  }

  async function simulateNotification(donationId: number, phoneNumber: string, amount: number) {
    try {
      confirming = true;
      
      const response = await fetch('/api/mpesa/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          amount,
          transaction_id: `DEMO${Date.now()}`,
          reference: donationId.toString(),
          status: 'completed'
        })
      });

      const result = await response.json();

      if (result.success) {
        toasts.add({
          type: 'success',
          message: 'Payment notification simulated successfully!'
        });
        await loadPendingDonations();
      } else {
        toasts.add({
          type: 'error',
          message: result.error || 'Failed to simulate notification'
        });
      }
    } catch (error) {
      toasts.add({
        type: 'error',
        message: 'Network error while simulating notification'
      });
    } finally {
      confirming = false;
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
</script>

<svelte:head>
  <title>Payment Management - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="font-display text-3xl font-bold text-dark-900 dark:text-white">
        Payment Management
      </h1>
      <p class="text-dark-600 dark:text-dark-400 mt-2">
        Manage and confirm pending M-Pesa payments
      </p>
    </div>
    <button
      on:click={loadPendingDonations}
      disabled={loading}
      class="btn-outline inline-flex items-center space-x-2"
    >
      <RefreshCw class="w-4 h-4 {loading ? 'animate-spin' : ''}" />
      <span>Refresh</span>
    </button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-3">
        <div class="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-dark-600 dark:text-dark-400">Loading pending payments...</span>
      </div>
    </div>
  {:else if pendingDonations.length === 0}
    <div class="text-center py-12">
      <DollarSign class="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
      <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-2">
        No Pending Payments
      </h3>
      <p class="text-dark-600 dark:text-dark-400">
        All payments have been processed successfully.
      </p>
    </div>
  {:else}
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-dark-50 dark:bg-dark-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Donation
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Project
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-200 dark:divide-dark-700">
            {#each pendingDonations as donation}
              <tr class="hover:bg-dark-50 dark:hover:bg-dark-700/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      {#if (donation.donor_name || 'Anonymous') === 'Anonymous'}
                        <!-- Special Anonymous Badge -->
                        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      {:else}
                        <!-- Named Donor Badge -->
                        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                          <span class="text-white font-medium text-xs">
                            {(donation.donor_name || 'A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      {/if}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-dark-900 dark:text-white">
                        #{donation.id}
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-sm text-dark-500 dark:text-dark-400">
                          {donation.donor_name || 'Anonymous'}
                        </span>
                        {#if (donation.donor_name || 'Anonymous') === 'Anonymous'}
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300">
                            <svg class="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                            </svg>
                            Kind Heart
                          </span>
                        {/if}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-dark-900 dark:text-white">
                    {formatCurrency(donation.amount)}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-dark-900 dark:text-white">
                    {donation.project_title || 'Unknown Project'}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-dark-500 dark:text-dark-400">
                    {formatDate(donation.created_at)}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock class="w-3 h-3 mr-1" />
                    Pending
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
