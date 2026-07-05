import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Shared app config types and loader

export interface AppConfig {
	caskName: string;
	repo: {
		owner: string;
		name: string;
	};
	description: string;
	homepage: string;
	defaultAppName: string;
	defaultBundleId: string;
	archSupport: "single" | "dual";
	dmgPatterns: {
		single?: string;
		arm64?: string;
		x64?: string;
	};
	hasAlpha: boolean;
	minMacOS: string;
}

export function loadConfig(appName: string): AppConfig {
	const configPath = join("apps", `${appName}.json`);
	if (!existsSync(configPath)) {
		throw new Error(
			`App config not found: ${configPath}\nAvailable apps can be found in the apps/ directory.`,
		);
	}
	const raw = readFileSync(configPath, "utf-8");
	return JSON.parse(raw) as AppConfig;
}

export function listAvailableApps(): string[] {
	const appsDir = "apps";
	if (!existsSync(appsDir)) return [];
	return readdirSync(appsDir)
		.filter((f: string) => f.endsWith(".json"))
		.map((f: string) => f.replace(/\.json$/, ""));
}
