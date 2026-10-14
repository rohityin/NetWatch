/**
 * NetWatch: Family AI Guardian
 * Content Script: In-Page AI Prompt & PII Guardian
 * Runs on generative AI and chatbot domains (ChatGPT, Claude, Gemini, etc.)
 * to prevent PII harvesting, predatory grooming patterns, and crisis risks.
 *
 * Hardened Architecture:
 * 1. Synchronous startup at document_start (registered before page frameworks)
 * 2. Multi-fallback selector resolution for modern ChatGPT (ProseMirror / Lexical / #prompt-textarea)
 * 3. Synchronous capture-phase interception on keydown (Enter) & click (Send)
 * 4. Multi-trigger real-time typing & paste scanning (input, paste, keyup)
 * 5. Instant visual toast alert with Swiss Editorial styling and 1-click sanitization
 */

(function () {
    if (window.__netwatchGuardianLoaded) return;
    window.__netwatchGuardianLoaded = true;

    console.log('%c[NetWatch] AI Prompt & PII Guardian ACTIVE on ' + window.location.hostname, 'background: #D94825; color: #fff; font-weight: bold; padding: 3px 8px; border-radius: 4px;');

    let isChildRole = true;

    // Check device role in background (non-blocking)
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'GET_ROLE' }, (res) => {
                if (chrome.runtime.lastError) {
                    // Ignore, keep protection active
                } else if (res && res.role) {
                    isChildRole = (res.role === 'CHILD');
                }
            });
        }
    } catch (e) {
        // Fallback
    }

    // Detection Patterns
    const PII_PATTERNS = [
        {
            type: 'Phone Number',
            regex: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/gi
        },
        {
            type: 'Email Address',
            regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
        },
        {
            type: 'Street Address',
            regex: /\b\d{1,5}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl|Terrace|Ter|Circle|Cir|Trail|Trl|Parkway|Pkwy|Alley|Aly|Cove|Cv|Loop|Square|Sq|Highway|Hwy)\b/gi
        },
        {
            type: 'Sensitive Card / ID',
            regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/gi
        }
    ];

    const CRISIS_PATTERNS = [
        /\b(?:kill myself|want to die|commit suicide|end my life|hurt myself|cutting myself|hate my life|how to starve myself|suicidal)\b/i
    ];

    let activeToast = null;
    let crisisModalActive = false;

    // Locate the prompt container using all known modern LLM DOM patterns
    function findPromptContainer(el) {
        if (el && typeof el.closest === 'function') {
            const found = el.closest('#prompt-textarea, [contenteditable="true"], [contenteditable="plaintext-only"], [role="textbox"], textarea, input[type="text"]');
            if (found) return found;
        }

        // Active element check
        if (document.activeElement && typeof document.activeElement.closest === 'function') {
            const found = document.activeElement.closest('#prompt-textarea, [contenteditable="true"], [contenteditable="plaintext-only"], [role="textbox"], textarea, input[type="text"]');
            if (found) return found;
        }

        // Global DOM query fallback
        return document.querySelector('#prompt-textarea, [role="textbox"], [contenteditable="true"], [contenteditable="plaintext-only"], textarea');
    }

    // Extract text from element or page prompt container
    function extractPromptText(container) {
        if (!container) return '';
        if (container.id === 'prompt-textarea' || container.closest('#prompt-textarea')) {
            const root = container.id === 'prompt-textarea' ? container : container.closest('#prompt-textarea');
            return (root.innerText || root.textContent || '').trim();
        }
        if (container.isContentEditable || container.getAttribute('contenteditable') !== null || container.getAttribute('role') === 'textbox') {
            return (container.innerText || container.textContent || '').trim();
        }
        return (container.value || '').trim();
    }

    // Analyze prompt text
    function analyzePrompt(text) {
        if (!text || text.length < 5) {
            return { hasRisk: false };
        }

        // Crisis detection
        for (const pattern of CRISIS_PATTERNS) {
            if (pattern.test(text)) {
                return { hasRisk: true, isCrisis: true };
            }
        }

        // PII detection
        const foundPii = [];
        for (const p of PII_PATTERNS) {
            p.regex.lastIndex = 0;
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

    // Sanitize PII
    function sanitizeText(text) {
        let clean = text;
        for (const p of PII_PATTERNS) {
            p.regex.lastIndex = 0;
            clean = clean.replace(p.regex, `[REDACTED ${p.type.toUpperCase()}]`);
        }
        return clean;
    }

    // Apply sanitization safely to ProseMirror / React
    function applySanitization(container) {
        const target = findPromptContainer(container);
        if (!target) return;

        const rawText = extractPromptText(target);
        const cleanText = sanitizeText(rawText);

        target.focus();

        if (target.isContentEditable || target.getAttribute('contenteditable') !== null || target.id === 'prompt-textarea' || target.getAttribute('role') === 'textbox') {
            // Select contents
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(target);
            selection.removeAllRanges();
            selection.addRange(range);

            let inserted = false;
            try {
                inserted = document.execCommand('insertText', false, cleanText);
            } catch (e) {
                inserted = false;
            }

            // Fallback for custom virtual DOM
            if (!inserted || target.innerText.trim() !== cleanText.trim()) {
                const p = document.createElement('p');
                p.textContent = cleanText;
                target.innerHTML = '';
                target.appendChild(p);
            }

            target.dispatchEvent(new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertReplacementText',
                data: cleanText
            }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            const proto = window.HTMLTextAreaElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (nativeSetter) {
                nativeSetter.call(target, cleanText);
            } else {
                target.value = cleanText;
            }
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // Show floating PII warning banner
    function showPiiWarning(targetContainer, piiItems) {
        if (activeToast) activeToast.remove();

        const typesList = piiItems.map(i => i.type).join(', ');

        const toast = document.createElement('div');
        toast.id = 'netwatch-pii-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '85px';
        toast.style.right = '28px';
        toast.style.maxWidth = '390px';
        toast.style.backgroundColor = '#F9F6F0';
        toast.style.border = '2px solid #D94825';
        toast.style.borderRadius = '12px';
        toast.style.boxShadow = '0 20px 50px rgba(24, 22, 21, 0.3)';
        toast.style.padding = '16px 18px';
        toast.style.zIndex = '2147483647';
        toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        toast.style.color = '#181615';
        toast.style.fontSize = '13px';
        toast.style.lineHeight = '1.45';
        toast.style.display = 'flex';
        toast.style.flexDirection = 'column';
        toast.style.gap = '10px';
        toast.style.animation = 'netwatchSlideIn 0.25s ease-out';

        toast.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E5DDD3; padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 7px;">
                    <span style="font-size: 16px;">🛡️</span>
                    <span style="font-weight: 700; font-size: 13px; color: #D94825; letter-spacing: 0.3px;">
                        NETWATCH AI SHIELD
                    </span>
                </div>
                <button id="netwatch-toast-close" type="button" style="background: none; border: none; color: #9E978F; cursor: pointer; font-size: 18px; line-height: 1; padding: 0 4px;">✕</button>
            </div>
            <div>
                <div style="font-weight: 700; color: #181615; margin-bottom: 3px;">
                    Private Personal Data Detected:
                </div>
                <div style="color: #65605B; font-size: 12.5px;">
                    You entered <strong style="color: #D94825;">${typesList}</strong>. AI chatbots store prompts in server memory and can expose your home address or private identity.
                </div>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 2px;">
                <button id="netwatch-sanitize-btn" type="button" style="flex: 1; padding: 8px 14px; background-color: #D94825; color: #FFFFFF; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12.5px; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(217, 72, 37, 0.25);">
                    <span>✨ Sanitize Prompt</span>
                </button>
                <button id="netwatch-dismiss-btn" type="button" style="padding: 8px 12px; background: #FFFFFF; color: #65605B; border: 1px solid #D8CEC2; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                    Dismiss
                </button>
            </div>
        `;

        const styleEl = document.createElement('style');
        styleEl.textContent = `
            @keyframes netwatchSlideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styleEl);
        document.body.appendChild(toast);
        activeToast = toast;

        // Dispatches telemetry alert
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    type: 'AI_SAFETY_ALERT',
                    alertType: 'PII_INTERCEPTED',
                    details: typesList,
                    domain: window.location.hostname
                });
            }
        } catch (e) {}

        document.getElementById('netwatch-toast-close').onclick = () => {
            toast.remove();
            activeToast = null;
        };
        document.getElementById('netwatch-dismiss-btn').onclick = () => {
            toast.remove();
            activeToast = null;
        };
        document.getElementById('netwatch-sanitize-btn').onclick = () => {
            applySanitization(targetContainer);
            toast.remove();
            activeToast = null;
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
        overlay.style.backgroundColor = 'rgba(24, 22, 21, 0.85)';
        overlay.style.backdropFilter = 'blur(6px)';
        overlay.style.zIndex = '2147483647';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        overlay.innerHTML = `
            <div style="background: #F9F6F0; border: 2px solid #3F5E4D; border-radius: 16px; width: 440px; max-width: 90vw; padding: 28px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35); color: #181615; text-align: center;">
                <div style="font-size: 38px; margin-bottom: 8px;">💙</div>
                <h2 style="font-size: 20px; font-weight: 700; color: #3F5E4D; margin-bottom: 10px;">
                    You Are Not Alone
                </h2>
                <p style="font-size: 13.5px; color: #65605B; line-height: 1.5; margin-bottom: 18px;">
                    AI chatbots are computer algorithms and cannot replace human care. If you are going through a difficult time, please connect with a real person who wants to help you.
                </p>
                
                <div style="background: #FFFFFF; border: 1px solid #D8CEC2; border-radius: 10px; padding: 14px 16px; text-align: left; margin-bottom: 20px; font-size: 13px;">
                    <div style="margin-bottom: 8px; color: #3F5E4D; font-weight: 700;">Free, 24/7 Confidential Support:</div>
                    <div style="margin-bottom: 6px;">📞 <strong>Call or Text 988</strong> – Suicide & Crisis Lifeline</div>
                    <div style="margin-bottom: 6px;">💬 <strong>Text HOME to 741741</strong> – Crisis Text Line</div>
                    <div>🌈 <strong>Call 1-866-488-7386</strong> – The Trevor Project</div>
                </div>

                <button id="netwatch-close-crisis" type="button" style="padding: 10px 24px; background: #3F5E4D; color: #FFFFFF; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 2px 8px rgba(63, 94, 77, 0.3);">
                    I Understand
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    type: 'AI_SAFETY_ALERT',
                    alertType: 'CRISIS_INTERCEPTION',
                    details: 'Crisis keywords detected in AI prompt',
                    domain: window.location.hostname
                });
            }
        } catch (e) {}

        document.getElementById('netwatch-close-crisis').onclick = () => {
            overlay.remove();
            crisisModalActive = false;
        };
    }

    // -------------------------------------------------------------
    // SYNCHRONOUS CAPTURE PHASE LISTENERS (ATTACHED TO WINDOW)
    // -------------------------------------------------------------

    // 1. Enter Key Interception
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
            const target = findPromptContainer(e.target);
            const text = extractPromptText(target);
            const analysis = analyzePrompt(text);

            if (analysis.hasRisk) {
                // Synchronously halt submission
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                if (analysis.isCrisis) {
                    showCrisisIntervention();
                } else if (analysis.isPii) {
                    showPiiWarning(target, analysis.piiItems);
                }
            }
        }
    }, true);

    // 2. Mouse Click on Send Button Interception
    window.addEventListener('click', (e) => {
        const sendBtn = e.target.closest('button, [role="button"]');
        if (!sendBtn) return;

        const aria = (sendBtn.getAttribute('aria-label') || '').toLowerCase();
        const testId = (sendBtn.getAttribute('data-testid') || '').toLowerCase();
        const textContent = (sendBtn.textContent || '').trim().toLowerCase();
        const isSendAction = aria.includes('send') || testId.includes('send') || textContent === 'send' || sendBtn.type === 'submit';

        if (isSendAction) {
            const target = findPromptContainer(e.target);
            const text = extractPromptText(target);
            const analysis = analyzePrompt(text);

            if (analysis.hasRisk) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                if (analysis.isCrisis) {
                    showCrisisIntervention();
                } else if (analysis.isPii) {
                    showPiiWarning(target, analysis.piiItems);
                }
            }
        }
    }, true);

    // 3. Typing & Paste Real-Time Monitoring
    let debounceTimer;
    function handleInputScan(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const target = findPromptContainer(e.target);
            const text = extractPromptText(target);
            const analysis = analyzePrompt(text);

            if (analysis.hasRisk) {
                if (analysis.isCrisis) {
                    showCrisisIntervention();
                } else if (analysis.isPii) {
                    showPiiWarning(target, analysis.piiItems);
                }
            } else {
                if (activeToast) {
                    activeToast.remove();
                    activeToast = null;
                }
            }
        }, 300);
    }

    window.addEventListener('input', handleInputScan, true);
    window.addEventListener('paste', handleInputScan, true);
    window.addEventListener('keyup', handleInputScan, true);

})();
