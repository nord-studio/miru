// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
	integrations: [
		starlight({
			title: "Iris",
			social: {
				github: "https://github.com/nord-studio/iris",
			},
			sidebar: [],
		}),
	],
});
