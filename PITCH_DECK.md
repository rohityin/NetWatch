# 📊 NetWatch: Hackathon Pitch Deck Structure

*A concise 8-slide presentation deck designed for live judging or slide-embed on Devpost.*

---

### Slide 1: Title & Overview
- **Header**: NetWatch: Family Safety Guardian & Parental Command Center
- **Subtitle**: Helping Parents Track Online Activity, Enforce Web Rules, and Shield Private Data Inside AI Prompts
- **Visual**: Extension logo (`🛡️ NetWatch`) with side-by-side screenshots of the Child Protection Shield and Parent Command Center.
- **Presenter Note**: *"NetWatch is a complete parental command center that helps parents keep track of their children's online browsing activity, while featuring an intelligent in-page shield to protect kids inside modern AI tools."*

---

### Slide 2: The Two Digital Challenges Modern Parents Face
- **Challenge 1: General Online Activity & Screen Time**:
  - Parents have zero real-time visibility into what websites their kids visit throughout the day.
  - Screen time distractions during homework and late-night browsing past bedtime.
- **Challenge 2: The Unmonitored AI Frontier**:
  - Kids routinely type private phone numbers, home addresses, and school names into ChatGPT prompts.
  - Addictive AI companion apps (Character.ai, Replika) simulating emotional intimacy and isolating kids.
  - Traditional URL blockers are completely blind to what happens *inside* an AI chat prompt.
- **Presenter Note**: *"Parents need a single system that handles both everyday browsing activity and next-generation AI threats."*

---

### Slide 3: Introducing NetWatch
- **Core Value Proposition**: A single, unified Chrome extension that delivers complete parental activity tracking and next-generation AI prompt privacy.
- **The Two Clear Roles**:
  - 👶 **Child Protection Shield**: Logs browsing activity, sanitizes personal info in AI prompts, blocks companion apps, and offers 988 crisis help.
  - 👨‍👩‍👧 **Parent Command Center**: Live digital safety score (0-100), real-time activity stream, remote policy dispatch, and bedtime internet pause.
- **Key Metric**: Sub-3.5 second remote policy synchronization.

---

### Slide 4: Pillar 1 — Complete Parental Online Activity Monitoring
- **Real-Time Browsing Telemetry**: Every visited domain and safety event is logged and synced to the parent's device.
- **Remote Policy Control**: Switch between Strict Mode, Supervised Mode, or Study Only Mode (homework tools only) in 3.5 seconds.
- **One-Click Bedtime Internet Pause**: Instantly pauses all active web browsing on the child's laptop during dinner or bedtime.
- **Remote Custom Blacklist**: Add specific domains (Roblox, TikTok, Discord) with instant chip tags.
- **Downloadable Safety Audit (CSV)**: Export a complete spreadsheet of all visited sites and safety events for family check-ins.
- **Tamper Prevention**: Master 4-digit PIN (salted SHA-256) stops kids from changing settings or disabling the extension.

---

### Slide 5: Pillar 2 (Flagship Innovation) — In-Page AI Prompt & Personal Info Shield
- **Feature Focus**: Active on ChatGPT, Claude, Gemini, Character.ai, etc.
- **Under the Hood**:
  - Automatic pattern detection for Phone Numbers, Emails, Street Addresses, and IDs.
  - **1-Click "Sanitize Prompt"**: Automatically replaces sensitive personal data with `[REDACTED ...]` tokens.
  - **V-DOM Desynchronization Immune**: Dispatches synthetic `InputEvent` and uses `document.execCommand('insertText')` to keep React, Slate, and ProseMirror virtual DOM states in sync.
  - **Synchronous Capture**: Intercepts Enter-key presses and Send button clicks before the AI API is called.

---

### Slide 6: Addictive AI Companion Blocking & 988 Crisis Support
- **Feature Focus**: Pre-Navigation Interception (`webNavigation.onBeforeNavigate`).
- **Under the Hood**:
  - In-memory 636,000+ domain blacklist engine evaluated in under 0.1 milliseconds.
  - AI companion apps (Character.ai, Replika, Talkie) pre-emptively redirected to a kid-friendly educational explanation (`blocked.html`).
  - **Crisis Sentinel**: Synchronous freeze and compassionate 988 Suicide & Crisis Lifeline modal ("You Are Not Alone").

---

### Slide 7: Technical Stack & Clean Architecture
- **Tech Stack**:
  - **Extension**: Vanilla JavaScript (ES6+), Manifest V3, Web Crypto API, WebNavigation API.
  - **Relay Server**: Native Node.js HTTP/URL modules (0 npm dependencies, ultra-lightweight, edge-deployable).
  - **Zero Parent Interference**: Parent's own web browsing remains 100% unrestricted.

---

### Slide 8: Future Roadmap & Vision
- **Roadmap**:
  1. On-device multi-modal WebAssembly vision model for deepfake/image detection.
  2. School & Chromebook classroom fleet management.
  3. Chrome Web Store deployment.
- **Closing Tagline**: *"Giving parents complete peace of mind and empowering kids to explore the web and AI safely."*
