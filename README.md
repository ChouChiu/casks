# Casks

一个专注于收录开源软件的 Homebrew Tap

## 可用的 Cask

| Cask | 描述 | 仓库 |
|------|------|------|
| `micyou` | 将你的 Android 设备变成 PC 的高品质麦克风 | [LanRhyme/MicYou](https://github.com/LanRhyme/MicYou) |
| `kazumi` | 基于自定义规则的番剧采集与在线观看程序 | [Predidit/Kazumi](https://github.com/Predidit/Kazumi) |

## 使用方式

```bash
# 添加 tap
brew tap ChouChiu/casks

# 信任此 tap
brew trust ChouChiu/casks

# 安装 cask
brew install --cask micyou
brew install --cask kazumi
```

## 添加新应用

1. 在 `apps/<name>.json` 创建 JSON 配置：

```json
{
  "caskName": "myapp",
  "repo": { "owner": "owner", "name": "repo" },
  "description": "我的应用",
  "homepage": "https://github.com/owner/repo",
  "defaultAppName": "MyApp",
  "defaultBundleId": "com.example.myapp",
  "archSupport": "single",
  "dmgPatterns": { "single": "macos" },
  "hasPreRelease": false,
  "minMacOS": "catalina"
}
```

2. 运行生成器：

```bash
# 安装依赖
bun install

# 为所有应用生成 cask
bun run generate

# 为指定应用生成
bun run generate --app myapp

# 全量重新生成（覆盖所有版本化 cask）
bun run generate --full

# 从 DMG 中提取元数据（应用名、Bundle ID）
bun run generate --inspect-dmg
```

### 配置项说明

| 字段 | 说明 |
|-------|------|
| `caskName` | Cask 文件前缀（如 `micyou` → `micyou.rb`） |
| `repo.owner` | GitHub 仓库所有者 |
| `repo.name` | GitHub 仓库名 |
| `description` | 应用的描述文字 |
| `homepage` | 应用主页 URL |
| `defaultAppName` | 备用的 `.app` 名称（DMG 检查失败时使用） |
| `defaultBundleId` | 备用的 Bundle ID（DMG 检查失败时使用） |
| `archSupport` | `"single"`（每个版本一个 DMG）或 `"dual"`（arm64 + x64 两个 DMG） |
| `dmgPatterns` | 用于匹配 DMG 文件的正则表达式。`"single"` 时：`{ "single": "正则" }`，`"dual"` 时：`{ "arm64": "正则", "x64": "正则" }` |
| `hasPreRelease` | 仓库是否有 pre-release 版本 |
| `minMacOS` | 最低 macOS 版本要求 |

## 自动更新

GitHub Actions 工作流每 2 小时自动检查新版本并更新 cask 文件。你也可以在 Actions 页面手动触发。

## 许可证

MIT — 详见 [LICENSE](LICENSE)
