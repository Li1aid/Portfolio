/* ── Chunks 语块 · interactive product demo ─────────────────────────────
   Mirrors the real PWA's three core screens (翻译 / 卡片 / 复习).
   Translations and phrases are pre-baked (no API call); scheduling uses
   the same simplified SM-2 as the shipped app (nextSchedule in app.js). */

(function () {
    const chinese = () => document.querySelector('.lang-option.active')?.dataset.lang === 'zh';
    const local = (en, zh) => chinese() ? zh : en;
    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // ── Pre-baked "Claude" results (synthetic, but shaped like the real prompt output)
    const SAMPLES = [
        {
            zh: '这个方案我觉得有点悬，先别急着拍板。',
            en: "I'm not sure this plan will fly — let's not rush the decision.",
            phrases: [
                { en: 'will fly', zh: '（计划）能成、行得通', example: "I don't think the idea will fly with the board." },
                { en: 'rush the decision', zh: '急着拍板', example: "Let's sleep on it rather than rush the decision." }
            ]
        },
        {
            zh: '我今天有点不在状态，能不能改天再聊？',
            en: "I'm a bit off today — can we pick this up another day?",
            phrases: [
                { en: 'a bit off', zh: '不在状态', example: 'Sorry if I seem a bit off, I barely slept.' },
                { en: 'pick this up another day', zh: '改天再聊', example: "It's late — let's pick this up another day." }
            ]
        },
        {
            zh: '房东又涨房租了，我得开始看别的地方了。',
            en: "My landlord's put the rent up again, so I'd better start looking around.",
            phrases: [
                { en: 'put the rent up', zh: '涨房租', example: 'They put the rent up by $40 a week.' },
                { en: "I'd better start looking around", zh: '我得开始看别的地方了', example: "If this keeps up I'd better start looking around." }
            ]
        }
    ];

    // ── Seed deck (synthetic). ease / interval / reps / due mirror the real card schema.
    let cards = [
        { id: 1, en: 'on the same page', zh: '想法一致', example: "Let's make sure we're on the same page before the call.", ease: 2.6, interval: 4 * DAY, reps: 3, due: now - 2 * 60 * 60 * 1000, createdAt: now - 9 * DAY },
        { id: 2, en: 'call it a day', zh: '今天到此为止', example: "It's 7pm — let's call it a day.", ease: 2.5, interval: DAY, reps: 1, due: now - 30 * 60 * 1000, createdAt: now - 3 * DAY },
        { id: 3, en: 'get back to you', zh: '回头答复你', example: "I'll check with the team and get back to you tomorrow.", ease: 2.55, interval: 2 * DAY, reps: 2, due: now - 10 * 60 * 1000, createdAt: now - 6 * DAY },
        { id: 4, en: 'a bit of a stretch', zh: '有点勉强', example: 'Finishing by Friday is a bit of a stretch.', ease: 2.5, interval: 2 * DAY, reps: 2, due: now + 1.5 * DAY, createdAt: now - 4 * DAY },
        { id: 5, en: 'play it by ear', zh: '走一步看一步', example: "No fixed plan for Sunday — we'll play it by ear.", ease: 2.85, interval: 21 * DAY, reps: 6, due: now + 12 * DAY, createdAt: now - 40 * DAY },
        { id: 6, en: 'keep me posted', zh: '有进展告诉我', example: 'Keep me posted on how the interview goes.', ease: 2.75, interval: 14 * DAY, reps: 5, due: now + 6 * DAY, createdAt: now - 30 * DAY }
    ];
    let nextId = 100;

    // ── The app's real scheduler (copied from yuyukai/app.js, unchanged)
    function nextSchedule(card, rate) {
        let { ease, interval, reps } = card;
        if (rate === 'bad') {
            reps = 0; interval = DAY; ease = Math.max(1.3, ease - 0.2);
        } else if (rate === 'mid') {
            reps = reps + 1;
            if (reps === 1) interval = DAY;
            else if (reps === 2) interval = 2 * DAY;
            else interval = Math.round(interval * 1.3);
            ease = Math.max(1.3, ease - 0.05);
        } else if (rate === 'good') {
            reps = reps + 1;
            if (reps === 1) interval = DAY;
            else if (reps === 2) interval = 4 * DAY;
            else interval = Math.round(interval * ease);
            ease = ease + 0.05;
        }
        const t = Date.now();
        return { ease, interval, reps, due: t + interval, lastReview: t, updatedAt: t };
    }
    function previewInterval(card, rate) { return nextSchedule({ ...card }, rate).interval; }
    function fmtInterval(ms) {
        const d = Math.round(ms / DAY);
        if (d < 1) return local('today','今天');
        if (d < 30) return local(d + 'd', d + ' 天');
        return local(Math.round(d / 30) + 'mo',Math.round(d / 30) + ' 个月');
    }
    function fmtDue(card) {
        const diff = card.due - Date.now();
        if (diff <= 0) return { text: local('Due now','现在复习'), cls: 'due' };
        const d = Math.ceil(diff / DAY);
        if (d <= 3) return { text: local('Due in ' + d + 'd', d + ' 天后复习'), cls: 'soon' };
        if (card.reps >= 5) return { text: local('Mastered · ' + d + 'd', '已熟练 · ' + d + ' 天后复习'), cls: 'mastered' };
        return { text: local('Due in ' + d + 'd', d + ' 天后复习'), cls: '' };
    }
    function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    // ── DOM
    const root = document.getElementById('ck-demo');
    if (!root) return;
    const $ = sel => root.querySelector(sel);
    const $$ = sel => Array.from(root.querySelectorAll(sel));

    const input = $('#ck-input');
    const translateBtn = $('#ck-translate');
    const result = $('#ck-result');
    const enOut = $('#ck-en');
    const savedBar = $('#ck-saved');
    const phrasesOut = $('#ck-phrases');
    const toast = $('#ck-toast');
    const badge = $('#ck-badge');

    let busy = false;
    const speaker = $('.ck-icon-btn');
    if (!('speechSynthesis' in window)) speaker.hidden = true;
    else speaker.addEventListener('click', () => {
        if (!enOut.textContent || busy) return;
        const speech = new SpeechSynthesisUtterance(enOut.textContent);
        speech.lang = 'en-AU';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    });

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => toast.classList.remove('show'), 1600);
    }

    // ── Tabs
    function switchTab(name) {
        $$('.ck-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
        $$('.ck-panel').forEach(p => p.classList.toggle('active', p.id === 'ck-panel-' + name));
        if (name === 'library') renderLibrary();
        if (name === 'review') startReview();
        $$('.ck-tab').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tab === name)));
    }
    $$('.ck-tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

    // The printed sample and the phone both read from the current deck.
    let paperIndex = 0;
    let paperEnglish = false;
    const paper = $('#ck-paper');
    const paperCopy = $('#ck-paper-copy');
    const paperHint = $('#ck-paper-hint');
    function drawPaper() {
        const item = cards[paperIndex % cards.length];
        paper.setAttribute('aria-pressed', String(paperEnglish));
        paperCopy.textContent = paperEnglish ? item.en : item.zh;
        paperCopy.lang = paperEnglish ? 'en' : 'zh';
        $('#ck-paper-index').textContent = String(paperIndex + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
        paperHint.textContent = paperEnglish ? local('Flip to Chinese', '翻到中文') : local('Flip to English', '翻到英文');
        $('#ck-paper-prev').setAttribute('aria-label', local('Previous card', '上一张卡片'));
        $('#ck-paper-next').setAttribute('aria-label', local('Next card', '下一张卡片'));
    }
    paper.addEventListener('click', () => { paperEnglish = !paperEnglish; drawPaper(); });
    function turnPaper(direction) {
        paperIndex = (paperIndex + direction + cards.length) % cards.length;
        paperEnglish = false;
        drawPaper();
    }
    $('#ck-paper-prev').addEventListener('click', () => turnPaper(-1));
    $('#ck-paper-next').addEventListener('click', () => turnPaper(1));
    document.addEventListener('portfolio:language', drawPaper);
    drawPaper();

    // ── Translate
    const sampleButtons = $$('.ck-chip');
    let selectedSample;
    sampleButtons.forEach((button, index) => {
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
            selectedSample = SAMPLES[index];
            input.value = selectedSample.zh;
            sampleButtons.forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
            translateBtn.disabled = false;
        });
    });

    function updateSamplePrompt() {
        const zh = document.querySelector('.lang-option.active')?.dataset.lang === 'zh';
        $('#ck-search').placeholder = local('Search','搜索');
        $('.ck-icon-btn').setAttribute('aria-label', local('Read the English aloud','朗读英文'));
        input.placeholder = zh ? '从下方选择一个例句' : 'Choose a sample sentence below';
        input.setAttribute('aria-label', zh ? '已选例句' : 'Selected sample sentence');
    }
    updateSamplePrompt();
    document.addEventListener('portfolio:language', updateSamplePrompt);

    async function typeText(el, text, ms) {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
        el.innerHTML = '<span class="cursor"></span>';
        let out = '';
        for (const ch of text) {
            out += ch;
            el.innerHTML = esc(out) + '<span class="cursor"></span>';
            await new Promise(r => setTimeout(r, ms));
        }
        el.textContent = text;
    }

    translateBtn.addEventListener('click', async () => {
        if (busy || !selectedSample) return;
        const sample = selectedSample;
        busy = true;
        sampleButtons.forEach(chip => { chip.disabled = true; });
        translateBtn.disabled = true;
        translateBtn.textContent = local('Translating…', '翻译中…');
        result.classList.remove('hidden');
        savedBar.classList.add('hidden');
        phrasesOut.innerHTML = '';

        await new Promise(r => setTimeout(r, 450));
        await typeText(enOut, sample.en, 22);

        // auto-save: phrase cards only (never sentence + phrases — that was the "duplicates" lesson)
        const created = sample.phrases.map(p => ({
            id: nextId++, en: p.en, zh: p.zh, example: p.example,
            ease: 2.5, interval: 0, reps: 0, due: Date.now(), createdAt: Date.now(), isNew: true
        }));
        // de-dupe on en
        const fresh = created.filter(c => !cards.some(x => x.en === c.en));
        cards = [...fresh, ...cards];
        paperIndex = 0; paperEnglish = false; drawPaper();

        await new Promise(r => setTimeout(r, 250));
        savedBar.textContent = fresh.length ? local(`${fresh.length} cards saved`, `已保存 ${fresh.length} 张卡片`) : local('These chunks are already in your deck', '这些语块已经在卡组中');
        savedBar.classList.remove('hidden');

        sample.phrases.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'ck-phrase';
            div.style.animationDelay = (i * 90) + 'ms';
            div.innerHTML = `<div class="ck-phrase-en">${esc(p.en)}</div><div class="ck-phrase-zh">${esc(p.zh)}</div><div class="ck-phrase-ex">${esc(p.example)}</div>`;
            phrasesOut.appendChild(div);
        });
        updateBadge();
        translateBtn.textContent = local('Translate', '翻译');
        sampleButtons.forEach(chip => { chip.disabled = false; });
        translateBtn.disabled = false;
        busy = false;
    });

    // ── Library
    const libList = $('#ck-library');
    const libSearch = $('#ck-search');
    function renderLibrary() {
        const q = (libSearch.value || '').trim().toLowerCase();
        const visible = cards
            .filter(c => !q || c.en.toLowerCase().includes(q) || c.zh.includes(q))
            .sort((a, b) => b.createdAt - a.createdAt);
        if (!visible.length) { libList.innerHTML = `<div class="ck-empty">${local('No matching cards','没有符合条件的卡片')}</div>`; return; }
        libList.innerHTML = visible.map(c => {
            const d = fmtDue(c);
            return `<div class="ck-item${c.isNew ? ' new' : ''}">
                <div class="ck-item-body">
                    <div class="ck-item-en">${esc(c.en)}</div>
                    <div class="ck-item-zh">${esc(c.zh)}</div>
                    <div class="ck-item-meta ${d.cls}">${c.isNew ? local('New · just now', '刚刚添加') : d.text}</div>
                </div>
            </div>`;
        }).join('');
    }
    libSearch.addEventListener('input', renderLibrary);
    document.addEventListener('portfolio:language', renderLibrary);

    // ── Review
    const dueNum = $('#ck-due'), newNum = $('#ck-new'), totalNum = $('#ck-total');
    const flash = $('#ck-flash'), cardZh = $('#ck-card-zh'), cardEn = $('#ck-card-en'), cardEx = $('#ck-card-ex');
    const rates = $('#ck-rates'), progress = $('#ck-progress'), reviewWrap = $('#ck-review-wrap'), doneEl = $('#ck-done');
    let queue = [], idx = 0, flipped = false;

    function dueCards() { const t = Date.now(); return cards.filter(c => c.due <= t); }
    function updateBadge() {
        const n = dueCards().length;
        badge.textContent = n;
        badge.classList.toggle('hidden', n === 0);
    }
    function updateStats() {
        dueNum.textContent = dueCards().length;
        newNum.textContent = cards.filter(c => c.reps === 0).length;
        totalNum.textContent = cards.length;
    }
    function startReview() {
        updateStats();
        queue = dueCards().sort((a, b) => a.due - b.due);
        idx = 0;
        if (!queue.length) { reviewWrap.classList.add('hidden'); doneEl.classList.remove('hidden'); return; }
        doneEl.classList.add('hidden'); reviewWrap.classList.remove('hidden');
        showCard();
    }
    function showCard() {
        const c = queue[idx];
        flipped = false;
        flash.classList.remove('flipped');
        flash.setAttribute('aria-pressed', 'false');
        rates.classList.remove('on');
        cardZh.textContent = c.zh;
        cardEn.textContent = c.en;
        cardEx.textContent = c.example;
        progress.textContent = `${idx + 1} / ${queue.length}`;
        $('#ck-r-bad .ck-rate-detail').textContent = fmtInterval(previewInterval(c, 'bad'));
        $('#ck-r-mid .ck-rate-detail').textContent = fmtInterval(previewInterval(c, 'mid'));
        $('#ck-r-good .ck-rate-detail').textContent = fmtInterval(previewInterval(c, 'good'));
    }
    flash.addEventListener('click', () => {
        flipped = !flipped;
        flash.classList.toggle('flipped', flipped);
        flash.setAttribute('aria-pressed', String(flipped));
        rates.classList.toggle('on', flipped);
    });
    $$('.ck-rate').forEach(btn => btn.addEventListener('click', () => {
        if (!flipped) return;
        flipped = false;
        const c = queue[idx];
        Object.assign(c, nextSchedule(c, btn.dataset.rate));
        c.isNew = false;
        showToast(local(`Next review in ${fmtInterval(c.interval)}`, `${fmtInterval(c.interval)}后复习`));
        idx++;
        updateStats(); updateBadge();
        if (idx >= queue.length) { reviewWrap.classList.add('hidden'); doneEl.classList.remove('hidden'); return; }
        showCard();
    }));
    $('#ck-restart').addEventListener('click', () => switchTab('translate'));

    // ── Clock
    function tickClock() {
        const d = new Date();
        $('#ck-clock').textContent = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }
    tickClock(); setInterval(tickClock, 30000);

    // init
    translateBtn.disabled = true;
    updateBadge();
    switchTab('translate');
})();
