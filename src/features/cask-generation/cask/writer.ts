import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { AppConfig } from "../../../shared/config";
import type { GenerateMode } from "../cli/config";
import { buildCaskContent } from "./template";
import type { CaskContext } from "./types";

const CASKS_DIR = "Casks";

export function writeCask(
	ctx: CaskContext,
	config: AppConfig,
	mode: GenerateMode,
): boolean {
	mkdirSync(CASKS_DIR, { recursive: true });

	const { release, isLatest, channel } = ctx;
	const semver = release.semver;

	let filename: string;
	if (isLatest) {
		filename =
			channel === "preRelease"
				? `${config.caskName}@pre-release.rb`
				: `${config.caskName}.rb`;
	} else {
		filename = `${config.caskName}@${semver}.rb`;
	}

	const filepath = join(CASKS_DIR, filename);

	// In incremental mode, skip existing versioned casks. Latest casks always rewrite.
	if (mode === "incremental" && !isLatest && existsSync(filepath)) {
		return false; // skipped, already exists
	}

	const content = buildCaskContent(ctx, config);
	writeFileSync(filepath, content, "utf-8");
	return true; // written
}

export function getMetadataFromExistingCask(config: AppConfig): {
	appName?: string;
	bundleId?: string;
} | null {
	const dir = CASKS_DIR;
	if (!existsSync(dir)) return null;

	const caskName = config.caskName;

	// Try the latest cask first, then pre-release, then any versioned cask
	const tryFiles = [`${caskName}.rb`, `${caskName}@pre-release.rb`];

	// Add all versioned cask files
	const allFiles = readdirSync(dir);
	const versionedFiles = allFiles
		.filter(
			(f) =>
				f.startsWith(`${caskName}@`) &&
				f.endsWith(".rb") &&
				!f.includes("@pre-release"),
		)
		.sort()
		.reverse();

	const candidates = [...tryFiles, ...versionedFiles];

	for (const f of candidates) {
		const p = join(dir, f);
		if (existsSync(p)) {
			const content = readFileSync(p, "utf-8");
			const meta = extractMetadata(content);
			if (meta.appName && meta.bundleId) return meta;
		}
	}

	return null;
}

function extractMetadata(content: string): {
	appName?: string;
	bundleId?: string;
} {
	const appNameMatch = content.match(/name\s+"([^"]+)"/);
	const bundleIdMatch = content.match(/Application Support\/([^"]+)/);

	return {
		appName: appNameMatch ? appNameMatch[1] : undefined,
		bundleId: bundleIdMatch ? bundleIdMatch[1] : undefined,
	};
}
