cask "kazumi@1.8.3" do
  version "1.8.3"
  sha256 "59eadee6430ed20664565074d2a3fb3ce582461f10b6a4aa98f5f84dece02488"

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
