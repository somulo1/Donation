<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, Filter, Download, Eye, Calendar } from 'lucide-svelte';
  import { toasts } from '$lib/stores';

  let donations: any[] = [];
  let filteredDonations: any[] = [];
  let loading = true;
  let searchTerm = '';
  let selectedStatus = '';
  let selectedProject = '';
  let projects: any[] = [];

  onMount(async () => {
    await loadDonations();
    await loadProjects();
  });

  async function loadDonations() {
    try {
      loading = true;
      const response = await fetch('/api/donations');
      if (response.ok) {
        donations = await response.json();
        filteredDonations = donations;
      }
    } catch (error) {
      console.error('Error loading donations:', error);
      toasts.add({
        type: 'error',
        message: 'Failed to load donations'
      });
    } finally {
      loading = false;
    }
  }

  async function loadProjects() {
    try {
      const response = await fetch('/api/projects?status=all');
      if (response.ok) {
        projects = await response.json();
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  function filterDonations() {
    filteredDonations = donations.filter(donation => {
      const matchesSearch = donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           donation.project_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || donation.status === selectedStatus;
      const matchesProject = !selectedProject || donation.project_id.toString() === selectedProject;
      
      return matchesSearch && matchesStatus && matchesProject;
    });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  function exportDonations() {
    const csvContent = [
      ['Date', 'Donor', 'Project', 'Amount', 'Status'],
      ...filteredDonations.map(d => [
        formatDate(d.created_at),
        d.donor_name,
        d.project_title,
        d.amount,
        d.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toasts.add({
      type: 'success',
      message: 'Donations exported successfully'
    });
  }

  $: {
    searchTerm, selectedStatus, selectedProject;
    filterDonations();
  }
</script>

<svelte:head>
  <title>Donations Management - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="font-display text-3xl font-bold text-dark-900 dark:text-white">
        Donations Management
      </h1>
      <p class="text-dark-600 dark:text-dark-400 mt-2">
        Monitor and manage all donations on the platform
      </p>
    </div>
    <button 
      on:click={exportDonations}
      class="btn-primary inline-flex items-center space-x-2"
    >
      <Download class="w-5 h-5" />
      <span>Export CSV</span>
    </button>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div class="card">
      <div class="p-6">
        <div class="text-2xl font-bold text-dark-900 dark:text-white">
          {donations.length}
        </div>
        <div class="text-sm text-dark-600 dark:text-dark-400">Total Donations</div>
      </div>
    </div>
    <div class="card">
      <div class="p-6">
        <div class="text-2xl font-bold text-green-600">
          {donations.filter(d => d.status === 'completed').length}
        </div>
        <div class="text-sm text-dark-600 dark:text-dark-400">Completed</div>
      </div>
    </div>
    <div class="card">
      <div class="p-6">
        <div class="text-2xl font-bold text-yellow-600">
          {donations.filter(d => d.status === 'pending').length}
        </div>
        <div class="text-sm text-dark-600 dark:text-dark-400">Pending</div>
      </div>
    </div>
    <div class="card">
      <div class="p-6">
        <div class="text-2xl font-bold text-primary-600">
          {formatCurrency(donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0))}
        </div>
        <div class="text-sm text-dark-600 dark:text-dark-400">Total Amount</div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="card">
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search donations..."
            bind:value={searchTerm}
            class="input-field pl-10"
          />
        </div>

        <!-- Status Filter -->
        <div class="relative">
          <Filter class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <select
            bind:value={selectedStatus}
            class="input-field pl-10 pr-8 appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <!-- Project Filter -->
        <select
          bind:value={selectedProject}
          class="input-field appearance-none"
        >
          <option value="">All Projects</option>
          {#each projects as project}
            <option value={project.id}>{project.title}</option>
          {/each}
        </select>

        <!-- Results Count -->
        <div class="flex items-center text-sm text-dark-600 dark:text-dark-400">
          Showing {filteredDonations.length} of {donations.length} donations
        </div>
      </div>
    </div>
  </div>

  {#if loading}
    <!-- Loading State -->
    <div class="card">
      <div class="p-6">
        <div class="animate-pulse space-y-4">
          {#each Array(5) as _}
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-dark-200 dark:bg-dark-700 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-dark-200 dark:bg-dark-700 rounded mb-2"></div>
                <div class="h-3 bg-dark-200 dark:bg-dark-700 rounded w-3/4"></div>
              </div>
              <div class="w-20 h-6 bg-dark-200 dark:bg-dark-700 rounded"></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if filteredDonations.length === 0}
    <!-- Empty State -->
    <div class="card">
      <div class="p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-dark-100 dark:bg-dark-800 rounded-full mb-6">
          <Search class="w-8 h-8 text-dark-400" />
        </div>
        <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-2">
          No donations found
        </h3>
        <p class="text-dark-600 dark:text-dark-400 mb-6">
          Try adjusting your search terms or filters
        </p>
        <button
          on:click={() => { searchTerm = ''; selectedStatus = ''; selectedProject = ''; }}
          class="btn-outline"
        >
          Clear Filters
        </button>
      </div>
    </div>
  {:else}
    <!-- Donations Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-dark-50 dark:bg-dark-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Donor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Project
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
            {#each filteredDonations as donation}
              <tr class="hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span class="text-white font-medium text-sm">
                          {donation.donor_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-dark-900 dark:text-white">
                        {donation.donor_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-dark-900 dark:text-white">
                    {donation.project_title}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-dark-900 dark:text-white">
                    {formatCurrency(donation.amount)}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(donation.status)}">
                    {donation.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-dark-500 dark:text-dark-400">
                  <div class="flex items-center space-x-1">
                    <Calendar class="w-4 h-4" />
                    <span>{formatDate(donation.created_at)}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    class="p-2 text-dark-400 hover:text-primary-600 transition-colors duration-200"
                    title="View Details"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
