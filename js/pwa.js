(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const phoneViewport = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    const tabletLandscapeViewport = 'width=600, maximum-scale=1.0, user-scalable=no';
    const syncLandscapeLayout = () => {
        if (!viewportMeta) return;
        const shortSide = Math.min(window.screen.width, window.screen.height);
        const isLandscapePhone = window.innerWidth > window.innerHeight && shortSide <= 600;
        const nextViewport = isLandscapePhone ? tabletLandscapeViewport : phoneViewport;
        if (viewportMeta.getAttribute('content') !== nextViewport) {
            viewportMeta.setAttribute('content', nextViewport);
        }
    };
    syncLandscapeLayout();
    window.addEventListener('orientationchange', () => window.setTimeout(syncLandscapeLayout, 80));
    window.addEventListener('resize', () => window.setTimeout(syncLandscapeLayout, 80));

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
    const isMobile = Math.min(window.screen.width, window.screen.height) <= 600;
    const choice = document.getElementById('install-choice');
    const installButton = document.getElementById('btn-install-app');
    const browserButton = document.getElementById('btn-use-browser');
    const iosGuide = document.getElementById('install-ios-guide');
    let deferredInstallPrompt = null;

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        });
    }

    if (!choice || isStandalone || !isMobile || sessionStorage.getItem('install-choice-dismissed')) return;
    choice.hidden = false;

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredInstallPrompt = event;
    });

    installButton?.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            choice.hidden = true;
            return;
        }
        if (iosGuide) iosGuide.hidden = false;
    });

    browserButton?.addEventListener('click', () => {
        sessionStorage.setItem('install-choice-dismissed', '1');
        choice.hidden = true;
    });

    window.addEventListener('appinstalled', () => {
        choice.hidden = true;
    });
})();
