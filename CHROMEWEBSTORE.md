# Chrome Web Store Listing — NetWatch: Family AI Guardian

> Last Updated: 2026-10-14

## Store Listing

**Extension Name** [REQUIRED]
NetWatch: Family AI Guardian

**Short Description** [REQUIRED]
Unified AI child safety and parental command center. Choose Child Shield or Parent Command Center role during setup.

**Detailed Description** [REQUIRED]
Protect your children while they explore the internet and artificial intelligence tools.

NetWatch is a unified family guardian extension that connects a child's browser protection shield directly to a remote parent command center. Whether your child is doing homework or browsing the web, NetWatch safeguards their well-being against the emerging risks of generative AI, synthetic roleplay companions, deepfakes, and adult content.

KEY FEATURES

• Smart AI Protection: Pre-emptively halts access to predatory synthetic companion bots, deepfake face-swappers, and adult websites.
• In-Prompt Identity Shield: Detects and redacts personal identifiable information (phone numbers, home addresses, emails) before submission into AI chat tools.
• Mental Health Sentinel: Provides compassionate intervention and immediate 988 Crisis Lifeline resources if self-harm phrases are typed into any AI chatbot.
• Remote Parent Command Center: Monitor child device safety scores, view real-time intervention alerts, and adjust policies remotely across browsers.
• Bedtime & Focus Internet Pause: Temporarily pause internet access on child devices with a single click from the parent hub.
• Master PIN Tamper Resistance: Children cannot disable protection or switch roles without the parent's secret Master PIN.

HOW TO USE NETWATCH

1. Install NetWatch on your child's browser and select "Child's Device" in the Setup Wizard. Note the 6-digit Family Pairing Code.
2. Install NetWatch on your parent browser or device and select "Parent / Guardian".
3. Set your 4-digit Master PIN and enter the child's pairing code to establish a live connection.
4. Customize your protection preferences (Strict, Supervised, or Study Only Mode).

PRIVACY & DATA SAFETY

NetWatch is built for families. Your child's personal data, prompts, and browsing information are never sold to advertisers or third parties. Telemetry is transmitted exclusively between your paired family devices via your private relay sync bridge.

SUPPORT & FEEDBACK

For documentation, feature requests, or support, please visit our project repository or contact our team.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Protects children from AI synthetic companions, deepfakes, adult content, and PII leaks, with real-time parental monitoring.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|---|---|---|---|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `images/128x128.png` |
| Small Icon | 16×16 PNG | ✅ Ready | `images/16x16.png` |
| Action Icon | 24×24 PNG | ✅ Ready | `images/24x24.png` |
| Medium Icon | 32×32 PNG | ✅ Ready | `images/32x32.png` |
| Large Icon | 48×48 PNG | ✅ Ready | `images/48x48.png` |
| Screenshot 1 [REQUIRED] | 1280×800 | 🟡 Recommended | Setup Wizard Role Selection |
| Screenshot 2 [RECOMMENDED] | 1280×800 | 🟡 Recommended | Child Shield Status & Pairing |
| Screenshot 3 [RECOMMENDED] | 1280×800 | 🟡 Recommended | Parent Hub Live Dashboard |
| Screenshot 4 | 1280×800 | 🟡 Recommended | In-Page PII Prompt Shield |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | promo-small.png |

### Screenshot Notes
- Screenshot 1: Shows the clean onboarding screen where users choose between "Child's Device" and "Parent / Guardian".
- Screenshot 2: Shows the Child Shield popup with the 6-digit family pairing code and active policy badge.
- Screenshot 3: Shows the Parent Command Center displaying the AI Safety Index, live threat counters, remote mode controls, and real-time intervention stream.
- Screenshot 4: Shows the Prompt Guardian toast intercepting sensitive personal data in an AI prompt with the 1-click "Sanitize Prompt" button.

---

## Permissions Justification

| Permission | Type | Justification |
|---|---|---|
| `tabs` | permissions | Required to identify navigation URLs on child devices to enforce AI safety policies and update tabs to the educational blocked screen. |
| `webNavigation` | permissions | Required for pre-navigation interception (`onBeforeNavigate`), ensuring malicious domains and synthetic companion platforms are blocked before page scripts execute. |
| `storage` | permissions | Required to save the device role, local safety policy, child device pairing identifier, and salted Master Parent PIN hash locally. |
| `alarms` | permissions | Required to periodically sync telemetry with the family relay server in the background across ephemeral service worker lifecycles. |
| `downloads` | permissions | Required by the Parent Command Center to download the timestamped Child Safety Audit CSV report directly to the parent's device. |
| `*://*/*` | host_permissions | Required exclusively in Child mode to intercept navigation to blacklisted threat domains, adult content, and synthetic AI companion sites across the web. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|---|---|---|---|---|
| Personally identifiable info | No | No | N/A (PII is redacted locally in prompts) | No |
| Health info | No | No | N/A | No |
| Financial info | No | No | N/A | No |
| Authentication info | No | No | N/A (PIN hash stored strictly in local storage) | No |
| Personal communications | No | No | N/A | No |
| Location | No | No | N/A | No |
| Web history | Yes | Yes (to Family Relay) | Core Functionality: Logs blocked threat domains and navigation history for parent audit reports | No (Private Relay only) |
| User activity | Yes | Yes (to Family Relay) | Core Functionality: Counts threat interceptions and prompt sanitizations to compute the AI Safety Index | No (Private Relay only) |
| Website content | No | No | N/A | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
`https://github.com/waghi/NetWatch/blob/main/PRIVACY.md`

---

## Distribution

**Visibility**: Public
**Regions**: All regions

## Developer Info

**Publisher Name** [REQUIRED]
NetWatch Security Team

**Contact Email** [REQUIRED]
support@netwatch-guardian.org

**Support URL / Email** [RECOMMENDED]
`https://github.com/waghi/NetWatch/issues`

---

## Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 3.0.0 | 2026-10-14 | Single unified extension architecture with role-adaptive Onboarding Wizard, instant Adult/NSFW blocking, Manifest V3 CSP compliance, and alarm-based background sync. | Draft |
