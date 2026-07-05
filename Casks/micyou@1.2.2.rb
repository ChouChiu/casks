cask "micyou@1.2.2" do
  version "1.2.2"

  on_arm do
    url "https://github.com/LanRhyme/MicYou/releases/download/v#{version}/MicYou-macOS-#{version}-arm64.dmg"
    sha256 "efe6257251d7b2544f896b293d73c28b312ddbecdbeeef7301e0eeb7de0827b2"
  end

  on_intel do
    url "https://github.com/LanRhyme/MicYou/releases/download/v#{version}/MicYou-macOS-#{version}-x64.dmg"
    sha256 "a383b184ea85ba13965db5cac759f7bb2384dff15854a600de73ad1c3d0c942a"
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
