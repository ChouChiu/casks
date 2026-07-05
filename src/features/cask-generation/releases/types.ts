export interface DMGAsset {
	url: string;
	filename: string;
	sha256: string;
}

export interface MacOSRelease {
	tag_name: string;
	semver: string;
	prerelease: boolean;
	published_at: string;
	// Single-arch apps (e.g. Kazumi)
	dmg_url?: string;
	dmg_filename?: string;
	sha256?: string;
	// Dual-arch apps (e.g. MicYou)
	arm64?: DMGAsset | null;
	x64?: DMGAsset | null;
}

export interface GitHubAsset {
	name: string;
	browser_download_url: string;
	digest: string;
	content_type: string;
}

export interface GitHubRelease {
	tag_name: string;
	name: string;
	prerelease: boolean;
	draft: boolean;
	published_at: string;
	assets: GitHubAsset[];
}
