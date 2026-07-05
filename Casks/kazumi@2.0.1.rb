cask "kazumi@2.0.1" do
  version "2.0.1"
  sha256 "8baddf2b9ec25ce1f898c0b91333e98b1ca718b85551a695749446f237182d5a"

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
