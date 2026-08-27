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

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        });
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
    const isMobile = Math.min(window.screen.width, window.screen.height) <= 600;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/i.test(ua)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

    const choice = document.getElementById('install-choice');
    const installButton = document.getElementById('btn-install-app');
    const browserButton = document.getElementById('btn-use-browser');
    const guideOverlay = document.getElementById('install-guide-overlay');
    const guideSymbol = document.getElementById('install-guide-symbol');
    const guideTitle = document.getElementById('install-guide-title');
    const guideLead = document.getElementById('install-guide-lead');
    const guideSteps = document.getElementById('install-guide-steps');
    const guideNote = document.getElementById('install-guide-note');
    const guideInstallButton = document.getElementById('btn-guide-install');
    const guideCloseButton = document.getElementById('btn-guide-close');
    let deferredInstallPrompt = null;

    if (!choice || isStandalone || sessionStorage.getItem('install-choice-dismissed')) return;

    const setSteps = steps => {
        if (!guideSteps) return;
        guideSteps.replaceChildren(...steps.map(text => {
            const item = document.createElement('li');
            item.textContent = text;
            return item;
        }));
    };

    const showGuide = () => {
        if (!guideOverlay) return;
        if (isIOS) {
            guideSymbol.textContent = '□↑';
            guideTitle.textContent = 'iPhone・iPadで追加する方法';
            guideLead.textContent = 'Safariから、次の順番で操作してください。';
            setSteps([
                'このページをSafariで開きます',
                '画面下の共有ボタン「□↑」をタップします',
                'メニューの「ホーム画面に追加」を選びます',
                '右上の「追加」をタップして完了です'
            ]);
            guideNote.textContent = isSafari
                ? '追加後は、ホーム画面の「三角比ドリル」から起動してください。'
                : '現在のブラウザーでは直接追加できません。Safariでこのページを開き直してください。';
            guideInstallButton.hidden = true;
        } else {
            guideSymbol.textContent = '＋';
            guideTitle.textContent = isAndroid ? 'Androidのホーム画面へ追加' : 'アプリとして追加';
            guideLead.textContent = '追加すると、次回からすぐに全画面で使えます。';
            setSteps(deferredInstallPrompt ? [
                '下の「インストール画面を開く」を押します',
                'ブラウザーの確認画面で「インストール」を押します',
                isAndroid ? 'ホーム画面の「三角比ドリル」から起動します' : '追加された「三角比ドリル」を起動します'
            ] : isAndroid ? [
                'Chrome右上のメニュー「︙」をタップします',
                '「アプリをインストール」または「ホーム画面に追加」を選びます',
                '確認画面で「インストール」を押して完了です'
            ] : [
                'アドレスバー右側のインストールアイコンを押します',
                '確認画面で「インストール」を押します',
                '追加された「三角比ドリル」を起動します'
            ]);
            guideInstallButton.hidden = !deferredInstallPrompt;
            guideNote.textContent = deferredInstallPrompt
                ? 'インストールの最終確認は、ブラウザーの画面で行います。'
                : 'この案内を見ながら、ブラウザーのメニューを順番に操作してください。';
        }
        guideOverlay.hidden = false;
        document.body.classList.add('install-guide-open');
    };

    const closeGuide = (dismissChoice = false) => {
        if (guideOverlay) guideOverlay.hidden = true;
        document.body.classList.remove('install-guide-open');
        if (dismissChoice) {
            sessionStorage.setItem('install-choice-dismissed', '1');
            choice.hidden = true;
        }
    };

    if (isMobile) choice.hidden = false;

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredInstallPrompt = event;
        choice.hidden = false;
        if (!guideOverlay?.hidden && !isIOS) showGuide();
    });

    installButton?.addEventListener('click', showGuide);

    guideInstallButton?.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const result = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        if (result.outcome === 'accepted') {
            closeGuide(true);
        } else {
            guideInstallButton.hidden = true;
            guideNote.textContent = '今回は追加されませんでした。あとからブラウザーのメニューでも追加できます。';
        }
    });

    browserButton?.addEventListener('click', () => closeGuide(true));
    guideCloseButton?.addEventListener('click', () => closeGuide(true));

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        closeGuide(true);
    });
})();
