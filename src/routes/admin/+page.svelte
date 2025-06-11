<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    TrendingUp, 
    Users, 
    Target, 
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Calendar
  } from 'lucide-svelte';

  let stats = {
    total_projects: 0,
    active_projects: 0,
    total_donations: 0,
    total_amount_raised: 0,
    recent_donations: [],
    donations_by_category: [],
    monthly_trends: []
  };
  
  let loading = true;

  onMount(async () => {
    await loadDashboardData();
  });

  async function loadDashboardData() {
    try {
      loading = true;
      const response = await fetch('/api/stats');
      if (response.ok) {
        stats = await response.json();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      loading = false;
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
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
</script>

<svelte:head>
  <title>Admin Dashboard - DonateAnon</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="font-display text-3xl font-bold text-dark-900 dark:text-white">
      Dashboard
    </h1>
    <p class="text-dark-600 dark:text-dark-400 mt-2">
      Overview of donation platform performance
    </p>
  </div>

  {#if loading}
    <!-- Loading State -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each Array(4) as _}
        <div class="card animate-pulse">
          <div class="p-6">
            <div class="h-4 bg-dark-200 dark:bg-dark-700 rounded mb-2"></div>
            <div class="h-8 bg-dark-200 dark:bg-dark-700 rounded mb-2"></div>
            <div class="h-3 bg-dark-200 dark:bg-dark-700 rounded w-20"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Projects -->
      <div class="card">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-dark-600 dark:text-dark-400">
                Total Projects
              </p>
              <p class="text-3xl font-bold text-dark-900 dark:text-white">
                {stats.total_projects}
              </p>
              <p class="text-sm text-dark-500 dark:text-dark-500 mt-1">
                {stats.active_projects} active
              </p>
            </div>
            <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <Target class="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Total Donations -->
      <div class="card">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-dark-600 dark:text-dark-400">
                Total Donations
              </p>
              <p class="text-3xl font-bold text-dark-900 dark:text-white">
                {stats.total_donations}
              </p>
              <div class="flex items-center mt-1">
                <ArrowUpRight class="w-4 h-4 text-green-500 mr-1" />
                <p class="text-sm text-green-600">+12% this month</p>
              </div>
            </div>
            <div class="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-full">
              <Users class="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Total Amount Raised -->
      <div class="card">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-dark-600 dark:text-dark-400">
                Amount Raised
              </p>
              <p class="text-3xl font-bold text-dark-900 dark:text-white">
                {formatCurrency(stats.total_amount_raised)}
              </p>
              <div class="flex items-center mt-1">
                <ArrowUpRight class="w-4 h-4 text-green-500 mr-1" />
                <p class="text-sm text-green-600">+8% this month</p>
              </div>
            </div>
            <div class="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-full">
              <DollarSign class="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Average Donation -->
      <div class="card">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-dark-600 dark:text-dark-400">
                Avg. Donation
              </p>
              <p class="text-3xl font-bold text-dark-900 dark:text-white">
                {formatCurrency(stats.total_donations > 0 ? stats.total_amount_raised / stats.total_donations : 0)}
              </p>
              <div class="flex items-center mt-1">
                <ArrowDownRight class="w-4 h-4 text-red-500 mr-1" />
                <p class="text-sm text-red-600">-3% this month</p>
              </div>
            </div>
            <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <TrendingUp class="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Donations -->
      <div class="card">
        <div class="p-6">
          <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Recent Donations
          </h3>
          <div class="space-y-3">
            {#each stats.recent_donations.slice(0, 5) as donation}
              <div class="flex items-center justify-between py-3 border-b border-dark-200 dark:border-dark-700 last:border-b-0">
                <div class="flex-1">
                  <p class="font-medium text-dark-900 dark:text-white">
                    {donation.donor_name}
                  </p>
                  <p class="text-sm text-dark-500 dark:text-dark-400">
                    {donation.project_title}
                  </p>
                  <p class="text-xs text-dark-400 dark:text-dark-500">
                    {formatDate(donation.created_at)}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-primary-600 dark:text-primary-400">
                    {formatCurrency(donation.amount)}
                  </p>
                </div>
              </div>
            {/each}
            {#if stats.recent_donations.length === 0}
              <p class="text-center text-dark-500 dark:text-dark-400 py-8">
                No recent donations
              </p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Donations by Category -->
      <div class="card">
        <div class="p-6">
          <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Donations by Category
          </h3>
          <div class="space-y-4">
            {#each stats.donations_by_category as category}
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-dark-700 dark:text-dark-300">
                    {category.category}
                  </span>
                  <span class="text-sm text-dark-500 dark:text-dark-400">
                    {formatCurrency(category.total_amount)}
                  </span>
                </div>
                <div class="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                  <div 
                    class="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                    style="width: {Math.min((category.total_amount / stats.total_amount_raised) * 100, 100)}%"
                  ></div>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-dark-500 dark:text-dark-400">
                    {category.donation_count} donations
                  </span>
                  <span class="text-xs text-dark-500 dark:text-dark-400">
                    {((category.total_amount / stats.total_amount_raised) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            {/each}
            {#if stats.donations_by_category.length === 0}
              <p class="text-center text-dark-500 dark:text-dark-400 py-8">
                No donation data available
              </p>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Trends -->
    {#if stats.monthly_trends.length > 0}
      <div class="card">
        <div class="p-6">
          <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Monthly Donation Trends
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {#each stats.monthly_trends as trend}
              <div class="text-center">
                <div class="text-sm text-dark-500 dark:text-dark-400 mb-1">
                  {new Date(trend.month + '-01').toLocaleDateString('en-KE', { month: 'short', year: '2-digit' })}
                </div>
                <div class="text-lg font-semibold text-dark-900 dark:text-white">
                  {formatCurrency(trend.total_amount)}
                </div>
                <div class="text-xs text-dark-400 dark:text-dark-500">
                  {trend.donation_count} donations
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Quick Actions -->
    <div class="card">
      <div class="p-6">
        <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/projects" class="btn-primary text-center">
            Manage Projects
          </a>
          <a href="/admin/donations" class="btn-secondary text-center">
            View All Donations
          </a>
          <a href="/admin/settings" class="btn-outline text-center">
            Platform Settings
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>
