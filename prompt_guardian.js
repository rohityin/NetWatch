/**
 * NetWatch: AI Guardian for Kids
 * Content Script: In-Page AI Prompt & PII Guardian
 * Runs on generative AI and chatbot domains to prevent PII harvesting,
 * predatory grooming patterns, and mental health crises.
 *
 * Hardened against:
 * 1. React/ProseMirror Virtual DOM state desynchronization
 * 2. Rapid Enter-key & mouse-click send button bypasses
 */

(function () {
    if (window.__netwatchGuardianLoaded) return;

    // Check device role: only activate if this browser is configured as CHILD
    chrome.runtime.sendMessage({ type: 'GET_ROLE' }, (res) => {
        if (!res || res.role !== 'CHILD') {
            return;
        }
        window.__netwatchGuardianLoaded = true;
        initGuardian();
    });

    function initGuardian() {

    // Detection Patterns
    const PII_PATTERNS = [
        { type: 'Phone Number', regex: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/gi },
        { type: 'Email Address', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi },
        { type: 'Street Address', regex: /\b\d{1,5}\s+[A-Za-z0-9\s,.'-]{3,}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl)\b/gi },
        { type: 'Sensitive ID / Card Number', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/gi }
    ];

    const CRISIS_PATTERNS = [
        /\b(?:kill myself|want to die|commit suicide|end my life|hurt myself|cutting myself|hate my life|how to starve myself|suicidal)\b/i
    ];

    let activeToast = null;
    let crisisModalActive = false;

    // Scan an input text for risks synchronously
    function analyzePrompt(text) {
        if (!text || text.trim().length < 5) {
            return { hasRisk: false };
        }

        // Check for crisis signals first
        for (const pattern of CRISIS_PATTERNS) {
            if (pattern.test(text)) {
                return { hasRisk: true, isCrisis: true };
            }
        }

        // Check for PII leaks
        const foundPii = [];
        for (const p of PII_PATTERNS) {
            const matches = text.match(p.regex);
            if (matches && matches.length > 0) {
                foundPii.push({ type: p.type, sample: matches[0] });
            }
        }

        if (foundPii.length > 0) {
            return { hasRisk: true, isPii: true, piiItems: foundPii };
        }

        return { hasRisk: false };
    }

    // Sanitize PII from text
    function sanitizeText(text) {
        let clean = text;
        for (const p of PII_PATTERNS) {
            clean = clean.replace(p.regex, `[REDACTED ${p.type.toUpperCase()}]`);
        }
        return clean;
    }

    // Apply sanitization safely to React/Slate/ProseMirror and standard DOM inputs
    function applySanitization(element) {
        const rawText = element.isContentEditable ? element.innerText : element.value;
        const cleanText = sanitizeText(rawText);

        element.focus();

        if (element.isContentEditable) {
            // Select all contents and replace via insertText to inform ProseMirror/Slate/React
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            let success = false;
            try {
                success = document.execCommand('insertText', false, cleanText);
            } catch (e) {
                success = false;
            }

            if (!success) {
                element.innerText = cleanText;
            }

            // Dispatch synthetic input event to force React state sync
            element.dispatchEvent(new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertReplacementText',
                data: cleanText
            }));
        } else {
            // Standard Textarea / Input: use native prototype setter to bypass React 16+ overrides
            const proto = window.HTMLTextAreaElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (nativeSetter) {
                nativeSetter.call(element, cleanText);
            } else {
                element.value = cleanText;
            }

            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // Show floating PII warning banner
    function showPiiWarning(targetElement, piiItems) {
        if (activeToast) activeToast.remove();

        const toast = document.createElement('div');
        toast.id = 'netwatch-pii-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.maxWidth = '360px';
        toast.style.backgroundColor = '#1e293b';
        toast.style.border = '2px solid #f59e0b';
        toast.style.borderRadius = '10px';
        toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
        toast.style.padding = '14px 16px';
        toast.style.zIndex = '2147483647';
        toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        toast.style.color = '#f8fafc';
        toast.style.fontSize = '13px';
        toast.style.lineHeight = '1.4';
        toast.style.display = 'flex';
        toast.style.flexDirection = 'column';
        toast.style.gap = '8px';

        const typesList = piiItems.map(i => i.type).join(', ');

        toast.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-weight: 700; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
                    🛡️ NetWatch AI Shield
                </span>
                <button id="netwatch-toast-close" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px;">✕</button>
            </div>
            <div>
                <strong>Warning:</strong> You entered private personal data (<strong>${typesList}</strong>).
                AI systems store prompts and can expose your identity!
            </div>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
                <button id="netwatch-sanitize-btn" style="flex: 1; padding: 6px 12px; background: #f59e0b; color: #000; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px;">
                    ✨ Sanitize Prompt
                </button>
                <button id="netwatch-dismiss-btn" style="padding: 6px 10px; background: #334155; color: #cbd5e1; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    Keep
                </button>
            </div>
        `;

        document.body.appendChild(toast);
        activeToast = toast;

        // Notify background service worker of intercepted PII
        chrome.runtime.sendMessage({
            type: 'AI_SAFETY_ALERT',
            alertType: 'PII_INTERCEPTED',
            details: typesList,
            domain: window.location.hostname
        });

        // Event handlers
        document.getElementById('netwatch-toast-close').onclick = () => toast.remove();
        document.getElementById('netwatch-dismiss-btn').onclick = () => toast.remove();

        document.getElementById('netwatch-sanitize-btn').onclick = () => {
            applySanitization(targetElement);
            toast.remove();
        };
    }

    // Display Crisis Intervention Modal
    function showCrisisIntervention() {
        if (crisisModalActive) return;
        crisisModalActive = true;

        const overlay = document.createElement('div');
        overlay.id = 'netwatch-crisis-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        overlay.style.backdropFilter = 'blur(6px)';
        overlay.style.zIndex = '2147483647';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        overlay.innerHTML = `
            <div style="background: #1e293b; border: 2px solid #38bdf8; border-radius: 16px; width: 440px; max-width: 90vw; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); color: #f8fafc; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 8px;">💙</div>
                <h2 style="font-size: 20px; font-weight: 700; color: #38bdf8; margin-bottom: 12px;">
                    You Are Not Alone
                </h2>
                <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5; margin-bottom: 18px;">
                    AI chatbots are computer programs and cannot offer real support. If you are having a difficult time, please connect with a real, caring person who wants to help you.
                </p>
                
                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 14px; text-align: left; margin-bottom: 20px; font-size: 13px;">
                    <div style="margin-bottom: 8px; color: #38bdf8; font-weight: 600;">Free, 24/7 Confidential Support:</div>
                    <div style="margin-bottom: 6px;">📞 <strong>Call or Text 988</strong> – Suicide & Crisis Lifeline</div>
                    <div style="margin-bottom: 6px;">💬 <strong>Text HOME to 741741</strong> – Crisis Text Line</div>
                    <div>🌈 <strong>Call 1-866-488-7386</strong> – The Trevor Project</div>
                </div>

                <button id="netwatch-close-crisis" style="padding: 10px 24px; background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer;">
                    I Understand
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Notify background worker
        chrome.runtime.sendMessage({
            type: 'AI_SAFETY_ALERT',
            alertType: 'CRISIS_INTERCEPTION',
            details: 'Crisis keywords detected in AI prompt',
            domain: window.location.hostname
        });

        document.getElementById('netwatch-close-crisis').onclick = () => {
            overlay.remove();
            crisisModalActive = false;
        };
    }

    // Attach listeners to active inputs
    function setupInputListener(element) {
        if (!element || element.__netwatchListened) return;
        element.__netwatchListened = true;

        let debounceTimer;

        const checkValue = () => {
            const text = element.isContentEditable ? element.innerText : element.value;
            const analysis = analyzePrompt(text);

            if (analysis.hasRisk) {
                if (analysis.isCrisis) {
                    showCrisisIntervention();
                } else if (analysis.isPii) {
                    showPiiWarning(element, analysis.piiItems);
                }
            }
        };

        // Debounced check while typing
        element.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(checkValue, 600);
        });

        // Synchronous intercept on Enter key: halts transmission before debounce
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const text = element.isContentEditable ? element.innerText : element.value;
                const analysis = analyzePrompt(text);
                if (analysis.hasRisk) {
                    // Block Enter key submission synchronously!
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    if (analysis.isCrisis) {
                        showCrisisIntervention();
                    } else if (analysis.isPii) {
                        showPiiWarning(element, analysis.piiItems);
                    }
                }
            }
        }, true); // Use capture phase
    }

    // Intercept mouse clicks on Send/Submit buttons
    document.addEventListener('click', (e) => {
        const sendBtn = e.target.closest('button, [role="button"]');
        if (!sendBtn) return;

        // Check if button looks like a send or submit action
        const aria = (sendBtn.getAttribute('aria-label') || '').toLowerCase();
        const testId = (sendBtn.getAttribute('data-testid') || '').toLowerCase();
        const textContent = (sendBtn.textContent || '').trim().toLowerCase();
        const isSendAction = aria.includes('send') || testId.includes('send') || textContent === 'send' || sendBtn.type === 'submit';

        if (isSendAction) {
            // Find currently active or relevant input
            const activeInput = document.querySelector('textarea:focus, [contenteditable="true"]:focus') ||
                                document.querySelector('textarea, [contenteditable="true"]');
            if (activeInput) {
                const text = activeInput.isContentEditable ? activeInput.innerText : activeInput.value;
                const analysis = analyzePrompt(text);
                if (analysis.hasRisk) {
                    // Synchronously stop the click event
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    if (analysis.isCrisis) {
                        showCrisisIntervention();
                    } else if (analysis.isPii) {
                        showPiiWarning(activeInput, analysis.piiItems);
                    }
                }
            }
        }
    }, true); // Use capture phase

    // Scan DOM for inputs periodically
    function scanInputs() {
        const textareas = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
        textareas.forEach(setupInputListener);
    }

    // Initial scan and observer for dynamically rendered SPAs (e.g. ChatGPT, Character.ai)
    scanInputs();
    const observer = new MutationObserver(() => scanInputs());
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[NetWatch] AI Guardian Prompt & PII Shield active on', window.location.hostname);
    }
})();
