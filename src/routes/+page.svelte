<script lang="ts">
  import { onMount } from 'svelte';
  import { Heart, Target, Shield, Users, ArrowRight, TrendingUp } from 'lucide-svelte';
  import type { Project } from '$lib/types';

  let featuredProjects: Project[] = [];
  let stats = {
    total_projects: 0,
    total_donations: 0,
    total_amount_raised: 0
  };

  onMount(async () => {
    try {
      // Fetch featured projects
      const projectsResponse = await fetch('/api/projects?limit=3');
      if (projectsResponse.ok) {
        featuredProjects = await projectsResponse.json();
      }

      // Fetch stats
      const statsResponse = await fetch('/api/stats');
      if (statsResponse.ok) {
        stats = await statsResponse.json();
      }
    } catch (error) {
      console.error('Error loading homepage data:', error);
    }
  });

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
</script>

<svelte:head>
  <title>DonateAnon - Anonymous Donations for Social Projects</title>
  <meta name="description" content="Support social projects through anonymous donations. Make a difference in your community with secure Mpesa payments." />
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800">
  <div class="absolute inset-0 bg-pattern dark:opacity-20"></div>
  
  <div class="relative section-padding py-20 lg:py-32">
    <div class="container-max">
      <div class="text-center max-w-4xl mx-auto">
        <div class="inline-flex items-center space-x-2 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary-200 dark:border-primary-800">
          <Heart class="w-5 h-5 text-primary-600" />
          <span class="text-sm font-medium text-primary-700 dark:text-primary-300">Anonymous • Secure • Impactful</span>
        </div>
        
        <h1 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-dark-900 dark:text-white mb-6">
          Support Social Projects
          <span class="gradient-text block">Anonymously</span>
        </h1>
        
        <p class="text-xl md:text-2xl text-dark-600 dark:text-dark-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Make a difference in your community without revealing your identity. Support verified social projects with secure Mpesa payments.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="/projects" class="btn-primary inline-flex items-center space-x-2">
            <span>Explore Projects</span>
            <ArrowRight class="w-5 h-5" />
          </a>
          <a href="/about" class="btn-outline">
            Learn More
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Stats Section -->
<section class="section-padding py-16 bg-white dark:bg-dark-900">
  <div class="container-max">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
          <Target class="w-8 h-8 text-primary-600" />
        </div>
        <div class="text-3xl font-bold text-dark-900 dark:text-white mb-2">
          {stats.total_projects}
        </div>
        <div class="text-dark-600 dark:text-dark-400">Active Projects</div>
      </div>
      
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 dark:bg-secondary-900/30 rounded-full mb-4">
          <Users class="w-8 h-8 text-secondary-600" />
        </div>
        <div class="text-3xl font-bold text-dark-900 dark:text-white mb-2">
          {stats.total_donations}
        </div>
        <div class="text-dark-600 dark:text-dark-400">Total Donations</div>
      </div>
      
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-full mb-4">
          <TrendingUp class="w-8 h-8 text-accent-600" />
        </div>
        <div class="text-3xl font-bold text-dark-900 dark:text-white mb-2">
          {formatCurrency(stats.total_amount_raised)}
        </div>
        <div class="text-dark-600 dark:text-dark-400">Funds Raised</div>
      </div>
    </div>
  </div>
</section>

<!-- Featured Projects -->
<section class="section-padding py-16 bg-dark-50 dark:bg-dark-800">
  <div class="container-max">
    <div class="text-center mb-12">
      <h2 class="font-display text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
        Featured Projects
      </h2>
      <p class="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
        Discover impactful social projects that need your support
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each featuredProjects as project}
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
              <span class="text-sm text-dark-500 dark:text-dark-400">
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
    
    <div class="text-center mt-12">
      <a href="/projects" class="btn-outline inline-flex items-center space-x-2">
        <span>View All Projects</span>
        <ArrowRight class="w-5 h-5" />
      </a>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="section-padding py-16 bg-white dark:bg-dark-900">
  <div class="container-max">
    <div class="text-center mb-12">
      <h2 class="font-display text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
        Why Choose DonateAnon?
      </h2>
      <p class="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
        We make it easy and secure to support social causes
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6">
          <Shield class="w-8 h-8 text-primary-600" />
        </div>
        <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
          Anonymous & Secure
        </h3>
        <p class="text-dark-600 dark:text-dark-400">
          Your donations are completely anonymous. We don't store personal information or track your giving history.
        </p>
      </div>
      
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 dark:bg-secondary-900/30 rounded-full mb-6">
          <Target class="w-8 h-8 text-secondary-600" />
        </div>
        <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
          Verified Projects
        </h3>
        <p class="text-dark-600 dark:text-dark-400">
          All projects are carefully vetted and verified to ensure your donations reach legitimate social causes.
        </p>
      </div>
      
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-full mb-6">
          <Heart class="w-8 h-8 text-accent-600" />
        </div>
        <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
          Instant Impact
        </h3>
        <p class="text-dark-600 dark:text-dark-400">
          See the immediate impact of your donation with real-time progress tracking and project updates.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
