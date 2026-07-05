cask "micyou@alpha" do
  version :latest
  sha256 :no_check

  on_arm do
    url "https://github.com/LanRhyme/MicYou/releases/download/v2.0.0-alpha.1/MicYou-macOS-2.0.0-alpha.1-arm64.dmg"
  end

  on_intel do
    url "https://github.com/LanRhyme/MicYou/releases/download/v2.0.0-alpha.1/MicYou-macOS-2.0.0-alpha.1-x64.dmg"
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
