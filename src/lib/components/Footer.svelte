<script lang="ts">
  import { Heart, Mail, Shield, MessageCircle, Facebook, Instagram } from 'lucide-svelte';
  import { siteSettings } from '$lib/stores';
  import { onMount } from 'svelte';

  // X (Twitter) icon component since it's not in lucide-svelte
  const XIcon = `<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>`;

  onMount(async () => {
    // Load site settings to get dynamic platform info
    await siteSettings.load();
  });
</script>

<footer class="bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-700">
  <div class="section-padding py-12">
    <div class="container-max">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start space-x-2 mb-4">
            <div class="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
              <Heart class="w-6 h-6 text-white" />
            </div>
            <span class="font-display font-bold text-xl gradient-text">
              <a href="/">{$siteSettings.platform_name || 'DonateAnon'}</a>
            </span>
          </div>
          <p class="text-dark-600 dark:text-dark-400 mb-4 max-w-md mx-auto md:mx-0">
            {$siteSettings.platform_description || 'Empowering communities through anonymous donations. Support social projects and make a difference without revealing your identity.'}
          </p>
          <div class="flex items-center justify-center md:justify-start">
            <a
              href="mailto:{$siteSettings.contact_email || 'support@donateanon.com'}"
              class="inline-flex items-center space-x-2 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              <Mail class="w-4 h-4" />
              <span class="text-sm">{$siteSettings.contact_email || 'support@donateanon.com'}</span>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="text-center md:text-left">
          <h3 class="font-display font-semibold text-dark-900 dark:text-white mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li>
              <a href="/" class="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                Home
              </a>
            </li>
            <li>
              <a href="/projects" class="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                All Projects
              </a>
            </li>
            <li>
              <a href="/about" class="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                About Us
              </a>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="text-center md:text-left">
          <h3 class="font-display font-semibold text-dark-900 dark:text-white mb-4">Legal & Security</h3>
          <ul class="space-y-2">
            <li>
              <a href="/privacy" class="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" class="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                Terms of Service
              </a>
            </li>
            <li>
              <div class="flex items-center justify-center md:justify-start space-x-2">
                <Shield class="w-4 h-4 text-primary-600" />
                <span class="text-dark-600 dark:text-dark-400 text-sm">Secure Payments</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Follow Us -->
        <div class="text-center md:text-left">
          <h3 class="font-display font-semibold text-dark-900 dark:text-white mb-4">Follow Us</h3>
          <div class="flex items-center justify-center md:justify-start space-x-3">
            <a
              href="https://twitter.com/donateanon"
              class="p-2 bg-dark-200 dark:bg-dark-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors duration-200"
              aria-label="Follow us on X (Twitter)"
            >
              {@html XIcon}
            </a>
            <a
              href="https://facebook.com/donateanon"
              class="p-2 bg-dark-200 dark:bg-dark-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors duration-200"
              aria-label="Follow us on Facebook"
            >
              <Facebook class="w-5 h-5 text-dark-600 dark:text-dark-400" />
            </a>
            <a
              href="https://instagram.com/donateanon"
              class="p-2 bg-dark-200 dark:bg-dark-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors duration-200"
              aria-label="Follow us on Instagram"
            >
              <Instagram class="w-5 h-5 text-dark-600 dark:text-dark-400" />
            </a>
          </div>
          <p class="text-xs text-dark-500 dark:text-dark-400 mt-3">
            Stay connected for updates and impact stories
          </p>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-dark-200 dark:border-dark-700 mt-8 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-dark-500 dark:text-dark-500 text-sm">
            © 2025 {$siteSettings.platform_name || 'DonateAnon'}. All rights reserved. Built with ❤️ for social impact.
          </p>
          <div class="flex items-center space-x-4 text-sm text-dark-500 dark:text-dark-500">
            <span>•</span>
            <span>Made by <a href="https://github.com/somulo1">Samuel omulo</a></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>
