// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = async ({ url }: Parameters<PageLoad>[0]) => {
  // If accessing /admin directly, redirect to login if not authenticated
  // The layout will handle the authentication check
  return {};
};
