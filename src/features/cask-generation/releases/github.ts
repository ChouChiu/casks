import { compare } from "semver";
import type { AppConfig } from "../../../shared/config";
import { parseSemver } from "../../../shared/version";
import type { DMGAsset, GitHubRelease, MacOSRelease } from "./types";

function extractSemver(tag: string): string {
	const cleaned = tag.startsWith("v") ? tag.slice(1) : tag;
	const parsed = parseSemver(cleaned);
	return parsed ?? cleaned;
}

function extractDMGAsset(asset: GitHubRelease["assets"][0]): DMGAsset | null {
	if (!asset.digest) return null;
	const sha256 = asset.digest.replace(/^sha256:/, "");
	return {
		url: asset.browser_download_url,
		filename: asset.name,
		sha256,
	};
}

function findMacOSAssets(
	release: GitHubRelease,
	config: AppConfig,
): MacOSRelease | null {
	const semver = extractSemver(release.tag_name);

	if (config.archSupport === "dual") {
		const arm64Str = config.dmgPatterns.arm64;
		const x64Str = config.dmgPatterns.x64;
		if (!arm64Str || !x64Str) return null;

		const arm64Pattern = new RegExp(arm64Str, "i");
		const x64Pattern = new RegExp(x64Str, "i");

		const arm64Asset = release.assets.find((a) => arm64Pattern.test(a.name));
		const x64Asset = release.assets.find((a) => x64Pattern.test(a.name));

		const arm64 = arm64Asset ? extractDMGAsset(arm64Asset) : null;
		const x64 = x64Asset ? extractDMGAsset(x64Asset) : null;

		if (!arm64 && !x64) return null;

		return {
			tag_name: release.tag_name,
			semver,
			prerelease: release.prerelease,
			published_at: release.published_at,
			arm64,
			x64,
		};
	}

	// Single-arch
	const singleStr = config.dmgPatterns.single;
	if (!singleStr) return null;

	const dmgPattern = new RegExp(singleStr, "i");
	const dmgAsset = release.assets.find(
		(a) => dmgPattern.test(a.name) && a.name.endsWith(".dmg"),
	);

	if (!dmgAsset?.digest) return null;

	const sha256 = dmgAsset.digest.replace(/^sha256:/, "");

	return {
		tag_name: release.tag_name,
		semver,
		prerelease: release.prerelease,
		published_at: release.published_at,
		dmg_url: dmgAsset.browser_download_url,
		dmg_filename: dmgAsset.name,
		sha256,
	};
}

function parseLinkHeader(header: string | null): string | null {
	if (!header) return null;

	const links = header.split(",");
	for (const link of links) {
		const [urlPart, relPart] = link.split(";").map((s) => s.trim());
		if (relPart === 'rel="next"' || relPart === "rel='next'") {
			return urlPart.slice(1, -1);
		}
	}
	return null;
}

export async function fetchAllReleases(
	config: AppConfig,
	token?: string,
): Promise<MacOSRelease[]> {
	const apiBase = `https://api.github.com/repos/${config.repo.owner}/${config.repo.name}/releases`;

	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"User-Agent": `homebrew-casks-${config.caskName}-generator`,
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const allReleases: MacOSRelease[] = [];
	let nextUrl: string | null = `${apiBase}?per_page=100`;
	let page = 0;

	while (nextUrl) {
		page++;
		console.log(`  Fetching page ${page}...`);

		const res = await fetch(nextUrl, { headers });

		if (res.status === 403) {
			throw new Error(
				`GitHub API rate limit exceeded. Set GITHUB_TOKEN in .env or environment to increase limit.\n` +
					`Create one at: https://github.com/settings/tokens`,
			);
		}

		if (!res.ok) {
			throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
		}

		const releases: GitHubRelease[] = await res.json();

		for (const release of releases) {
			if (release.draft) continue;
			const macOS = findMacOSAssets(release, config);
			if (macOS) {
				allReleases.push(macOS);
			}
		}

		nextUrl = parseLinkHeader(res.headers.get("Link"));
	}

	console.log(`  Total macOS releases found: ${allReleases.length}`);

	allReleases.sort((a, b) => compare(b.semver, a.semver));

	return allReleases;
}
