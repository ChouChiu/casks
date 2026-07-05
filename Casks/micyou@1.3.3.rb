cask "micyou@1.3.3" do
  version "1.3.3"

  on_arm do
    url "https://github.com/LanRhyme/MicYou/releases/download/v#{version}/MicYou-macOS-#{version}-arm64.dmg"
    sha256 "371872f4ac4baef5e31bb2be4c26b51795d26688aa6fb0b418267589808a7a33"
  end

  on_intel do
    url "https://github.com/LanRhyme/MicYou/releases/download/v#{version}/MicYou-macOS-#{version}-x64.dmg"
    sha256 "6ce5e968761c36e2b07425b7558e63ad2ce86c66f21fc307bbdb460155b01a61"
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
