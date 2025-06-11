import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // This ensures the page loads properly within the admin layout
  return {};
};
