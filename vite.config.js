import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	define: {
		_version_: JSON.stringify(process.env.npm_package_version)
	}
};

export default config;
