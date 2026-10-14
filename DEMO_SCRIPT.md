# 🎬 NetWatch: Hackathon Video Demo Script (2 - 3 Minutes)

> **Goal**: A high-impact, professional video demo for Devpost judges showing how NetWatch tracks online activity, enforces parental rules, and shields private data inside AI prompts.

---

## 🖥️ Screen Setup Before Recording
1. **Side-by-Side Windows**:
   - **Left Half of Screen**: **Child Browser** (Chrome Profile A or Incognito/separate window).
   - **Right Half of Screen**: **Parent Command Center** (Chrome Profile B or Microsoft Edge).
2. **Terminal running Relay Server** (hidden or minimized):
   ```bash
   cd "d:\Hackathon Projects\NetWatch\relay-server"
   node server.js
   ```
3. **Child Browser Tabs Ready**:
   - Tab 1: ChatGPT or Claude (`chatgpt.com` or demo AI prompt page).
   - Tab 2: Character.ai or Replika (`character.ai`).
4. **Parent Browser Ready**:
   - Open NetWatch popup or Parent Command Center window.

---

## ⏱️ Video Timeline & Narration

### [0:00 - 0:30] The Hook: The Dual Challenge of Modern Parenting
- **Visual**: Show graphics of modern web browsing, late-night screen time, and AI chatbots. Or camera on presenter holding up a laptop.
- **Voiceover**:
  > *"Parents today face a double challenge: keeping track of their kids' online browsing activity, and protecting them from the new dangers of Generative AI. Kids spend hours on the web for homework, but they also stumble upon harmful sites, stay up late browsing, and type private home addresses and phone numbers into AI prompts on ChatGPT.*
  > *Traditional website blockers only check URLs—they can't help parents track overall digital safety and have zero visibility into AI chat prompts. That’s why we built **NetWatch**: a complete parental command center and activity tracker, with an intelligent in-page AI shield built right in."*

---

### [0:30 - 1:00] The Architecture & Setup: One Extension, Two Roles
- **Visual**: Show the NetWatch setup wizard (`onboarding.html`). Select "Child Device" on the left window, and "Parent Command Center" on the right window.
- **Voiceover**:
  > *"NetWatch is a single, unified Chrome extension. On the child's computer, it logs browsing activity and enforces safety shields. On the parent's laptop, it becomes an executive command center.*
  > *Pairing is effortless: the child's screen shows a 6-digit family pairing code. The parent enters it once, sets a 4-digit Master PIN, and both devices connect in seconds through our lightweight relay."*

---

### [1:00 - 1:40] Live Demo 1: The AI Prompt & Personal Info Protector
- **Visual**: On the left window (Child), navigate to ChatGPT.
  Type: `"Hi! Can you help me with my homework? My phone number is 415-555-0199 and I live at 742 Evergreen Terrace."`
  Show the NetWatch warning toast appear immediately!
  Show the presenter click **"✨ Sanitize Prompt"**.
  The text immediately transforms to: `"Hi! Can you help me with my homework? My phone number is [REDACTED PHONE NUMBER] and I live at [REDACTED STREET ADDRESS]."`
- **Voiceover**:
  > *"Here's our flagship AI feature in action. When a child types their real phone number and home address into ChatGPT, NetWatch intercepts it in real time.*
  > *Even if the child hits Enter or clicks Send, our synchronous event engine halts transmission before the data leaves the computer. With one click on 'Sanitize Prompt', the private info is safely redacted without breaking ChatGPT's internal virtual DOM.*
  > *NetWatch also blocks manipulative AI companion apps like Character.ai with kid-friendly educational guidance, and freezes the screen with the 988 Crisis Lifeline if a child inputs self-harm keywords."*

---

### [1:40 - 2:30] Live Demo 2: The Parent Command Center & Activity Tracking
- **Visual**: Pan over to the right window (Parent).
  Show the **AI Safety Score** dynamically updated (e.g. 88/100).
  Show the **Live Threat & Activity Stream** displaying exact events and visited sites with timestamps.
  Switch mode from **Strict** to **Study Only** (homework sites only).
  Toggle **Pause Child's Internet**.
  Click **"Push Policy Update"**.
  Show the left window immediately locking into the bedtime/pause screen within 3 seconds!
  Click **"Download Child Safety Audit (CSV)"** to show the spreadsheet downloading.
- **Voiceover**:
  > *"Now let's look at the Parent Command Center on the right. Parents get full visibility into their child's online activity. You can see a live digital safety score, and a real-time stream of visited websites and blocked threats.*
  > *Parents can change rules remotely in under 3.5 seconds: switch to 'Study Only Mode' during homework hours, add custom blocked websites, or toggle 'Pause Child's Internet' at bedtime.*
  > *Parents can also download a complete timestamped CSV safety audit to review all browsing history and safety interventions during family check-ins."*

---

### [2:30 - 3:00] Closing & Summary
- **Visual**: Show NetWatch extension icon, GitHub repository, and clean summary slide.
- **Voiceover**:
  > *"NetWatch gives parents the complete visibility they need to keep track of their children's online browsing activity, combined with next-generation prompt privacy to keep them safe in the age of AI.*
  > *It's 100% Manifest V3 compliant, open-source, and tamper-proof with Master PIN protection.*
  > *Thank you to STEMSisterz and the Child Safety in AI hackathon for supporting safer technology for the next generation!"*
