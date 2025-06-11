<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Heart, Users, Target, Calendar, ArrowLeft } from 'lucide-svelte';
  import { toasts } from '$lib/stores';
  import DonationForm from '$lib/components/DonationForm.svelte';
  import type { Project } from '$lib/types';

  let project: Project | null = null;
  let recentDonations: any[] = [];
  let loading = true;
  let showDonationForm = false;

  onMount(async () => {
    await loadProject();
  });

  async function loadProject() {
    try {
      loading = true;
      const projectId = $page.params.id;
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (response.ok) {
        const data = await response.json();
        project = data;
        recentDonations = data.recent_donations || [];
      } else {
        toasts.add({
          type: 'error',
          message: 'Project not found'
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toasts.add({
        type: 'error',
        message: 'Failed to load project details'
      });
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

  function getProgressPercentage(current: number, target: number): number {
    return Math.min((current / target) * 100, 100);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function handleDonationSuccess() {
    showDonationForm = false;
    loadProject(); // Refresh project data
    toasts.add({
      type: 'success',
      message: 'Thank you for your donation! Your contribution makes a difference.'
    });
  }
</script>

<svelte:head>
  <title>{project?.title || 'Project'} - DonateAnon</title>
  <meta name="description" content={project?.description || 'Support this social project with an anonymous donation'} />
</svelte:head>

{#if loading}
  <!-- Loading State -->
  <div class="section-padding py-8">
    <div class="container-max">
      <div class="animate-pulse">
        <div class="h-8 bg-dark-200 dark:bg-dark-700 rounded w-32 mb-6"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="aspect-video bg-dark-200 dark:bg-dark-700 rounded-xl mb-6"></div>
            <div class="h-8 bg-dark-200 dark:bg-dark-700 rounded mb-4"></div>
            <div class="h-32 bg-dark-200 dark:bg-dark-700 rounded"></div>
          </div>
          <div>
            <div class="card">
              <div class="p-6">
                <div class="h-6 bg-dark-200 dark:bg-dark-700 rounded mb-4"></div>
                <div class="h-4 bg-dark-200 dark:bg-dark-700 rounded mb-2"></div>
                <div class="h-2 bg-dark-200 dark:bg-dark-700 rounded mb-4"></div>
                <div class="h-10 bg-dark-200 dark:bg-dark-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if project}
  <div class="section-padding py-8">
    <div class="container-max">
      <!-- Back Button -->
      <a 
        href="/projects" 
        class="inline-flex items-center space-x-2 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 mb-6"
      >
        <ArrowLeft class="w-5 h-5" />
        <span>Back to Projects</span>
      </a>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Project Image -->
          <div class="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl overflow-hidden mb-6">
            {#if project.image_url}
              <img 
                src={project.image_url} 
                alt={project.title}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center">
                <Heart class="w-16 h-16 text-primary-400" />
              </div>
            {/if}
          </div>

          <!-- Project Details -->
          <div class="card">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                  {project.category}
                </span>
                <span class="text-sm text-dark-500 dark:text-dark-400 capitalize">
                  {project.status}
                </span>
              </div>

              <h1 class="font-display text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
                {project.title}
              </h1>

              <div class="prose prose-dark dark:prose-invert max-w-none">
                <p class="text-lg text-dark-600 dark:text-dark-400 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div class="flex items-center space-x-6 mt-6 pt-6 border-t border-dark-200 dark:border-dark-700">
                <div class="flex items-center space-x-2 text-dark-600 dark:text-dark-400">
                  <Calendar class="w-5 h-5" />
                  <span class="text-sm">Created {formatDate(project.created_at)}</span>
                </div>
                <div class="flex items-center space-x-2 text-dark-600 dark:text-dark-400">
                  <Users class="w-5 h-5" />
                  <span class="text-sm">{project.donation_count || 0} donors</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Donations -->
          {#if recentDonations.length > 0}
            <div class="card mt-6">
              <div class="p-6">
                <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
                  Recent Donations
                </h3>
                <div class="space-y-3">
                  {#each recentDonations as donation}
                    <div class="flex items-center justify-between py-3 border-b border-dark-200 dark:border-dark-700 last:border-b-0">
                      <div>
                        <div class="font-medium text-dark-900 dark:text-white">
                          {donation.donor_name}
                        </div>
                        <div class="text-sm text-dark-500 dark:text-dark-400">
                          {formatDate(donation.created_at)}
                        </div>
                      </div>
                      <div class="font-semibold text-primary-600 dark:text-primary-400">
                        {formatCurrency(donation.amount)}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Donation Progress -->
          <div class="card sticky top-24">
            <div class="p-6">
              <div class="text-center mb-6">
                <div class="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                  {formatCurrency(project.current_amount)}
                </div>
                <div class="text-dark-600 dark:text-dark-400">
                  raised of {formatCurrency(project.target_amount)} goal
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-6">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-dark-600 dark:text-dark-400">Progress</span>
                  <span class="font-medium text-dark-900 dark:text-white">
                    {getProgressPercentage(project.current_amount, project.target_amount).toFixed(1)}%
                  </span>
                </div>
                <div class="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-3">
                  <div 
                    class="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                    style="width: {getProgressPercentage(project.current_amount, project.target_amount)}%"
                  ></div>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="text-center">
                  <div class="text-2xl font-bold text-dark-900 dark:text-white">
                    {project.donation_count || 0}
                  </div>
                  <div class="text-sm text-dark-600 dark:text-dark-400">Donors</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-dark-900 dark:text-white">
                    {Math.ceil((project.target_amount - project.current_amount) / 1000)}K
                  </div>
                  <div class="text-sm text-dark-600 dark:text-dark-400">To Go</div>
                </div>
              </div>

              <!-- Donate Button -->
              {#if project.status === 'active'}
                <button
                  on:click={() => showDonationForm = true}
                  class="btn-primary w-full"
                >
                  Donate Now
                </button>
              {:else}
                <div class="text-center py-4 text-dark-500 dark:text-dark-400">
                  This project is {project.status}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- Error State -->
  <div class="section-padding py-16">
    <div class="container-max text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
        <Heart class="w-8 h-8 text-red-600" />
      </div>
      <h1 class="font-display text-2xl font-bold text-dark-900 dark:text-white mb-4">
        Project Not Found
      </h1>
      <p class="text-dark-600 dark:text-dark-400 mb-6">
        The project you're looking for doesn't exist or has been removed.
      </p>
      <a href="/projects" class="btn-primary">
        Browse All Projects
      </a>
    </div>
  </div>
{/if}

<!-- Donation Form Modal -->
{#if showDonationForm && project}
  <DonationForm 
    {project}
    on:close={() => showDonationForm = false}
    on:success={handleDonationSuccess}
  />
{/if}
