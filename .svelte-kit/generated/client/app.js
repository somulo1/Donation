export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/about": [4],
		"/admin": [5,[2]],
		"/admin/donations": [6,[2]],
		"/admin/login": [7,[2]],
		"/admin/projects": [8,[2]],
		"/admin/settings": [9,[2]],
		"/privacy": [10],
		"/projects": [11],
		"/projects/[id]": [12],
		"/terms": [13]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';