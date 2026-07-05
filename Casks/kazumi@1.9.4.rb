cask "kazumi@1.9.4" do
  version "1.9.4"
  sha256 "65e74fbf144a6363685ec6a7510c584182f31ae23c07a1f2352a36e826a29bc2"

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
