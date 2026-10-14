# 📊 NetWatch: Hackathon Pitch Deck Structure

*A concise 8-slide presentation deck designed for live judging or slide-embed on Devpost.*

---

### Slide 1: Title & Problem Hook
- **Header**: NetWatch: Family AI Guardian
- **Subtitle**: Protecting Children in the Age of Generative AI, Synthetic Companions, and Dark Patterns
- **Visual**: Extension logo (`🛡️ NetWatch`) with side-by-side screenshots of the Child Shield and Parent Command Center.
- **Presenter Note**: *"Today, children are growing up with AI chatbots as their confidants, tutors, and companions. But legacy parental controls are blind to what happens inside an AI prompt."*

---

### Slide 2: The Sociotechnical Crisis
- **3 Key Pain Points**:
  1. **Synthetic Companionship & Grooming**: Unregulated bots (Character.ai, Replika) simulating unconditional emotional intimacy, leading to dependency and psychological detachment.
  2. **Prompt PII Harvesting**: Sensitive personal data (names, home addresses, phone numbers) routinely typed into LLMs and absorbed into AI training logs.
  3. **The Mental Health Blindspot**: Kids in distress turning to chatbots that hallucinate or fail to deliver critical crisis lifelines.
- **Presenter Note**: *"Traditional URL filters cannot read what kids type into ChatGPT, and they treat AI companionship as ordinary web browsing."*

---

### Slide 3: Introducing NetWatch
- **Core Value Proposition**: A unified, role-adaptive Manifest V3 browser guardian that empowers kids to explore AI safely while giving parents transparent, real-time command.
- **The Dual-Role Architecture**:
  - 👶 **Child Protection Shield**: Active in-page prompt guardian, synchronous PII sanitizer, companion blocking, crisis lifeline.
  - 👨‍👩‍👧 **Parent Command Center**: Dynamic AI Safety Index (0-100), real-time threat stream, remote policy push, bedtime pause switch.
- **Key Metric**: Sub-3.5 second remote policy synchronization.

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
