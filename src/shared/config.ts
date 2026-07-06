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
	hasPreRelease: boolean;
	minMacOS: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
	value: unknown,
	field: string,
	configPath: string,
): string {
	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`${configPath}: ${field} must be a non-empty string.`);
	}
	return value;
}

function validateConfig(raw: unknown, configPath: string): AppConfig {
	if (!isRecord(raw)) {
		throw new Error(`${configPath}: config must be a JSON object.`);
	}

	const repo = raw.repo;
	if (!isRecord(repo)) {
		throw new Error(`${configPath}: repo must be an object.`);
	}

	const dmgPatterns = raw.dmgPatterns;
	if (!isRecord(dmgPatterns)) {
		throw new Error(`${configPath}: dmgPatterns must be an object.`);
	}

	const archSupport = raw.archSupport;
	if (archSupport !== "single" && archSupport !== "dual") {
		throw new Error(`${configPath}: archSupport must be "single" or "dual".`);
	}

	if (typeof raw.hasPreRelease !== "boolean") {
		throw new Error(`${configPath}: hasPreRelease must be a boolean.`);
	}

	const config: AppConfig = {
		caskName: requireString(raw.caskName, "caskName", configPath),
		repo: {
			owner: requireString(repo.owner, "repo.owner", configPath),
			name: requireString(repo.name, "repo.name", configPath),
		},
		description: requireString(raw.description, "description", configPath),
		homepage: requireString(raw.homepage, "homepage", configPath),
		defaultAppName: requireString(
			raw.defaultAppName,
			"defaultAppName",
			configPath,
		),
		defaultBundleId: requireString(
			raw.defaultBundleId,
			"defaultBundleId",
			configPath,
		),
		archSupport,
		dmgPatterns: {},
		hasPreRelease: raw.hasPreRelease,
		minMacOS: requireString(raw.minMacOS, "minMacOS", configPath),
	};

	if (archSupport === "single") {
		config.dmgPatterns.single = requireString(
			dmgPatterns.single,
			"dmgPatterns.single",
			configPath,
		);
	} else {
		config.dmgPatterns.arm64 = requireString(
			dmgPatterns.arm64,
			"dmgPatterns.arm64",
			configPath,
		);
		config.dmgPatterns.x64 = requireString(
			dmgPatterns.x64,
			"dmgPatterns.x64",
			configPath,
		);
	}

	return config;
}

export function loadConfig(appName: string): AppConfig {
	const configPath = join("apps", `${appName}.json`);
	if (!existsSync(configPath)) {
		throw new Error(
			`App config not found: ${configPath}\nAvailable apps can be found in the apps/ directory.`,
		);
	}
	const raw = readFileSync(configPath, "utf-8");
	return validateConfig(JSON.parse(raw), configPath);
}

export function listAvailableApps(): string[] {
	const appsDir = "apps";
	if (!existsSync(appsDir)) return [];
	return readdirSync(appsDir)
		.filter((f: string) => f.endsWith(".json") && f !== "schema.json")
		.map((f: string) => f.replace(/\.json$/, ""));
}
