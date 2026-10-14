# 🎬 NetWatch: Hackathon Video Demo Script (2 - 3 Minutes)

> **Goal**: A high-impact, professional video demo for Devpost judges showing the problem, live dual-device interaction, in-page prompt interception, and parental command center.

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

### [0:00 - 0:30] The Hook: The Hidden Threat of AI for Kids
- **Visual**: Show news headlines or a graphic illustrating AI companion dependency and prompt PII harvesting. Or camera on presenter holding up a phone/laptop.
- **Voiceover**:
  > *"Generative AI is transforming how children learn, but it’s also creating an unprecedented digital crisis. Today, millions of kids spend hours talking to synthetic AI companions—forming dangerous emotional attachments, sharing sensitive home addresses and phone numbers in chat prompts, and receiving unfiltered, unsupervised advice.*
  > *Legacy parental controls only block static URLs—they have zero visibility into what happens inside an AI prompt. That’s why we built **NetWatch: Family AI Guardian**."*

---

### [0:30 - 1:00] The Architecture & Setup: One Extension, Two Roles
- **Visual**: Show the NetWatch setup wizard (`onboarding.html`). Select "Child Device" on the left window, and "Parent Command Center" on the right window.
- **Voiceover**:
  > *"NetWatch is a single, unified Manifest V3 Chrome extension that dynamically adapts based on the role you choose. On the child's laptop, it acts as a real-time protection shield. On the parent's device, it becomes an executive AI Command Center.*
  > *Let's pair them: the child's screen shows a 6-digit family pairing code. The parent enters it once, sets a master 4-digit PIN, and both devices are instantly connected through our lightweight relay."*

---

### [1:00 - 1:40] Live Demo 1: In-Page AI Prompt & PII Guardian
- **Visual**: On the left window (Child), navigate to ChatGPT or an LLM prompt box.
  Type: `"Hi! Can you help me with my homework? My phone number is 415-555-0199 and I live at 742 Evergreen Terrace."`
  Show the NetWatch warning toast appear immediately!
  Show the presenter click **"✨ Sanitize Prompt"**.
  The text immediately transforms to: `"Hi! Can you help me with my homework? My phone number is [REDACTED PHONE NUMBER] and I live at [REDACTED STREET ADDRESS]."`
- **Voiceover**:
  > *"Watch what happens when a child uses an AI tool. Here, the child accidentally enters their real phone number and home address into an LLM prompt. Before the message can be sent, NetWatch intercepts it in real-time.*
  > *With one click on 'Sanitize Prompt', our virtual DOM synchronization engine replaces sensitive PII with safe redactions—preventing private family data from being harvested by AI training servers.*
  > *Even if the child hits the Enter key or clicks Send rapidly, our synchronous event capture halts transmission in its tracks."*

---

### [1:40 - 2:05] Live Demo 2: Synthetic Companion & Crisis Interception
- **Visual**: On the left window (Child), try to navigate to `character.ai` or type a crisis statement.
  Show the browser instantly redirect to `blocked.html` with its warm, educational explanation.
  Show the crisis intervention modal demonstrating the 988 Lifeline support dialog.
- **Voiceover**:
  > *"Next, the child tries to visit an unregulated AI companion site. NetWatch's pre-navigation engine intercepts the request before the page even loads, redirecting to an educational, kid-friendly guide that explains why synthetic bots are computer algorithms, not real friends.*
  > *And crucially: if a child in distress enters crisis or self-harm keywords into an AI, NetWatch immediately freezes the screen and offers direct access to the 988 Suicide & Crisis Lifeline."*

---

### [2:05 - 2:40] Live Demo 3: The Parent Command Center & Remote Control
- **Visual**: Pan over to the right window (Parent).
  Show the **AI Safety Index** dynamically updated (e.g. 88/100).
  Show the **Live Threat Stream** showing the exact sanitized PII and blocked companion events.
  Toggle the mode from **Strict** to **Study Only**, and switch on **Pause Child's Internet**.
  Click **"Push Policy Update"**.
  Show the left window immediately updating to reflect the new policy within 3 seconds!
  Click **"Download Child Safety Audit (CSV)"** to show the instant report download.
- **Voiceover**:
  > *"Now look at the Parent Command Center on the right. In real time, the parent sees their child's AI Safety Index, along with a live stream of intercepted threats.*
  > *With zero disruption to the parent's own browsing, the parent can remotely switch policies—from Strict to Study Only—or pause the child's internet during bedtime with a single click. Changes sync in under 3.5 seconds.*
  > *Parents can also export a complete timestamped CSV safety audit for family check-ins."*

---

### [2:40 - 3:00] Closing & Vision
- **Visual**: Show NetWatch extension icon, GitHub repository, and clean presentation slide.
- **Voiceover**:
  > *"NetWatch is 100% Manifest V3 compliant, open-source, and engineered with zero heavy bloat to protect children’s privacy and mental health in the age of generative AI.*
  > *Thank you to STEMSisterz and the Child Safety in AI hackathon for championing this mission. Together, we can make AI safe, empowering, and protective for the next generation."*
