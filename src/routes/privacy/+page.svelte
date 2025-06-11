<script lang="ts">
  import { Shield, Eye, Lock, Database } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Privacy Policy - DonateAnon</title>
  <meta name="description" content="Privacy policy for DonateAnon anonymous donation platform" />
</svelte:head>

<div class="section-padding py-16">
  <div class="container-max max-w-4xl">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-6">
        <Shield class="w-8 h-8 text-white" />
      </div>
      <h1 class="font-display text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-4">
        Privacy Policy
      </h1>
      <p class="text-xl text-dark-600 dark:text-dark-400">
        Your privacy is our priority. Learn how we protect your data.
      </p>
    </div>

    <!-- Content -->
    <div class="prose prose-lg prose-dark dark:prose-invert max-w-none">
      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Our Commitment to Privacy
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          DonateAnon is built on the principle of anonymous giving. We are committed to protecting your privacy and ensuring that your donations remain completely anonymous.
        </p>
        <p class="text-dark-600 dark:text-dark-400">
          This privacy policy explains how we collect, use, and protect your information when you use our platform.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center space-x-3 mb-4">
            <Eye class="w-6 h-6 text-primary-600" />
            <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white">
              What We Collect
            </h3>
          </div>
          <ul class="text-dark-600 dark:text-dark-400 space-y-2">
            <li>• Phone number (for Mpesa payments only)</li>
            <li>• Donation amount and project selection</li>
            <li>• Optional: Name and email (if you choose to provide)</li>
            <li>• Technical data: IP address, browser type</li>
          </ul>
        </div>

        <div class="card p-6">
          <div class="flex items-center space-x-3 mb-4">
            <Lock class="w-6 h-6 text-secondary-600" />
            <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white">
              How We Protect It
            </h3>
          </div>
          <ul class="text-dark-600 dark:text-dark-400 space-y-2">
            <li>• All data is encrypted in transit and at rest</li>
            <li>• No personal data is shared publicly</li>
            <li>• Secure payment processing via Mpesa</li>
            <li>• Regular security audits and updates</li>
          </ul>
        </div>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Anonymous Donations
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          By default, all donations are anonymous. We do not store or display personal information unless you explicitly choose to provide it.
        </p>
        <div class="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <p class="text-primary-800 dark:text-primary-200 text-sm">
            <strong>Note:</strong> Even if you provide your name, it will only be displayed as "Anonymous" unless you specifically opt-in to show your name publicly.
          </p>
        </div>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Data Usage
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          We use your information solely for:
        </p>
        <ul class="text-dark-600 dark:text-dark-400 space-y-2 mb-4">
          <li>• Processing donations through Mpesa</li>
          <li>• Sending donation confirmations (if email provided)</li>
          <li>• Platform analytics and improvements</li>
          <li>• Legal compliance and fraud prevention</li>
        </ul>
        <p class="text-dark-600 dark:text-dark-400">
          We never sell, rent, or share your personal information with third parties for marketing purposes.
        </p>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Your Rights
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          You have the right to:
        </p>
        <ul class="text-dark-600 dark:text-dark-400 space-y-2">
          <li>• Request deletion of your personal data</li>
          <li>• Access information we have about you</li>
          <li>• Correct any inaccurate information</li>
          <li>• Withdraw consent at any time</li>
          <li>• File a complaint with data protection authorities</li>
        </ul>
      </div>

      <div class="card p-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Contact Us
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          If you have any questions about this privacy policy or how we handle your data, please contact us:
        </p>
        <div class="bg-dark-50 dark:bg-dark-700 rounded-lg p-4">
          <p class="text-dark-900 dark:text-white">
            <strong>Email:</strong> privacy@donateanon.com<br>
            <strong>Address:</strong> Nairobi, Kenya
          </p>
        </div>
      </div>
    </div>

    <!-- Back to Home -->
    <div class="text-center mt-12">
      <a href="/" class="btn-primary">
        Back to Home
      </a>
    </div>
  </div>
</div>
