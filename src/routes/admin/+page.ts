import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
  // If accessing /admin directly, redirect to login if not authenticated
  // The layout will handle the authentication check
  return {};
};
