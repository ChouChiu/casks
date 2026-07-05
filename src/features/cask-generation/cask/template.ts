import type { AppConfig } from "../../../shared/config";
import type { CaskContext } from "./types";

function buildSingleArchURL(
	ctx: CaskContext,
	config: AppConfig,
	isLatest: boolean,
): string {
	const { release } = ctx;
	const { owner, name } = config.repo;

	if (isLatest) {
		return `  url "https://github.com/${owner}/${name}/releases/download/${release.tag_name}/${release.dmg_filename}",\n      verified: "github.com/${owner}/${name}/"`;
	}

	const dmgFilename = release.dmg_filename;
	const { semver } = release;
	if (!dmgFilename) {
		// Should not happen in practice: findMacOSAssets always sets both.
		return `  url "${release.dmg_url ?? ""}"`;
	}
	const escapedSemver = semver.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const urlFilename = dmgFilename.replace(
		new RegExp(escapedSemver, "g"),
		"#{version}",
	);
	const urlUsesInterpolation = urlFilename !== dmgFilename;

	if (urlUsesInterpolation) {
		return `  url "https://github.com/${owner}/${name}/releases/download/#{version}/${urlFilename}",\n      verified: "github.com/${owner}/${name}/"`;
	}

	return `  url "${release.dmg_url}"`;
}

function buildDualArchBlock(
	ctx: CaskContext,
	config: AppConfig,
	isLatest: boolean,
): string {
	const { release } = ctx;
	const { owner, name } = config.repo;
	const blocks: string[] = [];

	if (release.arm64) {
		const url = isLatest
			? `"https://github.com/${owner}/${name}/releases/download/${release.tag_name}/${release.arm64.filename}"`
			: `"https://github.com/${owner}/${name}/releases/download/v#{version}/${release.arm64.filename.replaceAll(release.semver, "#{version}")}"`;

		let block = "  on_arm do\n";
		block += `    url ${url}\n`;
		if (!isLatest && release.arm64.sha256) {
			block += `    sha256 "${release.arm64.sha256}"\n`;
		}
		block += "  end";
		blocks.push(block);
	}

	if (release.x64) {
		const url = isLatest
			? `"https://github.com/${owner}/${name}/releases/download/${release.tag_name}/${release.x64.filename}"`
			: `"https://github.com/${owner}/${name}/releases/download/v#{version}/${release.x64.filename.replaceAll(release.semver, "#{version}")}"`;

		let block = "  on_intel do\n";
		block += `    url ${url}\n`;
		if (!isLatest && release.x64.sha256) {
			block += `    sha256 "${release.x64.sha256}"\n`;
		}
		block += "  end";
		blocks.push(block);
	}

	return blocks.join("\n\n");
}

function buildVersioned(ctx: CaskContext, config: AppConfig): string {
	const { release, metadata } = ctx;
	const { appName, bundleId } = metadata;
	const caskName = `${config.caskName}@${release.semver}`;

	let urlBlock: string;
	let sha256Line = "";

	if (config.archSupport === "dual") {
		urlBlock = buildDualArchBlock(ctx, config, false);
	} else {
		urlBlock = buildSingleArchURL(ctx, config, false);
		sha256Line = `  sha256 "${release.sha256}"\n`;
	}

	const sep = config.archSupport === "dual" ? "\n\n" : "\n";

	return `cask "${caskName}" do
  version "${release.semver}"
${sha256Line}
${urlBlock}${sep}  name "${appName}"
  desc "${config.description}"
  homepage "${config.homepage}"

  auto_updates true

  depends_on macos: :${config.minMacOS}

  app "${appName}.app"

  zap trash: [
    "~/Library/Application Support/${bundleId}",
    "~/Library/Preferences/${bundleId}.plist",
    "~/Library/Caches/${bundleId}",
    "~/Library/Saved Application State/${bundleId}.savedState",
  ]
end
`;
}

function buildLatest(ctx: CaskContext, config: AppConfig): string {
	const { metadata } = ctx;
	const { appName, bundleId } = metadata;

	let caskName = config.caskName;
	if (ctx.channel === "alpha") {
		caskName = `${config.caskName}@alpha`;
	}

	let urlBlock: string;

	if (config.archSupport === "dual") {
		urlBlock = buildDualArchBlock(ctx, config, true);
	} else {
		urlBlock = buildSingleArchURL(ctx, config, true);
	}

	const sep = config.archSupport === "dual" ? "\n\n" : "\n";

	return `cask "${caskName}" do
  version :latest
  sha256 :no_check

${urlBlock}${sep}  name "${appName}"
  desc "${config.description}"
  homepage "${config.homepage}"

  auto_updates true

  depends_on macos: :${config.minMacOS}

  app "${appName}.app"

  zap trash: [
    "~/Library/Application Support/${bundleId}",
    "~/Library/Preferences/${bundleId}.plist",
    "~/Library/Caches/${bundleId}",
    "~/Library/Saved Application State/${bundleId}.savedState",
  ]
end
`;
}

export function buildCaskContent(ctx: CaskContext, config: AppConfig): string {
	return ctx.isLatest ? buildLatest(ctx, config) : buildVersioned(ctx, config);
}
