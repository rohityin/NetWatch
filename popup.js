/**
 * NetWatch: Family AI Guardian
 * Swiss Editorial Bento Controller for popup.html
 * Dynamically binds data to the Warm Paper & Ink aesthetic
 */
document.addEventListener('DOMContentLoaded', () => {
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
                console.warn(`[NetWatch Popup] Could not reach relay at ${base}${endpoint}, trying fallback...`);
            }
        }
        throw lastError || new Error('Relay server unreachable on both cloud and localhost.');
    }

    // Header Elements
    const headerRoleTag = document.getElementById('headerRoleTag');
    const headerStatusBadge = document.getElementById('headerStatusBadge');
    const statusDot = document.getElementById('statusDot');
    const statusBadgeText = document.getElementById('statusBadgeText');

    // View Panels
    const unconfiguredView = document.getElementById('unconfiguredView');
    const childView = document.getElementById('childView');
    const parentView = document.getElementById('parentView');

    // View 0: Unconfigured
    const btnLaunchOnboarding = document.getElementById('btnLaunchOnboarding');

    // View 1: Child Shield
    const childLinkStatusText = document.getElementById('childLinkStatusText');
    const childPairingCodeDisplay = document.getElementById('childPairingCodeDisplay');
    const childPolicyText = document.getElementById('childPolicyText');
    const childLinkTag = document.getElementById('childLinkTag');
    const childPairingSection = document.getElementById('childPairingSection');
    const childLinkedSection = document.getElementById('childLinkedSection');
    const childDeviceIdBadge = document.getElementById('childDeviceIdBadge');
    const btnToggleChildPairingCode = document.getElementById('btnToggleChildPairingCode');

    // View 2: Parent Command Center
    const parentActiveDeviceName = document.getElementById('parentActiveDeviceName');
    const parentDeviceOnlineDot = document.getElementById('parentDeviceOnlineDot');
    const toggleParentPairBtn = document.getElementById('toggleParentPairBtn');
    const parentPairForm = document.getElementById('parentPairForm');
    const parentPairInput = document.getElementById('parentPairInput');
    const submitParentPairBtn = document.getElementById('submitParentPairBtn');
    const parentPairError = document.getElementById('parentPairError');

    const parentDashboardSection = document.getElementById('parentDashboardSection');
    const parentScoreStatus = document.getElementById('parentScoreStatus');
    const parentScoreValue = document.getElementById('parentScoreValue');
    const parentScoreBar = document.getElementById('parentScoreBar');

    const parentCntCompanions = document.getElementById('parentCntCompanions');
    const parentCntPii = document.getElementById('parentCntPii');
    const parentCntDeepfakes = document.getElementById('parentCntDeepfakes');

    const parentModeSelect = document.getElementById('parentModeSelect');
    const parentPauseInternetToggle = document.getElementById('parentPauseInternetToggle');
    const parentCustomBlacklistInput = document.getElementById('parentCustomBlacklistInput');
    const parentAddBlacklistBtn = document.getElementById('parentAddBlacklistBtn');
    const parentBlacklistChipsContainer = document.getElementById('parentBlacklistChipsContainer');
    const parentPushPolicyBtn = document.getElementById('parentPushPolicyBtn');
    const parentPolicyFeedback = document.getElementById('parentPolicyFeedback');
    const parentAlertsList = document.getElementById('parentAlertsList');
    const parentDownloadAuditBtn = document.getElementById('parentDownloadAuditBtn');

    // Role Switcher & PIN Modal
    const btnSwitchRole = document.getElementById('btnSwitchRole');
    const pinModal = document.getElementById('pinModal');
    const switchPinInput = document.getElementById('switchPinInput');
    const btnCancelPin = document.getElementById('btnCancelPin');
    const btnConfirmSwitchRole = document.getElementById('btnConfirmSwitchRole');
    const switchPinError = document.getElementById('switchPinError');

    const statusMessage = document.getElementById('statusMessage');

    let activePairedDeviceId = null;
    let pollInterval = null;
    let customBlacklistChips = [];
    let isUserEditingBlacklist = false;

    function showView(viewElement) {
        unconfiguredView.classList.add('hidden');
        childView.classList.add('hidden');
        parentView.classList.add('hidden');
        if (viewElement) {
            viewElement.classList.remove('hidden');
        }
    }

    function setStatus(msg, isError = false) {
        if (!statusMessage) return;
        statusMessage.textContent = msg;
        statusMessage.className = `feedback-msg ${isError ? 'error' : 'success'}`;
        setTimeout(() => {
            if (statusMessage.textContent === msg) {
                statusMessage.textContent = '';
                statusMessage.className = 'feedback-msg';
            }
        }, 4000);
    }

    // -------------------------------------------------------------
    // INITIALIZATION & ROLE DETECTION
    // -------------------------------------------------------------
    chrome.runtime.sendMessage({ type: 'GET_ROLE' }, (res) => {
        if (chrome.runtime.lastError || !res || !res.role || !res.isOnboarded) {
            renderUnconfiguredView();
            return;
        }

        if (res.role === 'CHILD') {
            renderChildView();
        } else if (res.role === 'PARENT') {
            activePairedDeviceId = res.pairedDeviceId || null;
            if (!activePairedDeviceId) {
                chrome.storage.local.get(['pairedDeviceId'], (stored) => {
                    if (stored && stored.pairedDeviceId) {
                        activePairedDeviceId = stored.pairedDeviceId;
                    }
                    renderParentView();
                });
            } else {
                renderParentView();
            }
        } else {
            renderUnconfiguredView();
        }
    });

    // -------------------------------------------------------------
    // VIEW 0: UNCONFIGURED
    // -------------------------------------------------------------
    function renderUnconfiguredView() {
        showView(unconfiguredView);
        headerRoleTag.textContent = 'SETUP';
        headerRoleTag.className = 'role-pill';

        headerStatusBadge.className = 'status-pill warning';
        statusBadgeText.textContent = 'SETUP NEEDED';

        parentPushPolicyBtn.classList.add('hidden');
        parentDownloadAuditBtn.classList.add('hidden');

        btnLaunchOnboarding.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
            window.close();
        });
    }

    // -------------------------------------------------------------
    // VIEW 1: CHILD SHIELD
    // -------------------------------------------------------------
    function renderChildView() {
        showView(childView);
        headerRoleTag.textContent = 'CHILD';
        headerRoleTag.className = 'role-pill child';

        headerStatusBadge.className = 'status-pill';
        statusBadgeText.textContent = 'SHIELD ACTIVE';

        parentPushPolicyBtn.classList.add('hidden');
        parentDownloadAuditBtn.classList.add('hidden');

        fetchChildStatus();
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(fetchChildStatus, 2500);
    }

    let isChildCodeRevealed = false;

    function fetchChildStatus() {
        chrome.runtime.sendMessage({ type: 'GET_CHILD_STATUS' }, (res) => {
            if (!res || !res.success) return;

            // Display 6-digit pairing code
            if (res.pairingCode) {
                const code = String(res.pairingCode);
                childPairingCodeDisplay.textContent = code.length === 6 ? `${code.slice(0, 3)} - ${code.slice(3)}` : code;
            }

            if (res.deviceId && childDeviceIdBadge) {
                childDeviceIdBadge.textContent = res.deviceId;
            }

            // Display pairing status
            if (res.isPaired) {
                if (childLinkTag) {
                    childLinkTag.textContent = 'LINKED';
                    childLinkTag.style.backgroundColor = 'var(--color-sage-light)';
                    childLinkTag.style.color = 'var(--color-sage)';
                    childLinkTag.style.borderColor = 'var(--color-sage-border)';
                }

                // Hide the code once configured and linked
                if (!isChildCodeRevealed) {
                    if (childPairingSection) childPairingSection.classList.add('hidden');
                } else {
                    if (childPairingSection) childPairingSection.classList.remove('hidden');
                }
                if (childLinkedSection) childLinkedSection.classList.remove('hidden');
            } else {
                if (childLinkTag) {
                    childLinkTag.textContent = 'WAITING LINK';
                    childLinkTag.style.backgroundColor = 'var(--color-paper-subtle)';
                    childLinkTag.style.color = 'var(--color-ink)';
                    childLinkTag.style.borderColor = 'var(--color-paper-darkBorder)';
                }

                if (childLinkStatusText) {
                    childLinkStatusText.textContent = 'Device ready for pairing:';
                    childLinkStatusText.style.color = 'var(--color-ink)';
                }

                if (childPairingSection) childPairingSection.classList.remove('hidden');
                if (childLinkedSection) childLinkedSection.classList.add('hidden');
            }

            // Display active policy mode
            if (res.policy && res.policy.safetyMode) {
                const mode = res.policy.safetyMode;
                if (mode === 'STRICT') {
                    childPolicyText.textContent = 'Strict Protection Mode';
                } else if (mode === 'SUPERVISED') {
                    childPolicyText.textContent = 'Moderate Protection Mode';
                } else if (mode === 'STUDY_ONLY') {
                    childPolicyText.textContent = 'Study Only Mode';
                }
            }
        });
    }

    if (btnToggleChildPairingCode) {
        btnToggleChildPairingCode.addEventListener('click', () => {
            isChildCodeRevealed = !isChildCodeRevealed;
            if (isChildCodeRevealed) {
                if (childPairingSection) childPairingSection.classList.remove('hidden');
                btnToggleChildPairingCode.textContent = 'Hide pairing code';
            } else {
                if (childPairingSection) childPairingSection.classList.add('hidden');
                btnToggleChildPairingCode.textContent = 'Show pairing code';
            }
        });
    }

    // -------------------------------------------------------------
    // VIEW 2: PARENT COMMAND CENTER
    // -------------------------------------------------------------
    function renderParentView() {
        showView(parentView);
        headerRoleTag.textContent = 'PARENT';
        headerRoleTag.className = 'role-pill parent';

        headerStatusBadge.className = 'status-pill';
        statusBadgeText.textContent = 'COMMAND CENTER';

        parentPushPolicyBtn.classList.remove('hidden');
        parentDownloadAuditBtn.classList.remove('hidden');

        setupParentDashboard();
    }

    function setupParentDashboard() {
        if (!activePairedDeviceId) {
            parentActiveDeviceName.textContent = 'No Device Linked';
            parentDeviceOnlineDot.style.display = 'none';
            parentPairForm.classList.remove('hidden');
            parentDashboardSection.classList.add('hidden');
        } else {
            parentActiveDeviceName.textContent = `Child Device [${activePairedDeviceId}]`;
            parentPairForm.classList.add('hidden');
            parentDashboardSection.classList.remove('hidden');

            fetchParentDeviceData(activePairedDeviceId);
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(() => fetchParentDeviceData(activePairedDeviceId), 2500);
        }
    }

    // Toggle pairing box
    toggleParentPairBtn.addEventListener('click', () => {
        parentPairForm.classList.toggle('hidden');
        parentPairError.textContent = '';
        if (!parentPairForm.classList.contains('hidden')) {
            parentPairInput.focus();
        }
    });

    // Submit pairing code
    submitParentPairBtn.addEventListener('click', handleParentPairSubmit);
    parentPairInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleParentPairSubmit();
    });

    async function handleParentPairSubmit() {
        const code = parentPairInput.value.trim();
        if (code.length < 6) {
            parentPairError.textContent = 'Enter a valid 6-digit code.';
            return;
        }

        parentPairError.textContent = 'Connecting...';
        parentPairError.style.color = 'var(--color-ink-muted)';

        try {
            const res = await fetchRelay('/api/parent/pair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pairingCode: code })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                parentPairError.textContent = '';
                activePairedDeviceId = data.device.deviceId;
                chrome.storage.local.set({ pairedDeviceId: activePairedDeviceId });
                chrome.runtime.sendMessage({ type: 'SET_PAIRED_DEVICE', deviceId: activePairedDeviceId });

                parentPairForm.classList.add('hidden');
                parentPairInput.value = '';
                parentActiveDeviceName.textContent = `${data.device.deviceName || 'Child'} [${activePairedDeviceId}]`;
                parentDashboardSection.classList.remove('hidden');

                fetchParentDeviceData(activePairedDeviceId);
                if (pollInterval) clearInterval(pollInterval);
                pollInterval = setInterval(() => fetchParentDeviceData(activePairedDeviceId), 2500);
            } else {
                parentPairError.textContent = data.error || 'Invalid or expired code.';
                parentPairError.style.color = 'var(--color-terracotta)';
            }
        } catch (err) {
            parentPairError.textContent = 'Could not connect to Relay Server (cloud or localhost).';
            parentPairError.style.color = 'var(--color-terracotta)';
        }
    }

    // -------------------------------------------------------------
    // INTERACTIVE BLACKLIST CHIPS MANAGEMENT
    // -------------------------------------------------------------
    function renderBlacklistChips() {
        parentBlacklistChipsContainer.innerHTML = '';
        customBlacklistChips.forEach((domain) => {
            const chip = document.createElement('span');
            chip.className = 'chip-tag';
            chip.innerHTML = `
                <span>${domain}</span>
                <button type="button" class="chip-remove-btn" title="Remove ${domain}" data-domain="${domain}">×</button>
            `;
            parentBlacklistChipsContainer.appendChild(chip);
        });

        // Bind delete listeners
        parentBlacklistChipsContainer.querySelectorAll('.chip-remove-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const targetDomain = e.target.getAttribute('data-domain');
                customBlacklistChips = customBlacklistChips.filter((d) => d !== targetDomain);
                renderBlacklistChips();
            });
        });
    }

    function addBlacklistChipFromInput() {
        const val = parentCustomBlacklistInput.value.trim().toLowerCase();
        if (!val) return;

        // Split by comma in case user pasted multiple
        const parts = val.split(',').map((s) => s.trim()).filter(Boolean);
        parts.forEach((p) => {
            if (!customBlacklistChips.includes(p)) {
                customBlacklistChips.push(p);
            }
        });

        parentCustomBlacklistInput.value = '';
        renderBlacklistChips();
    }

    parentAddBlacklistBtn.addEventListener('click', addBlacklistChipFromInput);
    parentCustomBlacklistInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addBlacklistChipFromInput();
        }
    });

    parentCustomBlacklistInput.addEventListener('focus', () => { isUserEditingBlacklist = true; });
    parentCustomBlacklistInput.addEventListener('blur', () => { isUserEditingBlacklist = false; });

    // Fetch device dashboard telemetry from Relay
    async function fetchParentDeviceData(deviceId) {
        if (!deviceId) return;
        try {
            const res = await fetchRelay(`/api/parent/device?deviceId=${encodeURIComponent(deviceId)}`);
            if (!res.ok) return;
            const data = await res.json();
            if (!data.success || !data.device) return;

            const dev = data.device;
            parentActiveDeviceName.textContent = `${dev.deviceName || 'Child'} [${dev.deviceId}]`;
            parentDeviceOnlineDot.style.display = 'inline-block';
            parentDeviceOnlineDot.style.backgroundColor = dev.isOnline ? 'var(--color-sage)' : 'var(--color-ink-faint)';

            // Safety Score & Bento Bar
            const score = dev.safetyScore != null ? dev.safetyScore : 100;
            parentScoreValue.textContent = score;
            parentScoreBar.style.width = `${score}%`;

            if (score >= 80) {
                parentScoreBar.style.backgroundColor = 'var(--color-sage)';
                parentScoreStatus.style.color = 'var(--color-sage)';
                parentScoreStatus.innerHTML = `
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style="flex-shrink:0;">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Protected (Low Risk)</span>
                `;
            } else if (score >= 50) {
                parentScoreBar.style.backgroundColor = 'var(--color-ochre)';
                parentScoreStatus.style.color = 'var(--color-ochre)';
                parentScoreStatus.innerHTML = `
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style="flex-shrink:0;">
                        <path clip-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fill-rule="evenodd"></path>
                    </svg>
                    <span>Advisory: Threats Mitigated</span>
                `;
            } else {
                parentScoreBar.style.backgroundColor = 'var(--color-terracotta)';
                parentScoreStatus.style.color = 'var(--color-terracotta)';
                parentScoreStatus.innerHTML = `
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style="flex-shrink:0;">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Critical Threats Intercepted</span>
                `;
            }

            // Structured Ledger Rows
            const stats = dev.stats || {};
            parentCntCompanions.textContent = stats.companionBlocks || 0;
            parentCntPii.textContent = stats.piiShielded || 0;
            parentCntDeepfakes.textContent = stats.deepfakeBlocks || 0;

            // Policy Form Synchronization (prevent overwriting active inputs)
            if (dev.policy) {
                if (document.activeElement !== parentModeSelect) {
                    parentModeSelect.value = dev.policy.safetyMode || 'STRICT';
                }
                if (document.activeElement !== parentPauseInternetToggle) {
                    parentPauseInternetToggle.checked = !!dev.policy.pauseInternet;
                }
                if (!isUserEditingBlacklist && Array.isArray(dev.policy.customBlacklist)) {
                    if (JSON.stringify(customBlacklistChips) !== JSON.stringify(dev.policy.customBlacklist)) {
                        customBlacklistChips = [...dev.policy.customBlacklist];
                        renderBlacklistChips();
                    }
                }
            }

            // Real-Time Safety Interventions Stream
            const events = dev.recentEvents || [];
            if (events.length === 0) {
                parentAlertsList.innerHTML = '<div class="empty-alert-notice">No threat incidents reported yet. Browsing is safe.</div>';
            } else {
                parentAlertsList.innerHTML = '';
                events.slice(0, 15).forEach((ev) => {
                    const item = document.createElement('div');
                    const isCritical = ev.type.includes('BLOCKED') || ev.type.includes('CRISIS');
                    item.className = `alert-entry ${isCritical ? 'critical' : ''}`;

                    const timeStr = ev.timestamp ? ev.timestamp.split(' ')[1] || ev.timestamp : '';
                    let tag = '🛡️';
                    if (ev.type.includes('COMPANION')) tag = '🤖 Companion';
                    else if (ev.type.includes('DEEPFAKE') || ev.type.includes('NSFW')) tag = '🔞 Adult/NSFW';
                    else if (ev.type.includes('PII')) tag = '🔒 PII Shield';
                    else if (ev.type.includes('CRISIS')) tag = '🆘 Crisis';

                    let label = ev.note || ev.domain || ev.type;
                    if (label.length > 36) label = label.substring(0, 36) + '...';

                    item.innerHTML = `
                        <span class="alert-label" title="${ev.note || ev.type}">${tag}: ${label}</span>
                        <span class="alert-timestamp">${timeStr}</span>
                    `;
                    parentAlertsList.appendChild(item);
                });
            }
        } catch (err) {
            // Relay unreachable
        }
    }

    // Push Remote Policy Update
    parentPushPolicyBtn.addEventListener('click', async () => {
        if (!activePairedDeviceId) {
            parentPolicyFeedback.textContent = 'Please link a child device first.';
            parentPolicyFeedback.className = 'feedback-msg error';
            return;
        }

        const safetyMode = parentModeSelect.value;
        const pauseInternet = parentPauseInternetToggle.checked;

        parentPolicyFeedback.textContent = 'Pushing update...';
        parentPolicyFeedback.className = 'feedback-msg';

        try {
            const res = await fetchRelay('/api/parent/update-policy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId: activePairedDeviceId,
                    policy: {
                        safetyMode,
                        customBlacklist: customBlacklistChips,
                        pauseInternet
                    }
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                parentPolicyFeedback.textContent = '✓ Policy applied & synced to child!';
                parentPolicyFeedback.className = 'feedback-msg success';
                setTimeout(() => {
                    parentPolicyFeedback.textContent = '';
                    parentPolicyFeedback.className = 'feedback-msg';
                }, 3500);
            } else {
                parentPolicyFeedback.textContent = data.error || 'Failed to update policy.';
                parentPolicyFeedback.className = 'feedback-msg error';
            }
        } catch (err) {
            parentPolicyFeedback.textContent = 'Could not reach Relay Server (cloud or localhost).';
            parentPolicyFeedback.className = 'feedback-msg error';
        }
    });

    // Download Child Safety CSV Audit
    parentDownloadAuditBtn.addEventListener('click', () => {
        if (!activePairedDeviceId) {
            setStatus('No child device linked to export audit for.', true);
            return;
        }

        parentDownloadAuditBtn.disabled = true;
        setStatus('Initiating CSV audit download...');

        chrome.runtime.sendMessage({
            type: 'DOWNLOAD_CHILD_CSV',
            relayUrl: activeRelayUrl,
            deviceId: activePairedDeviceId
        }, (res) => {
            parentDownloadAuditBtn.disabled = false;
            if (res && res.success) {
                setStatus('Child audit export downloaded successfully!');
            } else {
                const exportUrl = `${activeRelayUrl}/api/parent/export-csv?deviceId=${encodeURIComponent(activePairedDeviceId)}`;
                chrome.tabs.create({ url: exportUrl });
                setStatus('Audit report opened in download tab.');
            }
        });
    });

    // -------------------------------------------------------------
    // ROLE SWITCHER / RE-RUN SETUP (MASTER PIN PROTECTED)
    // -------------------------------------------------------------
    btnSwitchRole.addEventListener('click', () => {
        pinModal.classList.remove('hidden');
        switchPinInput.value = '';
        switchPinError.textContent = '';
        switchPinInput.focus();
    });

    btnCancelPin.addEventListener('click', () => {
        pinModal.classList.add('hidden');
        switchPinInput.value = '';
        switchPinError.textContent = '';
    });

    btnConfirmSwitchRole.addEventListener('click', handleConfirmSwitchRole);
    switchPinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleConfirmSwitchRole();
        if (e.key === 'Escape') {
            pinModal.classList.add('hidden');
        }
    });

    function handleConfirmSwitchRole() {
        const pin = switchPinInput.value.trim();
        if (pin.length !== 4) {
            switchPinError.textContent = 'Enter the 4-digit Master Parent PIN.';
            return;
        }

        switchPinError.textContent = 'Verifying PIN...';
        switchPinError.style.color = 'var(--color-ink-muted)';

        chrome.runtime.sendMessage({ type: 'RESET_ROLE', pin }, (res) => {
            if (res && res.success) {
                pinModal.classList.add('hidden');
                if (pollInterval) clearInterval(pollInterval);
                window.close();
            } else {
                switchPinError.textContent = (res && res.error) || 'Incorrect Master PIN.';
                switchPinError.style.color = 'var(--color-terracotta)';
                switchPinInput.value = '';
                switchPinInput.focus();
            }
        });
    }
});
