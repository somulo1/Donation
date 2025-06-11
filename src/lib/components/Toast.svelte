<script lang="ts">
  import { toasts } from '$lib/stores';
  import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  };

  let visible = false;

  onMount(() => {
    // Trigger animation
    setTimeout(() => {
      visible = true;
    }, 10);
  });

  function removeToast() {
    visible = false;
    setTimeout(() => {
      toasts.remove(toast.id);
    }, 300);
  }

  $: iconComponent = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }[toast.type];

  $: colorClasses = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  }[toast.type];

  $: iconColorClasses = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  }[toast.type];
</script>

<div 
  class="fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out"
  class:translate-x-full={!visible}
  class:translate-x-0={visible}
  class:opacity-0={!visible}
  class:opacity-100={visible}
>
  <div class="border rounded-lg shadow-lg backdrop-blur-sm {colorClasses}">
    <div class="p-4">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svelte:component this={iconComponent} class="w-5 h-5 {iconColorClasses}" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">
            {toast.message}
          </p>
        </div>
        <button
          on:click={removeToast}
          class="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
          aria-label="Close notification"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</div>
