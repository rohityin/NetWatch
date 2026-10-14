# 📋 NetWatch: Hackathon Submission & Recording Checklist

Use this checklist to verify everything is 100% operational before recording your demo video and submitting to Devpost!

---

## 🛠️ Phase 1: Local Environment Verification

- [ ] **1. Relay Server Running**:
  - Open a terminal in `d:\Hackathon Projects\NetWatch\relay-server`
  - Run: `node server.js`
  - Confirm output:
    ```text
    🛡️  NetWatch Relay Server running on port 3000
    📡 Local endpoint: http://localhost:3000
    ```
  - Test health check: Open browser to `http://localhost:3000/api/health` -> should return `{"status":"ONLINE", ...}`.

- [ ] **2. Browser Profiles Prepared**:
  - **Browser Window 1 (Child)**: Chrome Profile A (or regular Chrome window).
  - **Browser Window 2 (Parent)**: Chrome Profile B (or Microsoft Edge / separate Chrome profile).
  - Both load the unpacked extension from `d:\Hackathon Projects\NetWatch`.

---

## 🧪 Phase 2: Feature & Demo Test Run

- [ ] **1. Onboarding Test**:
  - On Child Window: choose **Child's Device**. Copy the 6-digit pairing code (e.g., `749201`).
  - On Parent Window: choose **Parent / Guardian**. Set PIN to `1234`, enter the child's 6-digit code, select **Strict Mode**.
  - Verify Parent Command Center displays:
    - Score: `100/100`
    - Target Device linked with green dot.

- [ ] **2. In-Page AI Prompt & PII Test**:
  - On Child Window, navigate to ChatGPT (`https://chatgpt.com`) or test on an AI chatbot with an input area.
  - Paste test prompt:
    ```text
    Hello, my phone number is 415-555-0199 and my home address is 742 Evergreen Terrace.
    ```
  - Verify NetWatch amber toast appears:
    - Lists detected items: `Phone Number, Street Address`.
    - Click **"✨ Sanitize Prompt"**.
    - Verify text changes to:
      ```text
      Hello, my phone number is [REDACTED PHONE NUMBER] and my home address is [REDACTED STREET ADDRESS].
      ```
  - Verify Parent Command Center increments **PII Leaks Shielded** counter and logs incident!

- [ ] **3. Companion AI Blocking Test**:
  - On Child Window, try navigating to `https://character.ai` or `https://replika.ai`.
  - Verify instant redirection to `blocked.html` explaining synthetic companion risks in kid-friendly language.
  - Verify Parent Command Center increments **Companions Blocked** counter!

- [ ] **4. Remote Policy Sync Test**:
  - In Parent Window, switch mode to **Study Only** or toggle **Pause Child's Internet**.
  - Click **"Push Policy Update"**.
  - In Child Window, verify within 3.5 seconds that the policy updates or internet pause triggers on navigation!

- [ ] **5. Browsing Activity Tracking & Safety Audit Export Test**:
  - In Child Window, visit a couple of regular websites (e.g. `wikipedia.org`, `nationalgeographic.com`).
  - In Parent Window, click **"Download Child Safety Audit (CSV)"**.
  - Open the downloaded CSV file (`netwatch_child_audit_CH-XXXXX.csv`) and verify that both normal visited websites and blocked threat events are cleanly logged with timestamps!

- [ ] **6. Master PIN Role Protection Test**:
  - In Child Window popup, click **"Switch Role / Re-run Setup"**.
  - Verify that the PIN modal prompts for the 4-digit Master PIN and rejects incorrect PINs.

---

## 📤 Phase 3: Devpost Submission Fields Guide

When submitting on [child-safety-in-ai.devpost.com](https://child-safety-in-ai.devpost.com):

1. **Project Title**: `NetWatch: Family Safety Guardian & Parental Command Center`
2. **Tagline**: `A comprehensive parental command center that helps parents track their children's online browsing activity, enforce web curfews, and protect private personal info inside modern AI prompts.`
3. **Project Story Content**: Copy & paste directly from [DEVPOST_SUBMISSION.md](file:///d:/Hackathon%20Projects/NetWatch/DEVPOST_SUBMISSION.md).
4. **Try It Out / GitHub Link**: Link to your GitHub repository for NetWatch.
5. **Video Demo Link**: YouTube / Loom / Vimeo link (using your recording from [DEMO_SCRIPT.md](file:///d:/Hackathon%20Projects/NetWatch/DEMO_SCRIPT.md)).
6. **Built With Tags**:
   `javascript`, `chrome-extension`, `manifest-v3`, `nodejs`, `html5`, `css3`, `web-crypto-api`, `ai-safety`
