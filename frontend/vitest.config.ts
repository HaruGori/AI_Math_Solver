import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		include: ["**/*.test.{ts,tsx}"],
		exclude: ["node_modules", ".next"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary", "lcov"],
			include: [
				"app/**/*.{ts,tsx}",
				"components/**/*.{ts,tsx}",
				"hooks/**/*.{ts,tsx}",
				"lib/**/*.{ts,tsx}",
			],
			exclude: ["**/*.test.{ts,tsx}", "**/__tests__/**", "**/*.d.ts"],
			thresholds: {
				lines: 25,
				branches: 24,
				functions: 23,
				statements: 25,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
});
