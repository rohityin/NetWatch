/**
 * NetWatch Relay Server
 * Lightweight, zero-dependency Node.js HTTP server.
 * Connects Child Browser Extensions with Parent Browser Extensions
 * across different browsers and computers.
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// In-Memory Device & Family Registry
const devices = new Map(); // deviceId -> DeviceState
const pairingCodes = new Map(); // 6-digit code -> deviceId

function generatePairingCode() {
    let code;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (pairingCodes.has(code));
    return code;
}

// Request helper to parse JSON bodies
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

// Response helper with CORS headers
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        return res.end();
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    try {
        // Health check endpoint
        if (pathname === '/api/health' && method === 'GET') {
            return sendJson(res, 200, { status: 'ONLINE', timestamp: Date.now() });
        }

        // -------------------------------------------------------------
        // CHILD EXTENSION ENDPOINTS
        // -------------------------------------------------------------

        // 1. Register or Heartbeat Child Device
        if (pathname === '/api/child/register' && method === 'POST') {
            const body = await parseJsonBody(req);
            const deviceId = body.deviceId || `CH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            let device = devices.get(deviceId);
            if (!device) {
                const pairingCode = generatePairingCode();
                device = {
                    deviceId,
                    pairingCode,
                    deviceName: body.deviceName || 'Child Device',
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
                    safetyEvents: [],
                    browsingHistory: [],
                    lastHeartbeat: Date.now()
                };
                devices.set(deviceId, device);
                pairingCodes.set(pairingCode, deviceId);
                console.log(`[Relay] Registered new child device ${deviceId} with pairing code: ${pairingCode}`);
            } else {
                device.lastHeartbeat = Date.now();
            }

            return sendJson(res, 200, {
                success: true,
                deviceId: device.deviceId,
                pairingCode: device.pairingCode,
                isPaired: device.isPaired,
                policy: device.policy
            });
        }

        // 2. Child Ingests Telemetry & Polls Remote Policy
        if (pathname === '/api/child/telemetry' && method === 'POST') {
            const body = await parseJsonBody(req);
            const { deviceId, events, visits, stats } = body;

            const device = devices.get(deviceId);
            if (!device) {
                return sendJson(res, 404, { success: false, error: 'Device not registered.' });
            }

            device.lastHeartbeat = Date.now();

            if (stats) {
                device.stats = { ...device.stats, ...stats };
            }

            if (Array.isArray(events) && events.length > 0) {
                device.safetyEvents = [...events, ...device.safetyEvents].slice(0, 300);
            }

            if (Array.isArray(visits) && visits.length > 0) {
                device.browsingHistory = [...visits, ...device.browsingHistory].slice(0, 1000);
            }

            // Return current active policy so child enforces latest parent settings immediately
            return sendJson(res, 200, {
                success: true,
                policy: device.policy,
                isPaired: device.isPaired
            });
        }

        // -------------------------------------------------------------
        // PARENT EXTENSION ENDPOINTS
        // -------------------------------------------------------------

        // 3. Parent Pairs with Child via 6-Digit Pairing Code
        if (pathname === '/api/parent/pair' && method === 'POST') {
            const body = await parseJsonBody(req);
            const inputCode = String(body.pairingCode || '').trim();

            const deviceId = pairingCodes.get(inputCode);
            if (!deviceId || !devices.has(deviceId)) {
                return sendJson(res, 400, { success: false, error: 'Invalid or expired Pairing Code.' });
            }

            const device = devices.get(deviceId);
            device.isPaired = true;
            console.log(`[Relay] Parent successfully paired with device ${deviceId}!`);

            return sendJson(res, 200, {
                success: true,
                device: {
                    deviceId: device.deviceId,
                    deviceName: device.deviceName,
                    policy: device.policy,
                    stats: device.stats,
                    safetyEvents: device.safetyEvents.slice(0, 20),
                    lastHeartbeat: device.lastHeartbeat
                }
            });
        }

        // 4. Parent Queries Real-Time Child Metrics & Event Stream
        if (pathname === '/api/parent/device' && method === 'GET') {
            const deviceId = parsedUrl.query.deviceId;
            const device = devices.get(deviceId);

            if (!device) {
                return sendJson(res, 404, { success: false, error: 'Device not found.' });
            }

            const isOnline = (Date.now() - device.lastHeartbeat) < 30000; // Active within 30s

            // Calculate live AI Safety Score
            let score = 100;
            score -= (device.stats.companionBlocks * 6);
            score -= (device.stats.deepfakeBlocks * 8);
            score -= (device.stats.piiShielded * 4);
            score -= (device.stats.crisisInterventions * 15);
            score = Math.max(10, Math.min(100, score));

            return sendJson(res, 200, {
                success: true,
                device: {
                    deviceId: device.deviceId,
                    deviceName: device.deviceName,
                    isOnline,
                    safetyScore: score,
                    policy: device.policy,
                    stats: device.stats,
                    recentEvents: device.safetyEvents.slice(0, 25),
                    lastHeartbeat: device.lastHeartbeat
                }
            });
        }

        // 5. Parent Remotely Updates Policy (Mode, Blacklist, Internet Pause)
        if (pathname === '/api/parent/update-policy' && method === 'POST') {
            const body = await parseJsonBody(req);
            const { deviceId, policy } = body;

            const device = devices.get(deviceId);
            if (!device) {
                return sendJson(res, 404, { success: false, error: 'Device not found.' });
            }

            if (policy) {
                if (policy.safetyMode) device.policy.safetyMode = policy.safetyMode;
                if (Array.isArray(policy.customBlacklist)) device.policy.customBlacklist = policy.customBlacklist;
                if (typeof policy.pauseInternet === 'boolean') device.policy.pauseInternet = policy.pauseInternet;
            }

            console.log(`[Relay] Parent updated policy for ${deviceId}:`, device.policy);
            return sendJson(res, 200, { success: true, policy: device.policy });
        }

        // 6. Parent Downloads Full Child Safety Audit (CSV)
        if (pathname === '/api/parent/export-csv' && method === 'GET') {
            const deviceId = parsedUrl.query.deviceId;
            const device = devices.get(deviceId);

            if (!device) {
                return sendJson(res, 404, { success: false, error: 'Device not found.' });
            }

            let csv = 'Log Type,Target / URL,Timestamp,Details\r\n';
            device.safetyEvents.forEach(e => {
                const type = `"${(e.type || '').replace(/"/g, '""')}"`;
                const domain = `"${(e.domain || '').replace(/"/g, '""')}"`;
                const ts = `"${(e.timestamp || '').replace(/"/g, '""')}"`;
                const note = `"${(e.note || '').replace(/"/g, '""')}"`;
                csv += `${type},${domain},${ts},${note}\r\n`;
            });

            device.browsingHistory.forEach(b => {
                const type = `"${(b.visitType || 'VISIT').replace(/"/g, '""')}"`;
                const urlStr = `"${(b.url || '').replace(/"/g, '""')}"`;
                const ts = `"${(b.timestamp || '').replace(/"/g, '""')}"`;
                csv += `${type},${urlStr},${ts},"Standard visit"\r\n`;
            });

            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename=netwatch_child_audit_${deviceId}.csv`,
                'Access-Control-Allow-Origin': '*'
            });
            return res.end(csv);
        }

        // 404 Not Found
        return sendJson(res, 404, { success: false, error: 'Endpoint not found.' });

    } catch (err) {
        console.error('[Relay Server Error]:', err);
        return sendJson(res, 500, { success: false, error: 'Internal Server Error' });
    }
});

server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🛡️  NetWatch Relay Server running on port ${PORT}`);
    console.log(`📡 Local endpoint: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
