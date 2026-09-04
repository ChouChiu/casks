cask "micyou@2.0.2" do
  version "2.0.2"

  on_arm do
    url "https://github.com/LanRhyme/MicYou/releases/download/v#{version}/MicYou-macOS-#{version}-arm64.dmg"
    sha256 "14dcf1f841175894425960abb1c6bb89caa09a348148a2905f8133f8ce07dae4"
  end

  name "MicYou"
  desc "Turn your Android device into a high-quality microphone for your PC / 将你的 Android 设备变成 PC 的高品质麦克风"
  homepage "https://github.com/LanRhyme/MicYou"

  auto_updates true

  depends_on macos: :catalina

  app "MicYou.app"

  zap trash: [
    "~/Library/Application Support/com.lanrhyme.micyou",
    "~/Library/Preferences/com.lanrhyme.micyou.plist",
    "~/Library/Caches/com.lanrhyme.micyou",
    "~/Library/Saved Application State/com.lanrhyme.micyou.savedState",
  ]
end
