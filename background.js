/**
 * NetWatch: Family AI Guardian
 * Unified Background Service Worker (Manifest V3)
 *
 * Automatically adapts based on device role selected during onboarding:
 * - CHILD MODE: Active threat interceptor, prompt guardian, local blacklist engine, telemetry push
 * - PARENT MODE: Administrative hub, remote child monitoring, policy dispatcher, CSV auditing
 */

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
            console.warn(`[NetWatch] Could not connect to relay at ${base}${endpoint}, trying fallback...`);
        }
    }
    throw lastError || new Error('Relay server unreachable on both cloud and localhost.');
}

const PIN_SALT = 'NetWatch-FamilyGuardian-Salt-v3';
const DEFAULT_PIN_HASH = '975b5a4dd484a13345133b7a8fd9a325cee974868a45104f433027e4306162e7'; // '0000'

// AI Classification Taxonomy
const AI_CATEGORIES = {
    COMPANION: [
        'character.ai', 'janitorai.com', 'chai.ml', 'replika.ai', 'replika.com',
        'talkie-ai.com', 'crushon.ai', 'spicychat.ai', 'candy.ai', 'nomi.ai',
        'anemone.ai', 'hiwaifu.com', 'moemate.io', 'charstar.ai', 'pephop.ai',
        'kajiwoto.com', 'botify.ai', 'kindroid.ai', 'soulmateai.com', 'joyland.ai',
        'paradot.ai', 'muah.ai', 'myanima.ai', 'chub.ai', 'yodayo.com'
    ],
    DEEPFAKE_NSFW: [
        'civitai.com', 'seaart.ai', 'faceswapper.ai', 'uncrop.ai', 'remaker.ai',
        'perchance.org', 'deepswap.ai', 'undress.app', 'clothoff.io', 'nudify.online',
        'deepnude.to', 'swapface.org', 'reface.ai', 'magickg.com', 'unstability.ai',
        'sexy.ai', 'deepfake-web.com'
    ],
    NSFW_ADULT: [
        'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'onlyfans.com',
        'redtube.com', 'chaturbate.com', 'youporn.com', 'stripchat.com', 'cam4.com',
        'bongacams.com', 'livejasmin.com', 'rule34.xxx', 'fapello.com', 'beeg.com',
        'spankbang.com', 'tube8.com', 'eporner.com', 'youjizz.com', 'motherless.com',
        'hqporner.com', 'porn.com', 'sex.com', 'brazzers.com', 'naughtyamerica.com',
        'realitykings.com', 'bangbros.com', 'evilangel.com', 'mofos.com', 'twistys.com',
        'tnaflix.com', 'thumbzilla.com', 'drtuber.com', 'nuvid.com', 'xtube.com',
        'pornmd.com', 'daftsex.com', 'txxx.com', 'upornia.com', 'vjav.com',
        'erome.com', 'bravoteens.com', 'heavy-r.com', 'porntrex.com', 'gotporn.com',
        'hotmovs.com', 'porngo.com', '4tube.com', 'fakku.net', 'nhentai.net',
        'hanime.tv', 'gelbooru.com', 'danbooru.donmai.us', 'e-hentai.org', 'luscious.net',
        'literotica.com', 'coomer.party', 'coomer.su', 'kemono.party', 'kemono.su',
        'fansly.com', 'manyvids.com', 'clips4sale.com', 'camsoda.com', 'myfreecams.com',
        'flirt4free.com', 'imlive.com', 'streamate.com', 'fetlife.com', 'adultfriendfinder.com',
        'alt.com', 'ashley-madison.com', 'sniffies.com', 'grindr.com', 'scruff.com',
        'hentaihaven.xxx', 'simply-hentai.com', 'tsumino.com', 'hitomi.la', 'pururin.io',
        'camversity.com', 'camwhores.tv', 'camwhores.net', 'loyalfans.com', 'fancentro.com',
        'porntube.com', 'slutload.com', 'sunporno.com', 'empflix.com', 'porn300.com'
    ],
    GENERAL_LLM: [
        'chatgpt.com', 'openai.com', 'claude.ai', 'gemini.google.com',
        'perplexity.ai', 'poe.com', 'deepseek.com', 'copilot.microsoft.com'
    ],
    HOMEWORK: [
        'brainly.com', 'photomath.com', 'mathway.com', 'coursehero.com',
        'quizlet.com', 'symbolab.com'
    ]
};

const ADULT_KEYWORD_REGEX = /(?:^|[\.\-_])(?:porn|porno|xxx|hentai|erotic|sexcam|camgirl|nudity|nsfw|deepnude|undress|nudify|stripchat|chaturbate|xvideos|xhamster|redtube|spankbang|pornhub|brazzers|onlyfans|fansly|rule34)(?:[\.\-_]|$)/i;

const blacklist = new Set();
let blacklistLoadedPromise = null;

function ensureBlacklistLoaded() {
    if (blacklist.size > 0) return Promise.resolve();
    if (!blacklistLoadedPromise) {
        blacklistLoadedPromise = fetch(chrome.runtime.getURL('blacklist.txt'))
            .then(res => res.text())
            .then(data => {
                data.split(/\r?\n/).forEach(line => {
                    const item = line.trim().toLowerCase();
                    if (item) blacklist.add(item);
                });
                console.log(`[NetWatch] Loaded ${blacklist.size} threat domains.`);
            })
            .catch(err => {
                console.error('[NetWatch] Blacklist load error:', err);
                blacklistLoadedPromise = null;
            });
    }
    return blacklistLoadedPromise;
}

ensureBlacklistLoaded();

// Hash PIN helper
async function hashPin(pin) {
    const data = new TextEncoder().encode(`${PIN_SALT}:${pin}`);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Global Device Configuration
let deviceConfig = {
    role: null, // 'CHILD' | 'PARENT' | null
    isOnboarded: false,
    parentPinHash: DEFAULT_PIN_HASH,
    childState: {
        deviceId: null,
        pairingCode: null,
        isPaired: false,
        policy: {
            safetyMode: 'STRICT',
            customBlacklist: [],
            pauseInternet: false
        },
        stats: {
            companionBlocks: 0,
            deepfakeBlocks: 0,
            piiShielded: 0,
            crisisInterventions: 0,
            aiVisits: 0
        },
        pendingEvents: [],
        pendingVisits: []
    },
    parentState: {
        pairedDeviceId: null,
        relayUrl: CLOUD_RELAY_URL
    }
};

// Initialize configuration from storage
let configPromise = null;
function ensureConfigLoaded() {
    if (!configPromise) {
        configPromise = (async () => {
            const stored = await new Promise(resolve => {
                chrome.storage.local.get(['netwatchUnifiedConfig'], res => resolve(res.netwatchUnifiedConfig));
            });

            if (stored) {
                deviceConfig = { ...deviceConfig, ...stored };
            }

            if (deviceConfig.role === 'CHILD' && deviceConfig.isOnboarded) {
                await initChildMode();
            }
            return deviceConfig;
        })();
    }
    return configPromise;
}

function saveConfig() {
    chrome.storage.local.set({ netwatchUnifiedConfig: deviceConfig });
}

ensureConfigLoaded();

// Launch onboarding on extension install
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
    }
});

// -------------------------------------------------------------
// CHILD MODE ENGINE
// -------------------------------------------------------------

async function initChildMode() {
    if (!deviceConfig.childState.deviceId) {
        deviceConfig.childState.deviceId = `CH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }

    // Register with Relay
    try {
        const res = await fetchRelay('/api/child/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deviceId: deviceConfig.childState.deviceId,
                deviceName: "Child's Device"
            })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                deviceConfig.childState.pairingCode = data.pairingCode;
                deviceConfig.childState.isPaired = data.isPaired;
                if (data.policy) deviceConfig.childState.policy = data.policy;
                console.log(`[Child Shield] Device registered: ${deviceConfig.childState.deviceId} | Code: ${data.pairingCode}`);
            }
        }
    } catch (e) {
        console.log('[Child Shield] Running in local standalone mode.');
    }
    saveConfig();
}

// Child Telemetry & Remote Policy Pull
async function flushChildTelemetry() {
    await ensureConfigLoaded();
    if (deviceConfig.role !== 'CHILD' || !deviceConfig.childState.deviceId) return;

    try {
        const payload = {
            deviceId: deviceConfig.childState.deviceId,
            events: deviceConfig.childState.pendingEvents.splice(0, 20),
            visits: deviceConfig.childState.pendingVisits.splice(0, 50),
            stats: deviceConfig.childState.stats
        };

        const res = await fetchRelay('/api/child/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                deviceConfig.childState.isPaired = data.isPaired;
                if (data.policy) deviceConfig.childState.policy = data.policy;
                saveConfig();
            }
        } else {
            // Re-queue
            deviceConfig.childState.pendingEvents = [...payload.events, ...deviceConfig.childState.pendingEvents];
            deviceConfig.childState.pendingVisits = [...payload.visits, ...deviceConfig.childState.pendingVisits];
        }
    } catch (err) {
        // Relay offline
    }
}

// Active interval while service worker is alive
setInterval(flushChildTelemetry, 3500);

// Chrome Alarm for persistent background sync across service worker restarts
chrome.alarms.create('telemetrySync', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'telemetrySync') {
        flushChildTelemetry();
    }
});

function classifyAiDomain(hostname) {
    if (!hostname) return null;
    const cleanHost = hostname.toLowerCase();

    // Fast-path adult keyword check
    if (ADULT_KEYWORD_REGEX.test(cleanHost)) {
        return { category: 'NSFW_ADULT', matchedDomain: cleanHost };
    }

    for (const [category, domains] of Object.entries(AI_CATEGORIES)) {
        for (const domain of domains) {
            if (cleanHost === domain || cleanHost.endsWith('.' + domain)) {
                return { category, matchedDomain: domain };
            }
        }
    }
    return null;
}

function isDomainThreatBlacklisted(hostname, policy) {
    if (!hostname) return false;
    const cleanHost = hostname.toLowerCase();

    if (policy && Array.isArray(policy.customBlacklist)) {
        for (const customDomain of policy.customBlacklist) {
            const trimmed = customDomain.trim().toLowerCase();
            if (trimmed && (cleanHost === trimmed || cleanHost.endsWith('.' + trimmed))) {
                return true;
            }
        }
    }

    if (blacklist.has(cleanHost)) return true;

    const parts = cleanHost.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
        const parent = parts.slice(i).join('.');
        if (blacklist.has(parent)) return true;
    }
    return false;
}

function getFormattedTimestamp() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// Pre-Navigation Interceptor (Only active in CHILD role!)
async function evaluateChildNavigation(tabId, rawUrl) {
    await ensureConfigLoaded();
    if (deviceConfig.role !== 'CHILD') return false;
    if (!rawUrl || !tabId) return false;

    let urlObj;
    try {
        urlObj = new URL(rawUrl);
    } catch {
        return false;
    }

    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
    }

    const hostname = urlObj.hostname;
    const aiClassification = classifyAiDomain(hostname);
    const policy = deviceConfig.childState.policy || { safetyMode: 'STRICT' };
    const timestamp = getFormattedTimestamp();

    // 0. Remote Internet Pause
    if (policy.pauseInternet) {
        const redirectUrl = chrome.runtime.getURL(`blocked.html?type=STUDY_ONLY&domain=Family+Pause`);
        chrome.tabs.update(tabId, { url: redirectUrl });
        return true;
    }

    // 1. AI Safety & NSFW Adult Verification
    if (aiClassification) {
        const category = aiClassification.category;

        // NSFW / Adult Content is blocked under all child policies
        if (category === 'NSFW_ADULT') {
            deviceConfig.childState.stats.deepfakeBlocks++;
            deviceConfig.childState.pendingEvents.unshift({
                type: 'NSFW_BLOCKED',
                domain: hostname,
                timestamp,
                note: `Pre-emptively halted navigation to adult/NSFW platform (${hostname}).`
            });
            deviceConfig.childState.pendingVisits.unshift({ url: rawUrl, timestamp, visitType: 'BLOCKED: NSFW' });
            saveConfig();

            const redirectUrl = chrome.runtime.getURL(`blocked.html?type=NSFW_ADULT&domain=${encodeURIComponent(hostname)}`);
            chrome.tabs.update(tabId, { url: redirectUrl });
            return true;
        }

        if (category === 'COMPANION' && policy.safetyMode === 'STRICT') {
            deviceConfig.childState.stats.companionBlocks++;
            deviceConfig.childState.pendingEvents.unshift({
                type: 'COMPANION_BLOCKED',
                domain: hostname,
                timestamp,
                note: `Pre-emptively halted navigation to synthetic companion (${hostname}).`
            });
            deviceConfig.childState.pendingVisits.unshift({ url: rawUrl, timestamp, visitType: 'BLOCKED: COMPANION' });
            saveConfig();

            const redirectUrl = chrome.runtime.getURL(`blocked.html?type=COMPANION&domain=${encodeURIComponent(hostname)}`);
            chrome.tabs.update(tabId, { url: redirectUrl });
            return true;
        }

        if (category === 'DEEPFAKE_NSFW' && (policy.safetyMode === 'STRICT' || policy.safetyMode === 'SUPERVISED')) {
            deviceConfig.childState.stats.deepfakeBlocks++;
            deviceConfig.childState.pendingEvents.unshift({
                type: 'DEEPFAKE_BLOCKED',
                domain: hostname,
                timestamp,
                note: `Pre-emptively halted navigation to deepfake tool (${hostname}).`
            });
            deviceConfig.childState.pendingVisits.unshift({ url: rawUrl, timestamp, visitType: 'BLOCKED: DEEPFAKE' });
            saveConfig();

            const redirectUrl = chrome.runtime.getURL(`blocked.html?type=DEEPFAKE_NSFW&domain=${encodeURIComponent(hostname)}`);
            chrome.tabs.update(tabId, { url: redirectUrl });
            return true;
        }

        if (policy.safetyMode === 'STUDY_ONLY' && (category === 'COMPANION' || category === 'GENERAL_LLM')) {
            deviceConfig.childState.pendingVisits.unshift({ url: rawUrl, timestamp, visitType: 'BLOCKED: STUDY_MODE' });
            saveConfig();
            const redirectUrl = chrome.runtime.getURL(`blocked.html?type=STUDY_ONLY&domain=${encodeURIComponent(hostname)}`);
            chrome.tabs.update(tabId, { url: redirectUrl });
            return true;
        }

        deviceConfig.childState.stats.aiVisits++;
        saveConfig();
    }

    // 2. Blacklist Verification
    await ensureBlacklistLoaded();
    if (isDomainThreatBlacklisted(hostname, policy)) {
        deviceConfig.childState.pendingVisits.unshift({ url: rawUrl, timestamp, visitType: 'BLOCKED: BLACKLIST' });
        saveConfig();
        const redirectUrl = chrome.runtime.getURL(`blocked.html?type=THREAT&domain=${encodeURIComponent(hostname)}`);
        chrome.tabs.update(tabId, { url: redirectUrl });
        return true;
    }

    // 3. Normal Clean Browsing
    deviceConfig.childState.pendingVisits.unshift({ url: rawUrl, timestamp, visitType: 'VISIT' });
    if (deviceConfig.childState.pendingVisits.length > 500) deviceConfig.childState.pendingVisits.pop();
    saveConfig();
    return false;
}

chrome.webNavigation.onBeforeNavigate.addListener(details => {
    if (details.frameId === 0 && details.url) {
        evaluateChildNavigation(details.tabId, details.url);
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
    if (details.frameId === 0 && details.url) {
        evaluateChildNavigation(details.tabId, details.url);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && (changeInfo.url.startsWith('http:') || changeInfo.url.startsWith('https:'))) {
        evaluateChildNavigation(tabId, changeInfo.url);
    }
});

// -------------------------------------------------------------
// RUNTIME MESSAGING DISPATCHER
// -------------------------------------------------------------

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request) return;

    (async () => {
        await ensureConfigLoaded();

        // Check Role
        if (request.type === 'GET_ROLE') {
            sendResponse({
                role: deviceConfig.role,
                isOnboarded: deviceConfig.isOnboarded,
                pairedDeviceId: deviceConfig.parentState.pairedDeviceId
            });
            return;
        }

        // Complete Onboarding
        if (request.type === 'COMPLETE_ONBOARDING') {
            deviceConfig.isOnboarded = true;
            if (request.pairedDeviceId) {
                deviceConfig.parentState.pairedDeviceId = request.pairedDeviceId;
            }
            saveConfig();
            sendResponse({ success: true, isOnboarded: true });
            return;
        }

        // Save Paired Child Device for Parent
        if (request.type === 'SET_PAIRED_DEVICE') {
            deviceConfig.parentState.pairedDeviceId = request.deviceId;
            saveConfig();
            sendResponse({ success: true });
            return;
        }

        // Set Role during onboarding
        if (request.type === 'SET_ROLE') {
            deviceConfig.role = request.role;
            saveConfig();
            if (request.role === 'CHILD') await initChildMode();
            sendResponse({ success: true, role: deviceConfig.role });
            return;
        }

        // Master PIN setup
        if (request.type === 'SET_MASTER_PIN') {
            const hashed = await hashPin(request.pin);
            deviceConfig.parentPinHash = hashed;
            saveConfig();
            sendResponse({ success: true });
            return;
        }

        // Verify PIN for role reset or admin actions
        if (request.type === 'VERIFY_MASTER_PIN') {
            const hashed = await hashPin(request.pin);
            const matches = (hashed === deviceConfig.parentPinHash);
            sendResponse({ success: matches });
            return;
        }

        // Switch/Reset Role (PIN protected)
        if (request.type === 'RESET_ROLE') {
            const hashed = await hashPin(request.pin);
            if (hashed !== deviceConfig.parentPinHash) {
                sendResponse({ success: false, error: 'Incorrect Master PIN.' });
                return;
            }
            deviceConfig.role = null;
            deviceConfig.isOnboarded = false;
            saveConfig();
            chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
            sendResponse({ success: true });
            return;
        }

        // Query Child Status (for child popup / onboarding)
        if (request.type === 'GET_CHILD_STATUS') {
            sendResponse({
                success: true,
                deviceId: deviceConfig.childState.deviceId,
                pairingCode: deviceConfig.childState.pairingCode,
                isPaired: deviceConfig.childState.isPaired,
                policy: deviceConfig.childState.policy
            });
            return;
        }

        // AI Safety Alert from content script
        if (request.type === 'AI_SAFETY_ALERT' && deviceConfig.role === 'CHILD') {
            const timestamp = getFormattedTimestamp();
            if (request.alertType === 'PII_INTERCEPTED') {
                deviceConfig.childState.stats.piiShielded++;
                deviceConfig.childState.pendingEvents.unshift({
                    type: 'PII_SHIELDED',
                    domain: request.domain,
                    timestamp,
                    note: `Prevented leak of ${request.details} in prompt.`
                });
            } else if (request.alertType === 'CRISIS_INTERCEPTION') {
                deviceConfig.childState.stats.crisisInterventions++;
                deviceConfig.childState.pendingEvents.unshift({
                    type: 'CRISIS_SUPPORT_TRIGGERED',
                    domain: request.domain,
                    timestamp,
                    note: 'Crisis keywords intercepted; crisis lifeline displayed.'
                });
            }
            saveConfig();
            flushChildTelemetry();
            sendResponse({ received: true });
            return;
        }

        // CSV Audit Download Trigger for Parent
        if (request.type === 'DOWNLOAD_CHILD_CSV') {
            const base = request.relayUrl || activeRelayUrl;
            const downloadUrl = `${base}/api/parent/export-csv?deviceId=${encodeURIComponent(request.deviceId)}`;
            chrome.downloads.download({
                url: downloadUrl,
                filename: `netwatch_child_audit_${request.deviceId}.csv`,
                saveAs: false
            }, downloadId => {
                if (chrome.runtime.lastError) {
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ success: true, downloadId });
                }
            });
            return;
        }
    })();

    return true; // Keep message channel open for async response
});
