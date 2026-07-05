cask "micyou@1.1.2-20260223-0254" do
  version "1.1.2-20260223-0254"

  on_arm do
    url "https://github.com/LanRhyme/MicYou/releases/download/v#{version}/MicYou-macOS-1.1.2-arm64.dmg"
    sha256 "880cce6d3745c28266900a210738ec73fb4e82373e7be31652f0c2bb091a9e6b"
  end

  on_intel do
    url "https://github.com/LanRhyme/MicYou/releases/download/v#{version}/MicYou-macOS-1.1.2-x64.dmg"
    sha256 "7bd809195156efd2578114c40b1f4cbe6e7676ddd56a8a1b6e6d0464fdbc8371"
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
