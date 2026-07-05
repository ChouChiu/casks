cask "kazumi@2.1.3" do
  version "2.1.3"
  sha256 "5fe092af414049c7e82a7f84fa6a2c1370cecb47601cc9559fd85b24c7fe7e6a"

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
