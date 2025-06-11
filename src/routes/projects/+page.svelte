<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, Filter, Heart, ArrowRight } from 'lucide-svelte';
  import type { Project } from '$lib/types';

  let projects: Project[] = [];
  let filteredProjects: Project[] = [];
  let loading = true;
  let searchTerm = '';
  let selectedCategory = '';
  let categories: string[] = [];

  onMount(async () => {
    await loadProjects();
  });

  async function loadProjects() {
    try {
      loading = true;
      const response = await fetch('/api/projects');
      if (response.ok) {
        projects = await response.json();
        filteredProjects = projects;
        
        // Extract unique categories
        categories = [...new Set(projects.map(p => p.category))];
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      loading = false;
    }
  }

  function filterProjects() {
    filteredProjects = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || project.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
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

  $: {
    searchTerm, selectedCategory;
    filterProjects();
  }
</script>

<svelte:head>
  <title>All Projects - DonateAnon</title>
  <meta name="description" content="Browse all social projects available for anonymous donations. Support causes that matter to you." />
</svelte:head>

<div class="section-padding py-8">
  <div class="container-max">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="font-display text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-4">
        All Projects
      </h1>
      <p class="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
        Discover and support social projects that are making a difference in communities
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-dark-200 dark:border-dark-700 p-6 mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search projects..."
            bind:value={searchTerm}
            class="input-field pl-10"
          />
        </div>

        <!-- Category Filter -->
        <div class="relative">
          <Filter class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <select
            bind:value={selectedCategory}
            class="input-field pl-10 pr-8 appearance-none bg-white dark:bg-dark-800"
          >
            <option value="">All Categories</option>
            {#each categories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Results Count -->
      <div class="mt-4 text-sm text-dark-600 dark:text-dark-400">
        Showing {filteredProjects.length} of {projects.length} projects
      </div>
    </div>

    <!-- Loading State -->
    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each Array(6) as _}
          <div class="card animate-pulse">
            <div class="aspect-video bg-dark-200 dark:bg-dark-700 rounded-t-xl"></div>
            <div class="p-6">
              <div class="h-4 bg-dark-200 dark:bg-dark-700 rounded mb-2"></div>
              <div class="h-6 bg-dark-200 dark:bg-dark-700 rounded mb-3"></div>
              <div class="h-16 bg-dark-200 dark:bg-dark-700 rounded mb-4"></div>
              <div class="h-2 bg-dark-200 dark:bg-dark-700 rounded mb-4"></div>
              <div class="h-10 bg-dark-200 dark:bg-dark-700 rounded"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if filteredProjects.length === 0}
      <!-- Empty State -->
      <div class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-dark-100 dark:bg-dark-800 rounded-full mb-6">
          <Search class="w-8 h-8 text-dark-400" />
        </div>
        <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-2">
          No projects found
        </h3>
        <p class="text-dark-600 dark:text-dark-400 mb-6">
          Try adjusting your search terms or filters
        </p>
        <button
          on:click={() => { searchTerm = ''; selectedCategory = ''; }}
          class="btn-outline"
        >
          Clear Filters
        </button>
      </div>
    {:else}
      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each filteredProjects as project}
          <div class="card card-hover">
            <div class="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-t-xl overflow-hidden">
              {#if project.image_url}
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center">
                  <Heart class="w-12 h-12 text-primary-400" />
                </div>
              {/if}
            </div>
            
            <div class="p-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                  {project.category}
                </span>
                <span class="text-sm text-dark-500 dark:text-dark-400 capitalize">
                  {project.status}
                </span>
              </div>
              
              <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-3">
                {project.title}
              </h3>
              
              <p class="text-dark-600 dark:text-dark-400 mb-4 line-clamp-3">
                {project.description}
              </p>
              
              <div class="mb-4">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-dark-600 dark:text-dark-400">Progress</span>
                  <span class="font-medium text-dark-900 dark:text-white">
                    {getProgressPercentage(project.current_amount, project.target_amount).toFixed(1)}%
                  </span>
                </div>
                <div class="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                  <div 
                    class="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                    style="width: {getProgressPercentage(project.current_amount, project.target_amount)}%"
                  ></div>
                </div>
                <div class="flex justify-between text-sm mt-2">
                  <span class="text-dark-600 dark:text-dark-400">
                    {formatCurrency(project.current_amount)} raised
                  </span>
                  <span class="font-medium text-dark-900 dark:text-white">
                    {formatCurrency(project.target_amount)} goal
                  </span>
                </div>
              </div>
              
              <a 
                href="/projects/{project.id}" 
                class="btn-primary w-full text-center inline-flex items-center justify-center space-x-2"
              >
                <span>Donate Now</span>
                <ArrowRight class="w-4 h-4" />
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
