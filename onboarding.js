document.addEventListener('DOMContentLoaded', () => {
    let selectedRole = null;
    const CLOUD_RELAY_URL = 'https://netwatch-w7c2.onrender.com';
    const LOCAL_RELAY_URL = 'http://localhost:3000';
    let activeRelayUrl = CLOUD_RELAY_URL;

    async function fetchRelay(endpoint, options = {}, timeoutMs = 4000) {
        const candidates = [activeRelayUrl, activeRelayUrl === CLOUD_RELAY_URL ? LOCAL_RELAY_URL : CLOUD_RELAY_URL];
        let lastError = null;

        for (const base of candidates) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), timeoutMs);
                const res = await fetch(`${base}${endpoint}`, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timer);
                activeRelayUrl = base;
                return res;
            } catch (err) {
                lastError = err;
                console.warn(`[NetWatch Onboarding] Could not connect to relay at ${base}${endpoint}, trying fallback...`);
            }
        }
        throw lastError || new Error('Relay server unreachable on both cloud and localhost.');
    }

    let childPollTimer = null;
    let pairedDevice = null;
    let selectedPolicyMode = 'STRICT';

    const headerTag = document.getElementById('headerTag');
    const stepIndicator = document.getElementById('stepIndicator');

    // Role selection
    const stepRole = document.getElementById('stepRole');
    const selectChildRole = document.getElementById('selectChildRole');
    const selectParentRole = document.getElementById('selectParentRole');

    // Child steps
    const stepChild1 = document.getElementById('stepChild1');
    const stepChild2 = document.getElementById('stepChild2');
    const stepChild3 = document.getElementById('stepChild3');
    const childPairingCode = document.getElementById('childPairingCode');
    const pairingLiveStatus = document.getElementById('pairingLiveStatus');

    // Parent steps
    const stepParent1 = document.getElementById('stepParent1');
    const stepParent2 = document.getElementById('stepParent2');
    const stepParent3 = document.getElementById('stepParent3');
    const stepParent4 = document.getElementById('stepParent4');
    const createPinInput = document.getElementById('createPinInput');
    const confirmPinInput = document.getElementById('confirmPinInput');
    const pinSetupError = document.getElementById('pinSetupError');
    const parentPairCode = document.getElementById('parentPairCode');
    const parentPairStatus = document.getElementById('parentPairStatus');
    const sumDevice = document.getElementById('sumDevice');
    const sumMode = document.getElementById('sumMode');

    function hideAllSteps() {
        document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    }

    function updateIndicator(stepIdx) {
        const dots = document.querySelectorAll('.step-dot');
        const lines = document.querySelectorAll('.step-line');
        dots.forEach((dot, idx) => {
            dot.classList.remove('active', 'completed');
            if (idx === stepIdx) dot.classList.add('active');
            else if (idx < stepIdx) dot.classList.add('completed');
        });
        lines.forEach((line, idx) => {
            if (idx < stepIdx) line.classList.add('completed');
            else line.classList.remove('completed');
        });
    }

    // ---------------------------------------------------------
    // STEP 0: Role Selection Handlers
    // ---------------------------------------------------------
    selectChildRole.addEventListener('click', () => {
        selectedRole = 'CHILD';
        headerTag.textContent = 'Child Shield';
        headerTag.style.background = 'var(--color-sage-light)';
        headerTag.style.color = 'var(--color-sage)';
        headerTag.style.borderColor = 'var(--color-sage-border)';

        chrome.runtime.sendMessage({ type: 'SET_ROLE', role: 'CHILD' }, (res) => {
            hideAllSteps();
            stepChild1.classList.add('active');
            updateIndicator(1);
            startChildPairingPoll();
        });
    });

    selectParentRole.addEventListener('click', () => {
        selectedRole = 'PARENT';
        headerTag.textContent = 'Parent Hub';
        headerTag.style.background = 'var(--color-ochre-light)';
        headerTag.style.color = 'var(--color-ochre)';
        headerTag.style.borderColor = 'var(--color-ochre-border)';

        chrome.runtime.sendMessage({ type: 'SET_ROLE', role: 'PARENT' }, (res) => {
            hideAllSteps();
            stepParent1.classList.add('active');
            updateIndicator(1);
            createPinInput.focus();
        });
    });

    // ---------------------------------------------------------
    // CHILD FLOW
    // ---------------------------------------------------------
    function startChildPairingPoll() {
        fetchChildCode();
        if (childPollTimer) clearInterval(childPollTimer);
        childPollTimer = setInterval(fetchChildCode, 1500);
    }

    function fetchChildCode() {
        chrome.runtime.sendMessage({ type: 'GET_CHILD_STATUS' }, (res) => {
            if (!res || !res.success) return;

            if (res.pairingCode) {
                const c = res.pairingCode;
                childPairingCode.textContent = c.length === 6 ? `${c.slice(0, 3)} - ${c.slice(3)}` : c;
            }

            if (res.isPaired) {
                pairingLiveStatus.innerHTML = '<span style="color:var(--color-sage)">✓ Successfully Linked to Parent!</span>';
                setTimeout(() => {
                    if (stepChild1.classList.contains('active')) {
                        hideAllSteps();
                        stepChild2.classList.add('active');
                        updateIndicator(2);
                    }
                }, 1000);
            }
        });
    }

    document.getElementById('btnChild1Back').addEventListener('click', () => {
        if (childPollTimer) clearInterval(childPollTimer);
        hideAllSteps();
        stepRole.classList.add('active');
        updateIndicator(0);
        headerTag.textContent = 'Family Setup';
        headerTag.style.background = 'var(--color-paper-border)';
        headerTag.style.color = 'var(--color-ink-muted)';
        headerTag.style.borderColor = 'var(--color-paper-darkBorder)';
    });

    document.getElementById('btnChild1Next').addEventListener('click', () => {
        if (childPollTimer) clearInterval(childPollTimer);
        hideAllSteps();
        stepChild2.classList.add('active');
        updateIndicator(2);
    });

    document.getElementById('btnChild2Back').addEventListener('click', () => {
        hideAllSteps();
        stepChild1.classList.add('active');
        updateIndicator(1);
        startChildPairingPoll();
    });

    document.getElementById('btnChild2Next').addEventListener('click', () => {
        hideAllSteps();
        stepChild3.classList.add('active');
        updateIndicator(3);
    });

    document.getElementById('btnChildFinish').addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'COMPLETE_ONBOARDING' }, () => {
            window.close();
        });
    });

    // ---------------------------------------------------------
    // PARENT FLOW
    // ---------------------------------------------------------

    // Parent Step 1: Create PIN
    document.getElementById('btnParent1Back').addEventListener('click', () => {
        hideAllSteps();
        stepRole.classList.add('active');
        updateIndicator(0);
        headerTag.textContent = 'Family Setup';
    });

    document.getElementById('btnParent1Next').addEventListener('click', () => {
        const p1 = createPinInput.value.trim();
        const p2 = confirmPinInput.value.trim();

        if (p1.length !== 4 || isNaN(p1)) {
            pinSetupError.textContent = 'PIN must be exactly 4 digits.';
            return;
        }

        if (p1 !== p2) {
            pinSetupError.textContent = 'PINs do not match. Please try again.';
            return;
        }

        chrome.runtime.sendMessage({ type: 'SET_MASTER_PIN', pin: p1 }, (res) => {
            if (res && res.success) {
                hideAllSteps();
                stepParent2.classList.add('active');
                updateIndicator(2);
                parentPairCode.focus();
            } else {
                pinSetupError.textContent = 'Could not save PIN.';
            }
        });
    });

    // Parent Step 2: Link Child Device
    document.getElementById('btnParent2Back').addEventListener('click', () => {
        hideAllSteps();
        stepParent1.classList.add('active');
        updateIndicator(1);
    });

    document.getElementById('btnParent2Skip').addEventListener('click', () => {
        hideAllSteps();
        stepParent3.classList.add('active');
        updateIndicator(2);
    });

    document.getElementById('btnParent2Pair').addEventListener('click', async () => {
        const code = parentPairCode.value.trim();
        if (code.length < 6) {
            parentPairStatus.textContent = 'Please enter a valid 6-digit code.';
            parentPairStatus.style.color = 'var(--color-terracotta)';
            return;
        }

        parentPairStatus.textContent = 'Verifying pairing code with Relay Server...';
        parentPairStatus.style.color = 'var(--color-ink-muted)';

        try {
            const res = await fetchRelay('/api/parent/pair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pairingCode: code })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                pairedDevice = data.device;
                chrome.storage.local.set({ pairedDeviceId: pairedDevice.deviceId });
                chrome.runtime.sendMessage({ type: 'SET_PAIRED_DEVICE', deviceId: pairedDevice.deviceId });
                parentPairStatus.textContent = `Connected to ${pairedDevice.deviceName || 'Child'} [${pairedDevice.deviceId}]!`;
                parentPairStatus.style.color = 'var(--color-sage)';

                setTimeout(() => {
                    hideAllSteps();
                    stepParent3.classList.add('active');
                    updateIndicator(2);
                }, 800);
            } else {
                parentPairStatus.textContent = data.error || 'Invalid or expired code.';
                parentPairStatus.style.color = 'var(--color-terracotta)';
            }
        } catch (err) {
            parentPairStatus.textContent = 'Could not connect to Relay Server (Cloud or Localhost).';
            parentPairStatus.style.color = 'var(--color-terracotta)';
        }
    });

    // Parent Step 3: Policy Selection
    const policyRadios = document.querySelectorAll('.policy-radio');
    policyRadios.forEach(label => {
        label.addEventListener('click', () => {
            policyRadios.forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');
            const radio = label.querySelector('input[type="radio"]');
            if (radio) selectedPolicyMode = radio.value;
        });
    });

    document.getElementById('btnParent3Back').addEventListener('click', () => {
        hideAllSteps();
        stepParent2.classList.add('active');
        updateIndicator(2);
    });

    document.getElementById('btnParent3Next').addEventListener('click', async () => {
        const checkedTags = Array.from(document.querySelectorAll('.tag-checkbox input:checked')).map(i => i.value);

        if (pairedDevice) {
            try {
                await fetchRelay('/api/parent/update-policy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deviceId: pairedDevice.deviceId,
                        policy: {
                            safetyMode: selectedPolicyMode,
                            customBlacklist: checkedTags
                        }
                    })
                });
            } catch (e) {
                console.warn('Could not push initial policy to relay:', e);
            }
        }

        sumDevice.textContent = pairedDevice ? `${pairedDevice.deviceName} [${pairedDevice.deviceId}]` : 'None linked yet';
        sumMode.textContent = selectedPolicyMode === 'STRICT' ? 'Strict Protection Mode' : (selectedPolicyMode === 'SUPERVISED' ? 'Supervised AI Mode' : 'Study Only Mode');

        hideAllSteps();
        stepParent4.classList.add('active');
        updateIndicator(3);
    });

    // Parent Step 4: Finish
    document.getElementById('btnParentFinish').addEventListener('click', () => {
        chrome.runtime.sendMessage({
            type: 'COMPLETE_ONBOARDING',
            pairedDeviceId: pairedDevice ? pairedDevice.deviceId : null
        }, () => {
            window.close();
        });
    });
});
