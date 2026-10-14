/**
 * NetWatch: Access Paused Controller
 * Clean, CSP-compliant controller for blocked.html
 */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'COMPANION';
    const domain = params.get('domain') || '';

    const titleEl = document.getElementById('title');
    const badgeEl = document.getElementById('badge');
    const descEl = document.getElementById('description');
    const backBtn = document.getElementById('backBtn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.close();
            }
        });
    }

    if (type === 'NSFW_ADULT') {
        badgeEl.className = 'badge threat';
        badgeEl.textContent = 'Adult / Explicit Content Blocked';
        descEl.textContent = `Access to ${domain || 'this website'} has been restricted. Adult content, pornography, and sexually explicit platforms are blocked on this device.`;
    } else if (type === 'DEEPFAKE_NSFW') {
        badgeEl.className = 'badge threat';
        badgeEl.textContent = 'Synthetic Media / Deepfake Generator';
        descEl.textContent = `Access to ${domain || 'this platform'} has been blocked. AI image generators and face-swapping tools are restricted to safeguard minors.`;
    } else if (type === 'STUDY_ONLY') {
        badgeEl.className = 'badge';
        badgeEl.textContent = 'Study Mode Active';
        descEl.textContent = `Access to ${domain || 'this platform'} is restricted. Only verified educational and homework tools are allowed during Study Mode.`;
    } else if (type === 'THREAT') {
        badgeEl.className = 'badge threat';
        badgeEl.textContent = 'Threat Domain Blocked';
        descEl.textContent = `The destination ${domain || ''} is flagged on the security blacklist. Navigation halted.`;
    } else if (type === 'COMPANION') {
        badgeEl.className = 'badge';
        badgeEl.textContent = 'AI Companion Bot';
        descEl.textContent = 'This platform simulates emotional attachment with non-human synthetic bots. NetWatch has paused access for your emotional safety and privacy.';
    }
});
