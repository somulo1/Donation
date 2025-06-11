<script lang="ts">
  import { FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Terms of Service - DonateAnon</title>
  <meta name="description" content="Terms of service for DonateAnon anonymous donation platform" />
</svelte:head>

<div class="section-padding py-16">
  <div class="container-max max-w-4xl">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-6">
        <FileText class="w-8 h-8 text-white" />
      </div>
      <h1 class="font-display text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-4">
        Terms of Service
      </h1>
      <p class="text-xl text-dark-600 dark:text-dark-400">
        Please read these terms carefully before using our platform.
      </p>
    </div>

    <!-- Content -->
    <div class="prose prose-lg prose-dark dark:prose-invert max-w-none">
      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Agreement to Terms
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          By accessing and using DonateAnon, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        <p class="text-dark-600 dark:text-dark-400">
          If you do not agree to abide by the above, please do not use this service.
        </p>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Platform Purpose
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          DonateAnon is a platform that facilitates anonymous donations to verified social projects. Our mission is to:
        </p>
        <ul class="text-dark-600 dark:text-dark-400 space-y-2">
          <li>• Enable anonymous charitable giving</li>
          <li>• Support verified social impact projects</li>
          <li>• Provide transparent donation tracking</li>
          <li>• Ensure secure payment processing</li>
        </ul>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center space-x-3 mb-4">
            <CheckCircle class="w-6 h-6 text-green-600" />
            <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white">
              Your Rights
            </h3>
          </div>
          <ul class="text-dark-600 dark:text-dark-400 space-y-2">
            <li>• Make anonymous donations</li>
            <li>• Access platform features freely</li>
            <li>• Receive donation confirmations</li>
            <li>• Request data deletion</li>
          </ul>
        </div>

        <div class="card p-6">
          <div class="flex items-center space-x-3 mb-4">
            <AlertTriangle class="w-6 h-6 text-yellow-600" />
            <h3 class="font-display text-lg font-semibold text-dark-900 dark:text-white">
              Your Responsibilities
            </h3>
          </div>
          <ul class="text-dark-600 dark:text-dark-400 space-y-2">
            <li>• Provide accurate payment information</li>
            <li>• Use platform for legitimate purposes</li>
            <li>• Respect other users and projects</li>
            <li>• Comply with applicable laws</li>
          </ul>
        </div>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Donations and Payments
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          All donations are processed through Mpesa's secure payment system. Please note:
        </p>
        <ul class="text-dark-600 dark:text-dark-400 space-y-2 mb-4">
          <li>• Donations are final and non-refundable</li>
          <li>• Minimum donation amount is KES 10</li>
          <li>• Maximum donation amount is KES 1,000,000</li>
          <li>• Payment processing fees may apply</li>
        </ul>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p class="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Important:</strong> Ensure your donation details are correct before confirming payment. Donations cannot be reversed once processed.
          </p>
        </div>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Project Verification
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          We strive to verify all projects on our platform, but we cannot guarantee:
        </p>
        <ul class="text-dark-600 dark:text-dark-400 space-y-2">
          <li>• The success of any particular project</li>
          <li>• Specific outcomes or timelines</li>
          <li>• The use of funds beyond our verification process</li>
        </ul>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Limitation of Liability
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          DonateAnon acts as a facilitator between donors and projects. We are not liable for:
        </p>
        <ul class="text-dark-600 dark:text-dark-400 space-y-2">
          <li>• Project outcomes or failures</li>
          <li>• Misuse of donated funds by project organizers</li>
          <li>• Technical issues or service interruptions</li>
          <li>• Third-party payment processing issues</li>
        </ul>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Privacy and Data Protection
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          Your privacy is important to us. Please review our Privacy Policy for detailed information about how we collect, use, and protect your data.
        </p>
        <a href="/privacy" class="text-primary-600 hover:text-primary-700 font-medium">
          Read our Privacy Policy →
        </a>
      </div>

      <div class="card p-8">
        <h2 class="font-display text-2xl font-semibold text-dark-900 dark:text-white mb-4">
          Changes to Terms
        </h2>
        <p class="text-dark-600 dark:text-dark-400 mb-4">
          We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page.
        </p>
        <p class="text-dark-600 dark:text-dark-400">
          Continued use of the platform after changes constitutes acceptance of the new terms.
        </p>
      </div>
    </div>

    <!-- Contact and Back -->
    <div class="text-center mt-12 space-y-4">
      <p class="text-dark-600 dark:text-dark-400">
        Questions about these terms? Contact us at 
        <a href="mailto:legal@donateanon.com" class="text-primary-600 hover:text-primary-700 font-medium">
          legal@donateanon.com
        </a>
      </p>
      <div>
        <a href="/" class="btn-primary">
          Back to Home
        </a>
      </div>
    </div>
  </div>
</div>
