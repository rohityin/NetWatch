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
        badgeEl.textContent = 'Adult Content Blocked';
        descEl.textContent = `Access to ${domain || 'this website'} is restricted. Explicit adult content is not allowed on this device.`;
    } else if (type === 'DEEPFAKE_NSFW') {
        badgeEl.className = 'badge threat';
        badgeEl.textContent = 'AI Deepfake & Photo Tool';
        descEl.textContent = `Access to ${domain || 'this website'} is paused. Unregulated AI photo generators and face-swapping tools can create fake images and leak private photos.`;
    } else if (type === 'STUDY_ONLY') {
        badgeEl.className = 'badge';
        badgeEl.textContent = 'Study Mode Active';
        descEl.textContent = `Access to ${domain || 'this website'} is paused during study hours. Only approved homework and learning tools (like Brainly, Quizlet, and Photomath) are available right now.`;
    } else if (type === 'THREAT') {
        badgeEl.className = 'badge threat';
        badgeEl.textContent = 'Harmful Website Blocked';
        descEl.textContent = `Access to ${domain || 'this website'} is paused because it is flagged as unsafe or contains inappropriate content for young users.`;
    } else if (type === 'COMPANION') {
        badgeEl.className = 'badge';
        badgeEl.textContent = 'AI Chatbot Companion';
        descEl.textContent = 'This website runs AI chatbots programmed to simulate human relationships. Chatbots are computer programs, not real friends, and they record everything you type. NetWatch paused access to protect your privacy and well-being.';
    }
});
