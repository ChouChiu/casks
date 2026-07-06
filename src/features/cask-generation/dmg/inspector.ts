import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AppConfig } from "../../../shared/config";
import type { AppMetadata } from "./types";

async function downloadDmg(url: string, dest: string): Promise<void> {
	console.log(`  Downloading DMG...`);
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Download failed: ${res.status} ${res.statusText}`);
	}
	const bytesWritten = await Bun.write(dest, res);
	console.log(`  Downloaded ${(bytesWritten / 1024 / 1024).toFixed(1)} MB`);
}

function mountDmg(dmgPath: string, mountPoint: string): void {
	mkdirSync(mountPoint, { recursive: true });

	const result = spawnSync(
		"hdiutil",
		["attach", "-nobrowse", "-readonly", "-mountpoint", mountPoint, dmgPath],
		{ encoding: "utf-8" },
	);

	if (result.status !== 0) {
		rmSync(mountPoint, { recursive: true, force: true });
		throw new Error(`hdiutil attach failed: ${result.stderr}`);
	}

	console.log(`  Mounted at ${mountPoint}`);
}

function unmountDmg(mountPoint: string): void {
	console.log(`  Unmounting...`);
	const result = spawnSync("hdiutil", ["detach", mountPoint], {
		encoding: "utf-8",
	});
	if (result.status === 0) return;

	const forceResult = spawnSync("hdiutil", ["detach", "-force", mountPoint], {
		encoding: "utf-8",
	});
	if (forceResult.status !== 0) {
		console.warn(
			`  hdiutil detach failed: ${forceResult.stderr || result.stderr}`,
		);
	}
}

function findApp(mountPoint: string): string {
	const queue: Array<{ path: string; depth: number }> = [
		{ path: mountPoint, depth: 0 },
	];

	for (const item of queue) {
		if (item.depth > 2) continue;

		for (const entry of readdirSync(item.path, { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;

			const entryPath = join(item.path, entry.name);
			if (entry.name.endsWith(".app")) {
				return entryPath;
			}
			queue.push({ path: entryPath, depth: item.depth + 1 });
		}
	}

	throw new Error(`No .app bundle found in ${mountPoint}`);
}

function readPlistValue(plistPath: string, key: string): string {
	const result = spawnSync(
		"/usr/libexec/PlistBuddy",
		["-c", `Print ${key}`, plistPath],
		{ encoding: "utf-8" },
	);
	if (result.status !== 0) {
		throw new Error(`PlistBuddy failed for ${key}: ${result.stderr}`);
	}
	return result.stdout.trim();
}

export async function inspectDMG(
	downloadUrl: string,
	config: AppConfig,
): Promise<AppMetadata> {
	const tmpDir = join(tmpdir(), `cask-dmg-${config.caskName}-${Date.now()}`);
	const dmgPath = join(tmpDir, `${config.caskName}.dmg`);
	const mountPoint = join(tmpDir, "mnt");

	try {
		mkdirSync(tmpDir, { recursive: true });
		await downloadDmg(downloadUrl, dmgPath);
		mountDmg(dmgPath, mountPoint);

		try {
			const appPath = findApp(mountPoint);
			const plistPath = join(appPath, "Contents", "Info.plist");

			if (!existsSync(plistPath)) {
				throw new Error(`Info.plist not found at ${plistPath}`);
			}

			const bundleId = readPlistValue(plistPath, "CFBundleIdentifier");
			const appName = readPlistValue(plistPath, "CFBundleName");

			console.log(`  bundleId: ${bundleId}`);
			console.log(`  appName: ${appName}`);

			return { appName, bundleId };
		} finally {
			unmountDmg(mountPoint);
		}
	} catch (err) {
		console.warn(
			`  DMG inspection failed: ${err instanceof Error ? err.message : err}`,
		);
		console.warn(`  Using fallback metadata.`);
		return {
			appName: config.defaultAppName,
			bundleId: config.defaultBundleId,
		};
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
}
