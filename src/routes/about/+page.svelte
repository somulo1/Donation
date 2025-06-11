<script lang="ts">
  import { Heart, Shield, Target, Users, CheckCircle, Globe } from 'lucide-svelte';
</script>

<svelte:head>
  <title>About Us - DonateAnon</title>
  <meta name="description" content="Learn about DonateAnon's mission to enable anonymous donations for social projects. Secure, transparent, and impactful giving." />
</svelte:head>

<!-- Hero Section -->
<section class="section-padding py-16 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800">
  <div class="container-max">
    <div class="text-center max-w-3xl mx-auto">
      <div class="inline-flex items-center space-x-2 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary-200 dark:border-primary-800">
        <Heart class="w-5 h-5 text-primary-600" />
        <span class="text-sm font-medium text-primary-700 dark:text-primary-300">About DonateAnon</span>
      </div>
      
      <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-6">
        Empowering
        <span class="gradient-text">Anonymous Giving</span>
      </h1>
      
      <p class="text-xl md:text-2xl text-dark-600 dark:text-dark-300 leading-relaxed">
        We believe that the desire to help should never be hindered by privacy concerns. DonateAnon enables you to support social causes while maintaining complete anonymity.
      </p>
    </div>
  </div>
</section>

<!-- Mission Section -->
<section class="section-padding py-16 bg-white dark:bg-dark-900">
  <div class="container-max">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="font-display text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-6">
          Our Mission
        </h2>
        <p class="text-lg text-dark-600 dark:text-dark-400 mb-6 leading-relaxed">
          To create a platform where generosity knows no boundaries. We remove the barriers that prevent people from giving by ensuring complete anonymity while maintaining transparency in how donations are used.
        </p>
        <p class="text-lg text-dark-600 dark:text-dark-400 mb-8 leading-relaxed">
          Every donation, no matter the size, contributes to meaningful change in communities across Kenya and beyond.
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="/projects" class="btn-primary inline-flex items-center justify-center space-x-2">
            <span>Start Donating</span>
            <Heart class="w-5 h-5" />
          </a>
          <a href="#values" class="btn-outline">
            Learn Our Values
          </a>
        </div>
      </div>
      <div class="relative">
        <div class="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600" 
            alt="Community helping hands"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div class="absolute -bottom-6 -right-6 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-dark-200 dark:border-dark-700">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600 mb-1">100%</div>
            <div class="text-sm text-dark-600 dark:text-dark-400">Anonymous</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Values Section -->
<section id="values" class="section-padding py-16 bg-dark-50 dark:bg-dark-800">
  <div class="container-max">
    <div class="text-center mb-12">
      <h2 class="font-display text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
        Our Core Values
      </h2>
      <p class="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
        The principles that guide everything we do
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Privacy -->
      <div class="card text-center">
        <div class="p-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6">
            <Shield class="w-8 h-8 text-primary-600" />
          </div>
          <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
            Privacy First
          </h3>
          <p class="text-dark-600 dark:text-dark-400">
            Your identity remains completely anonymous. We don't track, store, or share personal information beyond what's necessary for payment processing.
          </p>
        </div>
      </div>

      <!-- Transparency -->
      <div class="card text-center">
        <div class="p-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 dark:bg-secondary-900/30 rounded-full mb-6">
            <Target class="w-8 h-8 text-secondary-600" />
          </div>
          <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
            Full Transparency
          </h3>
          <p class="text-dark-600 dark:text-dark-400">
            Every project is verified and tracked. You can see exactly how donations are being used and the impact they're making in real-time.
          </p>
        </div>
      </div>

      <!-- Community -->
      <div class="card text-center">
        <div class="p-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-full mb-6">
            <Users class="w-8 h-8 text-accent-600" />
          </div>
          <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
            Community Impact
          </h3>
          <p class="text-dark-600 dark:text-dark-400">
            We focus on projects that create lasting positive change in communities, ensuring every donation contributes to meaningful social impact.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- How It Works -->
<section class="section-padding py-16 bg-white dark:bg-dark-900">
  <div class="container-max">
    <div class="text-center mb-12">
      <h2 class="font-display text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
        How It Works
      </h2>
      <p class="text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
        Simple, secure, and anonymous giving in three easy steps
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Step 1 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mb-6">
          1
        </div>
        <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
          Choose a Project
        </h3>
        <p class="text-dark-600 dark:text-dark-400">
          Browse our verified social projects and select one that resonates with your values and interests.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-secondary-600 text-white rounded-full text-xl font-bold mb-6">
          2
        </div>
        <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
          Make Your Donation
        </h3>
        <p class="text-dark-600 dark:text-dark-400">
          Enter your donation amount and phone number. Choose to remain anonymous or share your name with the project.
        </p>
      </div>

      <!-- Step 3 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-accent-600 text-white rounded-full text-xl font-bold mb-6">
          3
        </div>
        <h3 class="font-display text-xl font-semibold text-dark-900 dark:text-white mb-4">
          See the Impact
        </h3>
        <p class="text-dark-600 dark:text-dark-400">
          Track the project's progress and see how your contribution is making a real difference in the community.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="section-padding py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
  <div class="container-max text-center">
    <h2 class="font-display text-3xl md:text-4xl font-bold text-white mb-4">
      Ready to Make a Difference?
    </h2>
    <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
      Join thousands of anonymous donors who are creating positive change in communities across Kenya.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/projects" class="bg-white text-primary-600 hover:bg-primary-50 font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        Browse Projects
      </a>
      <a href="/terms" class="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-all duration-200">
        Read Our Terms
      </a>
    </div>
  </div>
</section>
