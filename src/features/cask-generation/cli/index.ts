import {
	type AppConfig,
	listAvailableApps,
	loadConfig,
} from "../../../shared/config";
import { getMetadataFromExistingCask, writeCask } from "../cask";
import type { AppMetadata } from "../dmg";
import { inspectDMG } from "../dmg";
import type { MacOSRelease } from "../releases";
import { fetchAllReleases } from "../releases";
import { parseArgs } from "./config";

async function resolveMetadata(
	releases: MacOSRelease[],
	config: AppConfig,
	inspectDmg: boolean,
): Promise<AppMetadata> {
	const existing = getMetadataFromExistingCask(config);
	if (existing?.appName && existing?.bundleId && !inspectDmg) {
		console.log(
			`Using metadata from existing cask: ${existing.appName} (${existing.bundleId})`,
		);
		return {
			appName: existing.appName,
			bundleId: existing.bundleId,
		};
	}

	console.log("Inspecting latest DMG for metadata...");

	if (config.archSupport === "dual") {
		// Prefer arm64 for inspection
		const candidate = releases.find((r) => r.arm64);
		if (!candidate) {
			console.warn("No release with arm64 DMG found, trying x64...");
			const x64Candidate = releases.find((r) => r.x64);
			if (!x64Candidate) {
				console.warn("No releases found, using fallback metadata.");
				return {
					appName: config.defaultAppName,
					bundleId: config.defaultBundleId,
				};
			}
			return await inspectDMG(x64Candidate.x64?.url, config);
		}
		return await inspectDMG(candidate.arm64?.url, config);
	}

	// Single-arch
	const latest = releases[0];
	if (!latest) {
		console.warn("No releases found, using fallback metadata.");
		return {
			appName: config.defaultAppName,
			bundleId: config.defaultBundleId,
		};
	}
	if (!latest.dmg_url) {
		console.warn("No DMG URL in latest release, using fallback metadata.");
		return {
			appName: config.defaultAppName,
			bundleId: config.defaultBundleId,
		};
	}
	return await inspectDMG(latest.dmg_url, config);
}

function splitChannels(releases: MacOSRelease[]): {
	stable: MacOSRelease[];
	preRelease: MacOSRelease[];
} {
	const stable: MacOSRelease[] = [];
	const preRelease: MacOSRelease[] = [];

	for (const r of releases) {
		if (r.prerelease) {
			preRelease.push(r);
		} else {
			stable.push(r);
		}
	}

	return { stable, preRelease };
}

async function processApp(
	config: AppConfig,
	inspectDmg: boolean,
	mode: "full" | "incremental",
	token?: string,
): Promise<void> {
	console.log(`\n${"=".repeat(60)}`);
	console.log(`Processing: ${config.caskName}`);
	console.log(`Repo: ${config.repo.owner}/${config.repo.name}`);
	console.log(`Arch: ${config.archSupport}`);
	console.log(`Pre-release channel: ${config.hasPreRelease}`);
	console.log(`${"=".repeat(60)}\n`);

	console.log("Fetching releases from GitHub API...");
	const releases = await fetchAllReleases(config, token);
	console.log(`Fetched ${releases.length} macOS releases.\n`);

	let allReleases: MacOSRelease[];
	let preRelease: MacOSRelease[] = [];

	if (config.hasPreRelease) {
		const split = splitChannels(releases);
		allReleases = split.stable;
		preRelease = split.preRelease;
		console.log(`Stable releases: ${allReleases.length}`);
		console.log(`Pre-releases: ${preRelease.length}\n`);
	} else {
		allReleases = releases.filter((r) => !r.prerelease);
		console.log(`Releases: ${allReleases.length}\n`);
	}

	const latestStable = allReleases[0];
	const latestPreRelease = preRelease[0];

	if (!latestStable && !latestPreRelease) {
		console.log("No macOS releases found. Nothing to do.");
		return;
	}

	const metadata = await resolveMetadata(releases, config, inspectDmg);
	console.log();

	let written = 0;
	let skipped = 0;

	// Write versioned casks for stable releases
	for (const release of allReleases) {
		const wasWritten = writeCask(
			{ release, metadata, isLatest: false, channel: "stable" },
			config,
			mode,
		);

		if (wasWritten) {
			written++;
			console.log(`  Wrote ${config.caskName}@${release.semver}.rb`);
		} else {
			skipped++;
		}
	}

	// Write versioned casks for pre-release releases
	for (const release of preRelease) {
		const wasWritten = writeCask(
			{ release, metadata, isLatest: false, channel: "preRelease" },
			config,
			mode,
		);

		if (wasWritten) {
			written++;
			console.log(`  Wrote ${config.caskName}@${release.semver}.rb`);
		} else {
			skipped++;
		}
	}

	// Always rewrite latest stable cask
	if (latestStable) {
		writeCask(
			{ release: latestStable, metadata, isLatest: true, channel: "stable" },
			config,
			"full",
		);
		written++;
		console.log(`  Wrote ${config.caskName}.rb (latest stable)`);
	}

	// Always rewrite latest pre-release cask
	if (config.hasPreRelease && latestPreRelease) {
		writeCask(
			{
				release: latestPreRelease,
				metadata,
				isLatest: true,
				channel: "preRelease",
			},
			config,
			"full",
		);
		written++;
		console.log(
			`  Wrote ${config.caskName}@pre-release.rb (latest pre-release)`,
		);
	}

	console.log();
	console.log(
		`Done. Written: ${written}, Skipped: ${skipped}, ` +
			`Stable: ${allReleases.length}, Pre-release: ${preRelease.length}`,
	);
}

export async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const config = parseArgs(args);

	console.log(`Mode: ${config.mode}`);
	console.log(`Inspect DMG: ${config.inspectDmg}`);
	console.log(`GITHUB_TOKEN: ${config.token ? "set" : "not set"}`);

	// Determine which apps to process
	const appsToProcess: string[] = [];

	if (config.appName) {
		appsToProcess.push(config.appName);
	} else {
		const available = listAvailableApps();
		if (available.length === 0) {
			console.error("No app configs found in apps/ directory.");
			process.exit(1);
		}
		appsToProcess.push(...available);
	}

	console.log(`Apps to process: ${appsToProcess.join(", ")}`);
	console.log();

	for (const appName of appsToProcess) {
		const appConfig = loadConfig(appName);
		await processApp(appConfig, config.inspectDmg, config.mode, config.token);
	}
}
