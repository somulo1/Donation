import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Theme store
function createThemeStore() {
  const { subscribe, set, update } = writable<'light' | 'dark'>('dark');

  return {
    subscribe,
    toggle: () => update(theme => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      if (browser) {
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
      return newTheme;
    }),
    init: () => {
      if (browser) {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored || (prefersDark ? 'dark' : 'light');
        
        set(theme as 'light' | 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    }
  };
}

export const theme = createThemeStore();

// Loading store
export const loading = writable(false);

// Toast notifications store
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    add: (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { ...toast, id };
      
      update(toasts => [...toasts, newToast]);
      
      // Auto remove after duration
      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id));
      }, toast.duration || 5000);
      
      return id;
    },
    remove: (id: string) => {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    clear: () => {
      update(() => []);
    }
  };
}

export const toasts = createToastStore();

// Donation form store
export const donationForm = writable({
  project_id: 0,
  amount: 0,
  donor_name: '',
  donor_email: '',
  phone_number: ''
});

// Admin authentication store
function createAdminAuthStore() {
  const { subscribe, set, update } = writable({
    isAuthenticated: false,
    user: null as any,
    loading: false
  });

  return {
    subscribe,
    login: async (username: string, password: string) => {
      update(state => ({ ...state, loading: true }));

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
          const authData = {
            isAuthenticated: true,
            user: result.user,
            loading: false
          };

          set(authData);

          // Store in localStorage for persistence
          if (browser) {
            localStorage.setItem('adminAuth', JSON.stringify(authData));
          }

          return { success: true };
        } else {
          update(state => ({ ...state, loading: false }));
          return { success: false, error: result.error || 'Login failed' };
        }
      } catch (error) {
        update(state => ({ ...state, loading: false }));
        return { success: false, error: 'Network error' };
      }
    },
    logout: () => {
      set({
        isAuthenticated: false,
        user: null,
        loading: false
      });

      if (browser) {
        localStorage.removeItem('adminAuth');
      }
    },
    checkAuth: () => {
      if (browser) {
        const stored = localStorage.getItem('adminAuth');
        if (stored) {
          try {
            const authData = JSON.parse(stored);
            if (authData.isAuthenticated && authData.user) {
              set(authData);
              return true;
            }
          } catch (error) {
            localStorage.removeItem('adminAuth');
          }
        }
      }
      return false;
    }
  };
}

export const adminAuth = createAdminAuthStore();

// Site settings store
function createSiteSettingsStore() {
  const { subscribe, set, update } = writable({
    platform_name: 'DonateAnon',
    platform_description: 'Anonymous donation platform for social projects',
    contact_email: 'admin@donateanon.com',
    mpesa_business_code: '174379',
    mpesa_environment: 'sandbox',
    enable_notifications: true,
    auto_approve_projects: false,
    minimum_donation: 10,
    maximum_donation: 1000000,
    featured_projects_limit: 3,
    loaded: false
  });

  return {
    subscribe,
    load: async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const result = await response.json();

        if (result.success) {
          update(state => ({ ...state, ...result.settings, loaded: true }));
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      }
    },
    save: async (settings: any) => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ settings })
        });

        const result = await response.json();

        if (result.success) {
          update(state => ({ ...state, ...settings }));
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    },
    reset: async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
          // Reload settings after reset
          await siteSettings.load();
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    }
  };
}

export const siteSettings = createSiteSettingsStore();
