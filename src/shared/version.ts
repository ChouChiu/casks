import { coerce, valid } from "semver";

export function parseSemver(raw: string): ReturnType<typeof valid> | undefined {
	const version = valid(raw);
	if (version) return version;

	const coerced = coerce(raw);
	return coerced ? coerced.version : undefined;
}
