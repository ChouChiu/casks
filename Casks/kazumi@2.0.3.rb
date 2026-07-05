cask "kazumi@2.0.3" do
  version "2.0.3"
  sha256 "b3374012c99895791bd691330f3f95d5f9313d42fa6a3d76400aeebddef7931f"

  url "https://github.com/Predidit/Kazumi/releases/download/#{version}/Kazumi_macos_#{version}.dmg",
      verified: "github.com/Predidit/Kazumi/"
  name "Kazumi"
  desc "基于自定义规则的番剧采集与在线观看程序"
  homepage "https://github.com/Predidit/Kazumi"

  auto_updates true

  depends_on macos: :catalina

  app "Kazumi.app"

  zap trash: [
    "~/Library/Application Support/com.example.kazumi",
    "~/Library/Preferences/com.example.kazumi.plist",
    "~/Library/Caches/com.example.kazumi",
    "~/Library/Saved Application State/com.example.kazumi.savedState",
  ]
end
