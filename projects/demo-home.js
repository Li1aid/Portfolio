// The original covers remain visible until someone points at a project or focuses its link.
(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');
    if (navigator.connection?.saveData) return;
    document.querySelectorAll('#showcase .project-image').forEach(cover => {
        const link = cover.querySelector('.project-btn');
        const slug = link?.getAttribute('href')?.match(/^projects\/([\w-]+)\.html$/)?.[1];
        if (!slug) return;
        let film, timer;
        function start() {
            if (reduced.matches || !hover.matches || document.hidden) return;
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (!film) {
                    film = document.createElement('video');
                    film.className = 'works-motion';
                    film.setAttribute('aria-hidden','true');
                    film.muted = true;
                    film.loop = true;
                    film.playsInline = true;
                    film.src = 'Assets/demo-reels/' + slug + '.mp4';
                    link.before(film);
                    film.addEventListener('playing', () => film.classList.add('is-playing'));
                }
                film.play().catch(() => {});
            },240);
        }
        function stop() {
            clearTimeout(timer);
            if (!film) return;
            film.pause();
            film.classList.remove('is-playing');
        }
        cover.addEventListener('pointerenter',start);
        cover.addEventListener('pointerleave',stop);
        cover.addEventListener('focusin',start);
        cover.addEventListener('focusout',stop);
        reduced.addEventListener('change',stop);
        document.addEventListener('visibilitychange',stop);
    });
})();
