export type GenerateMode = "full" | "incremental";

export interface RuntimeConfig {
	mode: GenerateMode;
	inspectDmg: boolean;
	token?: string;
	appName?: string;
}

export function parseArgs(args: string[]): RuntimeConfig {
	const mode = args.includes("--full") ? "full" : "incremental";
	const inspectDmg = args.includes("--inspect-dmg");
	const token = process.env.GITHUB_TOKEN;

	// Parse --app <name> or the first non-flag argument as app name
	const appFlagIdx = args.indexOf("--app");
	const appName =
		appFlagIdx !== -1 && appFlagIdx + 1 < args.length
			? args[appFlagIdx + 1]
			: undefined;

	return { mode, inspectDmg, token, appName };
}
