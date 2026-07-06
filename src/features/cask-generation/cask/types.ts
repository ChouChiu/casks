import type { AppMetadata } from "../dmg";
import type { MacOSRelease } from "../releases";

export interface CaskContext {
	release: MacOSRelease;
	metadata: AppMetadata;
	isLatest: boolean;
	channel?: "stable" | "preRelease";
}
