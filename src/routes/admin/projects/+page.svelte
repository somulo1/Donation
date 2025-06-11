<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-svelte';
  import { toasts } from '$lib/stores';
  import type { Project } from '$lib/types';
  import ProjectFormModal from '$lib/components/ProjectFormModal.svelte';

  let projects: Project[] = [];
  let filteredProjects: Project[] = [];
  let loading = true;
  let searchTerm = '';
  let selectedCategory = '';
  let selectedStatus = '';
  let categories: string[] = [];
  let showCreateModal = false;
  let showEditModal = false;
  let editingProject: Project | null = null;

  onMount(async () => {
    await loadProjects();
  });

  async function loadProjects() {
    try {
      loading = true;
      const response = await fetch('/api/projects?status=all');
      if (response.ok) {
        projects = await response.json();
        filteredProjects = projects;
        
        // Extract unique categories
        categories = [...new Set(projects.map(p => p.category))];
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toasts.add({
        type: 'error',
        message: 'Failed to load projects'
      });
    } finally {
      loading = false;
    }
  }

  function filterProjects() {
    filteredProjects = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || project.category === selectedCategory;
      const matchesStatus = !selectedStatus || project.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  function openCreateModal() {
    showCreateModal = true;
  }

  function openEditModal(project: Project) {
    editingProject = project;
    showEditModal = true;
  }

  function closeModals() {
    showCreateModal = false;
    showEditModal = false;
    editingProject = null;
  }

  async function handleProjectCreated() {
    closeModals();
    await loadProjects();
    toasts.add({
      type: 'success',
      message: 'Project created successfully'
    });
  }

  async function handleProjectUpdated() {
    closeModals();
    await loadProjects();
    toasts.add({
      type: 'success',
      message: 'Project updated successfully'
    });
  }

  async function deleteProject(projectId: number) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toasts.add({
          type: 'success',
          message: 'Project deleted successfully'
        });
        await loadProjects();
      } else {
        const error = await response.json();
        toasts.add({
          type: 'error',
          message: error.error || 'Failed to delete project'
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toasts.add({
        type: 'error',
        message: 'Failed to delete project'
      });
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
      month: 'short',
      day: 'numeric'
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  $: {
    searchTerm, selectedCategory, selectedStatus;
    filterProjects();
  }
</script>

<svelte:head>
  <title>Manage Projects - Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="font-display text-3xl font-bold text-dark-900 dark:text-white">
        Projects Management
      </h1>
      <p class="text-dark-600 dark:text-dark-400 mt-2">
        Manage all social projects on the platform
      </p>
    </div>
    <button
      on:click={openCreateModal}
      class="btn-primary inline-flex items-center space-x-2"
    >
      <Plus class="w-5 h-5" />
      <span>Add New Project</span>
    </button>
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
            class="input-field pl-10 pr-8 appearance-none"
          >
            <option value="">All Categories</option>
            {#each categories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </div>

        <!-- Status Filter -->
        <select
          bind:value={selectedStatus}
          class="input-field appearance-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>

        <!-- Results Count -->
        <div class="flex items-center text-sm text-dark-600 dark:text-dark-400">
          Showing {filteredProjects.length} of {projects.length} projects
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
              <div class="w-16 h-16 bg-dark-200 dark:bg-dark-700 rounded"></div>
              <div class="flex-1">
                <div class="h-4 bg-dark-200 dark:bg-dark-700 rounded mb-2"></div>
                <div class="h-3 bg-dark-200 dark:bg-dark-700 rounded w-3/4"></div>
              </div>
              <div class="w-24 h-8 bg-dark-200 dark:bg-dark-700 rounded"></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if filteredProjects.length === 0}
    <!-- Empty State -->
    <div class="card">
      <div class="p-12 text-center">
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
          on:click={() => { searchTerm = ''; selectedCategory = ''; selectedStatus = ''; }}
          class="btn-outline"
        >
          Clear Filters
        </button>
      </div>
    </div>
  {:else}
    <!-- Projects Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-dark-50 dark:bg-dark-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Project
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Progress
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-dark-800 divide-y divide-dark-200 dark:divide-dark-700">
            {#each filteredProjects as project}
              <tr class="hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors duration-200">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      {#if project.image_url}
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          class="h-12 w-12 rounded-lg object-cover"
                        />
                      {:else}
                        <div class="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 flex items-center justify-center">
                          <span class="text-primary-600 font-medium text-sm">
                            {project.title.charAt(0)}
                          </span>
                        </div>
                      {/if}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-dark-900 dark:text-white">
                        {project.title}
                      </div>
                      <div class="text-sm text-dark-500 dark:text-dark-400 max-w-xs truncate">
                        {project.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-dark-900 dark:text-white">
                    {project.category}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="w-full">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-dark-600 dark:text-dark-400">
                        {formatCurrency(project.current_amount)}
                      </span>
                      <span class="text-dark-600 dark:text-dark-400">
                        {getProgressPercentage(project.current_amount, project.target_amount).toFixed(1)}%
                      </span>
                    </div>
                    <div class="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                      <div 
                        class="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                        style="width: {getProgressPercentage(project.current_amount, project.target_amount)}%"
                      ></div>
                    </div>
                    <div class="text-xs text-dark-500 dark:text-dark-400 mt-1">
                      Goal: {formatCurrency(project.target_amount)}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(project.status)}">
                    {project.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-dark-500 dark:text-dark-400">
                  {formatDate(project.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <a 
                      href="/projects/{project.id}"
                      class="p-2 text-dark-400 hover:text-primary-600 transition-colors duration-200"
                      title="View Project"
                    >
                      <Eye class="w-4 h-4" />
                    </a>
                    <button
                      on:click={() => openEditModal(project)}
                      class="p-2 text-dark-400 hover:text-secondary-600 transition-colors duration-200"
                      title="Edit Project"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button 
                      on:click={() => deleteProject(project.id)}
                      class="p-2 text-dark-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete Project"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<!-- Create Project Modal -->
<ProjectFormModal
  isOpen={showCreateModal}
  title="Create New Project"
  on:created={handleProjectCreated}
  on:close={closeModals}
/>

<!-- Edit Project Modal -->
<ProjectFormModal
  isOpen={showEditModal}
  project={editingProject}
  title="Edit Project"
  on:updated={handleProjectUpdated}
  on:close={closeModals}
/>
