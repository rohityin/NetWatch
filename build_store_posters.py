import subprocess
import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CHROME_PATH = r"C:\Users\waghi\AppData\Local\Google\Chrome\Application\chrome.exe"
FFMPEG_PATH = r"C:\Users\waghi\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
BASE_DIR = r"D:\Hackathon Projects\NetWatch"

SCREENS_DIR = os.path.join(BASE_DIR, "store_screens")
POSTERS_DIR = os.path.join(BASE_DIR, "store_posters")
os.makedirs(SCREENS_DIR, exist_ok=True)
os.makedirs(POSTERS_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. GENERATE DEDICATED PREVIEW HTML FILES
# -------------------------------------------------------------

# --- Screen 1: Parent Command Center ---
with open(os.path.join(BASE_DIR, "popup.html"), "r", encoding="utf-8") as f:
    h1 = f.read()

h1 = h1.replace('id="parentView" class="hidden"', 'id="parentView"')
h1 = h1.replace('id="parentDashboardSection" class="hidden"', 'id="parentDashboardSection"')
h1 = h1.replace('id="headerRoleTag" class="role-pill">GUARD', 'id="headerRoleTag" class="role-pill parent">PARENT')
h1 = h1.replace('id="statusBadgeText">SHIELD ACTIVE', 'id="statusBadgeText">COMMAND CENTER')
h1 = h1.replace('<span id="parentActiveDeviceName">No Device Linked</span>', '<span id="parentActiveDeviceName">Child\'s Laptop [CH-W687P]</span>')
h1 = h1.replace('id="parentDeviceOnlineDot" class="status-dot" style="display: none;', 'id="parentDeviceOnlineDot" class="status-dot" style="display: inline-block;')
h1 = h1.replace('<span id="parentScoreValue" class="score-big">100</span>', '<span id="parentScoreValue" class="score-big">78</span>')
h1 = h1.replace('<div id="parentScoreBar" class="score-bar-fill" style="width: 100%;"></div>', '<div id="parentScoreBar" class="score-bar-fill" style="width: 78%; background-color: var(--color-terracotta);"></div>')
h1 = h1.replace('<span id="parentCntCompanions" class="stat-badge terracotta">0</span>', '<span id="parentCntCompanions" class="stat-badge terracotta">4</span>')
h1 = h1.replace('<span id="parentCntPii" class="stat-badge sage">0</span>', '<span id="parentCntPii" class="stat-badge sage">2</span>')
h1 = h1.replace('<span id="parentCntDeepfakes" class="stat-badge neutral">0</span>', '<span id="parentCntDeepfakes" class="stat-badge neutral">0</span>')
h1 = h1.replace('<div id="parentBlacklistChipsContainer" class="chips-cloud"></div>', '''<div id="parentBlacklistChipsContainer" class="chips-cloud">
  <span class="chip-tag"><span>omegle.com</span><button type="button" class="chip-remove-btn">×</button></span>
  <span class="chip-tag"><span>crushon.ai</span><button type="button" class="chip-remove-btn">×</button></span>
  <span class="chip-tag"><span>character.ai</span><button type="button" class="chip-remove-btn">×</button></span>
</div>''')
h1 = h1.replace('<div class="empty-alert-notice">No threat incidents reported yet. Child browsing is safe.</div>', '''
  <div class="alert-entry critical">
    <span class="alert-label" title="Companion chat intercepted">🤖 Companion: crushon.ai/chat-room</span>
    <span class="alert-timestamp">12:14:02</span>
  </div>
  <div class="alert-entry critical">
    <span class="alert-label" title="Prompt leak prevented">🔒 PII Shield: Intercepted phone number</span>
    <span class="alert-timestamp">11:42:19</span>
  </div>
  <div class="alert-entry">
    <span class="alert-label" title="Adult site paused">🔞 Adult/NSFW: Intercepted explicit domain</span>
    <span class="alert-timestamp">09:18:45</span>
  </div>''')

css_popup = """
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 400px !important;
  background-color: #ECE7DF !important;
  overflow: hidden !important;
}
.app-container {
  width: 400px !important;
  margin: 0 !important;
  border-radius: 16px !important;
  box-shadow: none !important;
}
"""
h1 = h1.replace('</head>', f'<style>{css_popup}</style></head>')
with open(os.path.join(BASE_DIR, "preview_01.html"), "w", encoding="utf-8") as f:
    f.write(h1)


# --- Screen 2: Child Protection Shield ---
with open(os.path.join(BASE_DIR, "popup.html"), "r", encoding="utf-8") as f:
    h2 = f.read()

h2 = h2.replace('id="childView" class="hidden"', 'id="childView"')
h2 = h2.replace('id="childPairingSection"', 'id="childPairingSection" class="hidden"')
h2 = h2.replace('id="childLinkedSection" class="hidden"', 'id="childLinkedSection"')
h2 = h2.replace('id="childLinkTag" class="bento-tag">DEVICE LINK', 'id="childLinkTag" class="bento-tag" style="background-color: var(--color-sage-light); color: var(--color-sage); border-color: var(--color-sage-border);">LINKED')
h2 = h2.replace('id="headerRoleTag" class="role-pill">GUARD', 'id="headerRoleTag" class="role-pill child">CHILD')
h2 = h2.replace('<button id="parentPushPolicyBtn"', '<button id="parentPushPolicyBtn" class="hidden"')
h2 = h2.replace('<button id="parentDownloadAuditBtn"', '<button id="parentDownloadAuditBtn" class="hidden"')
h2 = h2.replace('</head>', f'<style>{css_popup}</style></head>')
with open(os.path.join(BASE_DIR, "preview_02.html"), "w", encoding="utf-8") as f:
    f.write(h2)


# --- Screen 3: Onboarding Role Selection ---
with open(os.path.join(BASE_DIR, "onboarding.html"), "r", encoding="utf-8") as f:
    h3 = f.read()

css_onboarding = """
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 780px !important;
  background-color: #ECE7DF !important;
  display: block !important;
  min-height: auto !important;
  height: auto !important;
  overflow: hidden !important;
}
.wizard-container {
  width: 780px !important;
  margin: 0 !important;
  border-radius: 16px !important;
  box-shadow: none !important;
}
"""
h3 = h3.replace('</head>', f'<style>{css_onboarding}</style></head>')
with open(os.path.join(BASE_DIR, "preview_03.html"), "w", encoding="utf-8") as f:
    f.write(h3)


# --- Screen 4: Onboarding Parent Policy ---
with open(os.path.join(BASE_DIR, "onboarding.html"), "r", encoding="utf-8") as f:
    h4 = f.read()

h4 = h4.replace('<div id="stepRole" class="wizard-step active">', '<div id="stepRole" class="wizard-step">')
h4 = h4.replace('<div id="stepParent3" class="wizard-step">', '<div id="stepParent3" class="wizard-step active">')
h4 = h4.replace('<div class="step-dot active" data-step="0">1</div>', '<div class="step-dot completed" data-step="0">✓</div>')
h4 = h4.replace('<div class="step-dot" data-step="1">2</div>', '<div class="step-dot completed" data-step="1">✓</div>')
h4 = h4.replace('<div class="step-dot" data-step="2">3</div>', '<div class="step-dot active" data-step="2">3</div>')
h4 = h4.replace('</head>', f'<style>{css_onboarding}</style></head>')
with open(os.path.join(BASE_DIR, "preview_04.html"), "w", encoding="utf-8") as f:
    f.write(h4)


# --- Screen 5: Onboarding Child Smart Rules ---
with open(os.path.join(BASE_DIR, "onboarding.html"), "r", encoding="utf-8") as f:
    h5 = f.read()

h5 = h5.replace('<div id="stepRole" class="wizard-step active">', '<div id="stepRole" class="wizard-step">')
h5 = h5.replace('<div id="stepChild2" class="wizard-step">', '<div id="stepChild2" class="wizard-step active">')
h5 = h5.replace('<div class="step-dot active" data-step="0">1</div>', '<div class="step-dot completed" data-step="0">✓</div>')
h5 = h5.replace('<div class="step-dot" data-step="1">2</div>', '<div class="step-dot active" data-step="1">2</div>')
h5 = h5.replace('</head>', f'<style>{css_onboarding}</style></head>')
with open(os.path.join(BASE_DIR, "preview_05.html"), "w", encoding="utf-8") as f:
    f.write(h5)


# --- Screen 6: Blocked Access Paused Page ---
with open(os.path.join(BASE_DIR, "blocked.html"), "r", encoding="utf-8") as f:
    h6 = f.read()

css_blocked = """
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 480px !important;
  background-color: #ECE7DF !important;
  display: block !important;
  min-height: auto !important;
  height: auto !important;
  overflow: hidden !important;
}
.blocked-frame {
  width: 480px !important;
  margin: 0 !important;
  border-radius: 16px !important;
  box-shadow: none !important;
}
"""
h6 = h6.replace('</head>', f'<style>{css_blocked}</style></head>')
with open(os.path.join(BASE_DIR, "preview_06.html"), "w", encoding="utf-8") as f:
    f.write(h6)

print("Clean preview HTMLs prepared.")

# -------------------------------------------------------------
# 2. SCREEN CONFIGURATIONS
# -------------------------------------------------------------
screens = [
    {
        "id": "01_parent_command_center",
        "file": "preview_01.html",
        "width": 400,
        "capture_h": 900,
        "badge": "PARENT COMMAND CENTER",
        "headline": "Real-Time AI Safety & Remote Guard",
        "sub": "Live Child AI Safety Index, threat telemetry, Bedtime curfew & custom blacklist"
    },
    {
        "id": "02_child_protection_shield",
        "file": "preview_02.html",
        "width": 400,
        "capture_h": 700,
        "badge": "CHILD PROTECTION SHIELD",
        "headline": "Pre-Emptive AI Defense & Identity Guard",
        "sub": "Silently blocks predatory AI chatbots, adult content, and sanitizes prompt PII"
    },
    {
        "id": "03_onboarding_role_selection",
        "file": "preview_03.html",
        "width": 780,
        "capture_h": 900,
        "badge": "ROLE-ADAPTIVE ONBOARDING",
        "headline": "One Unified Extension, Two Powerful Roles",
        "sub": "Choose Child Shield or Parent Hub during setup with Master PIN lock protection"
    },
    {
        "id": "04_onboarding_parent_policy",
        "file": "preview_04.html",
        "width": 780,
        "capture_h": 900,
        "badge": "CUSTOM REMOTE POLICIES",
        "headline": "Granular AI Safety & Distraction Control",
        "sub": "Choose Strict, Supervised, or Study-Only protection with one-click platform blocks"
    },
    {
        "id": "05_child_smart_rules",
        "file": "preview_05.html",
        "width": 780,
        "capture_h": 900,
        "badge": "EDUCATIONAL SENTINEL",
        "headline": "Teaching Children Safe AI Practices",
        "sub": "Built-in kid-friendly rules for navigating generative AI safely and responsibly"
    },
    {
        "id": "06_blocked_access_paused",
        "file": "preview_06.html",
        "width": 480,
        "capture_h": 800,
        "badge": "EDUCATIONAL INTERCEPTION",
        "headline": "Compassionate Threat Interception",
        "sub": "Pre-empts synthetic roleplay companions, deepfakes, and provides 24/7 crisis support"
    }
]

# -------------------------------------------------------------
# 3. CAPTURE & CROP EACH SCREEN
# -------------------------------------------------------------
for item in screens:
    preview_path = os.path.join(BASE_DIR, item["file"])
    raw_path = os.path.join(SCREENS_DIR, f"{item['id']}_raw.png")
    clean_path = os.path.join(SCREENS_DIR, f"{item['id']}.png")
    poster_path = os.path.join(POSTERS_DIR, f"poster_{item['id']}.png")
    temp_poster = os.path.join(POSTERS_DIR, f"temp_{item['id']}.png")

    file_url = f"file:///{preview_path.replace(os.sep, '/')}"
    w = item["width"]
    h = item["capture_h"]

    # Headless chrome capture
    subprocess.run([
        CHROME_PATH,
        "--headless",
        "--hide-scrollbars",
        f"--window-size={w},{h}",
        f"--screenshot={raw_path}",
        file_url
    ], check=True)

    im = Image.open(raw_path)

    # Detect the bottom border of the card
    bg = (236, 231, 223) # #ECE7DF
    bottom_y = im.height - 1
    for y in range(im.height - 1, 0, -1):
        p = im.getpixel((w // 2, y))[:3]
        if p != bg and p != (255, 255, 255):
            bottom_y = y
            break

    card_h = bottom_y + 1
    card = im.crop((0, 0, w, card_h))
    card.save(clean_path)
    print(f"Captured clean screen: {item['id']} ({w}x{card_h})")

    # -------------------------------------------------------------
    # 4. COMPOSITE 1280x800 STORE POSTER
    # -------------------------------------------------------------
    POSTER_W = 1280
    POSTER_H = 800
    poster = Image.new("RGBA", (POSTER_W, POSTER_H), (236, 231, 223, 255))
    draw = ImageDraw.Draw(poster)

    # Accent Top Gradient Line (6px tall)
    for gx in range(POSTER_W):
        t = gx / POSTER_W
        if t < 0.5:
            r = int(217 + (216 - 217) * (t * 2))
            g = int(72 + (206 - 72) * (t * 2))
            b = int(37 + (194 - 37) * (t * 2))
        else:
            t2 = (t - 0.5) * 2
            r = int(216 + (63 - 216) * t2)
            g = int(206 + (94 - 206) * t2)
            b = int(194 + (77 - 194) * t2)
        draw.line([(gx, 0), (gx, 5)], fill=(r, g, b, 255))

    # Badge Pill (at top: y=28)
    badge_text = item["badge"]
    badge_w = len(badge_text) * 7 + 24
    badge_x = (POSTER_W - badge_w) // 2
    draw.rounded_rectangle([badge_x, 28, badge_x + badge_w, 52], radius=6, fill=(244, 239, 235, 255), outline=(216, 206, 194, 255), width=1)

    try:
        font_badge = ImageFont.truetype("arialbd.ttf", 11)
        font_title = ImageFont.truetype("georgiab.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 14)
    except:
        font_badge = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Badge Text
    draw.text((badge_x + 12, 33), badge_text, fill=(101, 96, 91), font=font_badge)

    # Headline
    title_text = item["headline"]
    tbox = draw.textbbox((0, 0), title_text, font=font_title)
    tw = tbox[2] - tbox[0]
    draw.text(((POSTER_W - tw) // 2, 62), title_text, fill=(24, 22, 21), font=font_title)

    # Subtitle
    sub_text = item["sub"]
    sbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = sbox[2] - sbox[0]
    draw.text(((POSTER_W - sw) // 2, 96), sub_text, fill=(101, 96, 91), font=font_sub)

    # Available vertical area for card: y=130 to y=770 (640px)
    avail_w = 1100
    avail_h = 635
    scale = min(avail_w / card.width, avail_h / card.height, 1.0)
    if scale < 1.0:
        new_w = int(card.width * scale)
        new_h = int(card.height * scale)
        card_scaled = card.resize((new_w, new_h), Image.Resampling.LANCZOS)
    else:
        card_scaled = card

    card_x = (POSTER_W - card_scaled.width) // 2
    card_y = 130 + (avail_h - card_scaled.height) // 2

    # Draw Gaussian Drop Shadow behind card
    shadow_pad = 24
    shadow = Image.new("RGBA", (card_scaled.width + shadow_pad * 2, card_scaled.height + shadow_pad * 2), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [shadow_pad, shadow_pad, card_scaled.width + shadow_pad, card_scaled.height + shadow_pad],
        radius=16,
        fill=(24, 22, 21, 45)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    poster.paste(shadow, (card_x - shadow_pad, card_y - shadow_pad + 6), shadow)

    # Paste Card
    poster.paste(card_scaled, (card_x, card_y), card_scaled if card_scaled.mode == "RGBA" else None)

    # Save to temp PNG
    poster.save(temp_poster)

    # -------------------------------------------------------------
    # 5. FFMPEG LOSSLESS OPTIMIZATION
    # -------------------------------------------------------------
    ffmpeg_cmd = [
        FFMPEG_PATH, "-y",
        "-i", temp_poster,
        "-c:v", "png",
        "-compression_level", "9",
        poster_path
    ]
    subprocess.run(ffmpeg_cmd, check=True)

    if os.path.exists(temp_poster): os.remove(temp_poster)
    if os.path.exists(raw_path): os.remove(raw_path)
    if os.path.exists(preview_path): os.remove(preview_path)

    print(f"-> Generated Poster: {poster_path}")

if os.path.exists(os.path.join(BASE_DIR, "inspect_crops.py")):
    os.remove(os.path.join(BASE_DIR, "inspect_crops.py"))

print("\nAll 6 screens and 1280x800 store posters successfully built!")
