# 📊 NetWatch: Hackathon Pitch Deck Structure

*A concise 8-slide presentation deck designed for live judging or slide-embed on Devpost.*

---

### Slide 1: Title & Problem Hook
- **Header**: NetWatch: Family AI Guardian
- **Subtitle**: Protecting Children in the Age of Generative AI, Synthetic Companions, and Dark Patterns
- **Visual**: Extension logo (`🛡️ NetWatch`) with side-by-side screenshots of the Child Shield and Parent Command Center.
- **Presenter Note**: *"Today, children are growing up with AI chatbots as their confidants, tutors, and companions. But legacy parental controls are blind to what happens inside an AI prompt."*

---

### Slide 2: The Real Dangers Kids Face with AI
- **3 Critical Problems**:
  1. **Manipulative AI Companions**: Unregulated chatbots (Character.ai, Replika) programmed to simulate romance and friendship, isolating kids from real friends and family.
  2. **Accidental Personal Data Leaks**: Kids typing home addresses, phone numbers, and school names into ChatGPT prompts that get logged and stored forever on AI company servers.
  3. **The Crisis Blindspot**: Vulnerable teens in distress asking chatbots for self-harm advice instead of getting real human medical or crisis support.
- **Presenter Note**: *"Traditional URL blockers only check if a website is adult content. They cannot read what kids type inside an AI chat box or detect when a chatbot is emotionally manipulating them."*

---

### Slide 3: Introducing NetWatch
- **Core Value Proposition**: A single Chrome extension that makes AI safe for children while giving parents real-time visibility and control.
- **The Two Clear Roles**:
  - 👶 **Child Protection Shield**: Removes personal data from prompts in real time, blocks addictive AI companion sites, and provides immediate 988 Crisis Lifelines.
  - 👨‍👩‍👧 **Parent Command Center**: Shows a live AI Safety Score (0-100), streams blocked threats, and lets parents change rules or pause the internet in 3.5 seconds.
- **Key Metric**: Sub-3.5 second remote policy sync.

---

### Slide 4: Innovation 1 — In-Page Prompt & PII Guardian
- **Feature Focus**: Active on ChatGPT, Claude, Gemini, Character.ai, etc.
- **Under the Hood**:
  - Regex & pattern detection for Phone Numbers, Emails, Street Addresses, and IDs.
  - **1-Click "Sanitize Prompt"**: Automatically replaces PII with `[REDACTED ...]` tokens.
  - **V-DOM Desync Immune**: Dispatches synthetic `InputEvent` and uses `document.execCommand('insertText')` to ensure React, Slate, and ProseMirror virtual DOM states remain in sync.
  - **Zero-Bypass Capture**: Intercepts Enter-key and Send button clicks in the synchronous capture phase.

---

### Slide 5: Innovation 2 — Synthetic Companion & Threat Defense
- **Feature Focus**: Pre-Navigation Interception (`webNavigation.onBeforeNavigate`).
- **Under the Hood**:
  - 636,000+ domain blacklist engine evaluated sub-millisecond in memory.
  - AI companion taxonomy (JanitorAI, Chai, Talkie, Crushon) pre-emptively redirected to an educational, kid-friendly explanation (`blocked.html`).
  - **Crisis Sentinel**: Synchronous freeze and compassionate 988 Suicide & Crisis Lifeline modal ("You Are Not Alone").

---

### Slide 6: Innovation 3 — Remote Parental Command Center
- **Feature Focus**: Real-time family telematics with zero parent browsing interference.
- **Key Capabilities**:
  - 6-digit family pairing code.
  - Dynamic AI Safety Index (0-100).
  - Remote mode toggle (Strict, Supervised, Study Only).
  - Remote Bedtime / Focus "Pause Internet" switch.
  - 1-click Safety Audit CSV export.
  - Master PIN protection (SHA-256 + salt) prevents tampering on child machines.

---

### Slide 7: Technical Stack & Clean Architecture
- **Tech Stack**:
  - **Extension**: Vanilla JavaScript, Manifest V3, Web Crypto API, WebNavigation API.
  - **Relay Server**: Native Node.js HTTP/URL modules (0 npm dependencies, ultra-lightweight, edge-deployable).
  - **Design**: Warm Swiss Editorial & Bento UI aesthetic (non-punitive, calm, readable).

---

### Slide 8: Future Roadmap & Impact
- **Roadmap**:
  1. On-device multi-modal WebAssembly vision model for deepfake/image detection.
  2. School & Chromebook classroom fleet management.
  3. Chrome Web Store deployment.
- **Closing Tagline**: *"Empowering kids to thrive with AI—safely, wisely, and securely."*
