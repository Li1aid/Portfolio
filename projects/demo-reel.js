// A silent recording of the real interaction. Only load the active, visible film.
(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const savedData = navigator.connection?.saveData;
    const playerByHost = new WeakMap();
    const formatTime = seconds => '0:' + String(Math.floor(seconds || 0)).padStart(2, '0');
    const ready = host => {
        if (!host || playerByHost.has(host)) return playerByHost.get(host);
        const poster = document.createElement('img');
        poster.alt = '';
        const video = document.createElement('video');
        video.className = 'reel-film';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'none';
        video.setAttribute('aria-hidden', 'true');
        const bar = document.createElement('div');
        bar.className = 'reel-bar';
        bar.innerHTML = '<button type="button" class="reel-toggle"></button><input class="reel-scrub" type="range" min="0" max="100" step="0.5" value="0"><span class="reel-clock" aria-hidden="true">0:00</span>';
        const toggle = bar.querySelector('button');
        const scrub = bar.querySelector('input');
        const clock = bar.querySelector('.reel-clock');
        let slug, language = 'en', visible = false, consent = false, paused = false;
        function label() {
            const zh = language === 'zh';
            const playing = !video.paused;
            host.classList.toggle('reel-playing', playing);
            toggle.setAttribute('aria-label', playing ? (zh ? '暂停预览' : 'Pause preview') : (zh ? '播放预览' : 'Play preview'));
            scrub.setAttribute('aria-label', zh ? '预览进度' : 'Preview position');
            scrub.setAttribute('aria-valuetext', formatTime(video.currentTime));
        }
        function load() {
            if (!video.hasAttribute('src')) video.src = '../Assets/demo-reels/' + slug + '.mp4';
        }
        function sync() {
            if (visible && !document.hidden && !paused && (consent || (!reduced.matches && !savedData))) {
                load();
                video.play().catch(() => label());
            } else {
                video.pause();
            }
        }
        function select(project) {
            slug = project;
            host.dataset.reel = slug;
            video.pause();
            video.removeAttribute('src');
            video.poster = poster.src = '../Assets/demo-reels/' + slug + '.webp';
            video.load();
            scrub.value = 0;
            clock.textContent = '0:00';
            bar.hidden = false;
            label();
            sync();
        }
        function setLanguage(value) { language = value; label(); }
        host.classList.add('reel-ready');
        host.replaceChildren(poster, video, bar);
        const observer = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            sync();
        }, { threshold: 0.05 });
        observer.observe(host);
        toggle.addEventListener('click', () => {
            paused = !video.paused;
            consent = !paused;
            sync();
        });
        scrub.addEventListener('input', () => {
            load();
            const seek = () => { if (video.duration) video.currentTime = video.duration * scrub.value / 100; };
            if (video.readyState) seek();
            else video.addEventListener('loadedmetadata', seek, {once:true});
        });
        video.addEventListener('timeupdate', () => {
            if (video.duration) scrub.value = 100 * video.currentTime / video.duration;
            clock.textContent = formatTime(video.currentTime);
            scrub.setAttribute('aria-valuetext', clock.textContent);
        });
        video.addEventListener('play', label);
        video.addEventListener('pause', label);
        video.addEventListener('error', () => { if (video.hasAttribute('src')) bar.hidden = true; });
        reduced.addEventListener('change', () => { consent = false; sync(); });
        document.addEventListener('visibilitychange', sync);
        document.addEventListener('portfolio:language', e => setLanguage(e.detail.lang));
        const api = {select, setLanguage};
        playerByHost.set(host,api);
        select(host.dataset.reel);
        setLanguage(document.body.classList.contains('lang-zh') || document.documentElement.lang.startsWith('zh') ? 'zh' : 'en');
        return api;
    };
    window.portfolioDemoReel = ready;
    document.querySelectorAll('[data-reel]').forEach(ready);
})();
