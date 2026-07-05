# AGENTS.md

Homebrew Cask Tap. TypeScript codegen that queries GitHub Releases, downloads DMGs, and generates `.rb` cask files for macOS apps.

## Runtime

- **Bun** runtime (not Node.js). `bun run`, `bun install`, `Bun.write()` etc.
- Package manager: `bun` (lockfile: `bun.lockb` at install time).

## Commands

```bash
bun install                # install deps
bun run generate           # incremental (skip existing versioned casks)
bun run generate --full    # full regeneration (overwrite all)
bun run generate --app <name>    # single app only
bun run generate --inspect-dmg   # download DMG, extract appName + bundleId (macOS only)
bun run lint               # biome check src
bun run format             # biome check src --write
```

No test command. No test framework configured.

## Architecture

```
apps/*.json       -> per-app config (cask name, repo, DMG patterns, min macOS)
src/index.ts      -> entrypoint, delegates to cask-generation CLI
src/features/cask-generation/
  cli/            -> CLI arg parsing + main orchestration (processApp)
  releases/       -> GitHub Releases API fetching + DMG asset matching
  dmg/            -> DMG download + hdiutil mount + PlistBuddy inspection
  cask/           -> .rb template rendering + file writing
src/shared/       -> config loader, semver utility
Casks/*.rb        -> generated output, committed to repo
```

## Cask output

- Versioned: `Casks/<name>@<semver>.rb` — pinned to a specific release with sha256
- Latest: `Casks/<name>.rb` — `version :latest, sha256 :no_check`
- Alpha: `Casks/<name>@alpha.rb` — latest pre-release (if `hasAlpha: true`)
- Dual-arch apps (MicYou) use `on_arm` / `on_intel` blocks; single-arch uses one URL

## DMG inspection

Only works on **macOS** (uses `hdiutil`, `/usr/libexec/PlistBuddy`). Falls back to `defaultAppName` / `defaultBundleId` from app config on error.

## Environment

- `GITHUB_TOKEN` — set in `.env` or env var to avoid API rate limits. CI uses `secrets.GITHUB_TOKEN`.
- `.env.example` exists; copy to `.env` locally.

## CI

`.github/workflows/update-casks.yml` — scheduled every 2 hours + manual dispatch. Runs on `macos-latest`. Commits changes to `Casks/` and pushes.

## Formatting

- Biome with `recommended` preset
- Indent: tabs, Quote style: double, Organize imports: on
- VCS integration enabled (respects `.gitignore`)

## Tap identity

Registered as `ChouChiu/casks`. Users install via:
```bash
brew tap ChouChiu/casks
brew trust ChouChiu/casks
brew install --cask <name>
```
