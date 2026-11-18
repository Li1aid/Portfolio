(() => {
    const byId = id => document.getElementById(id);
    const language = () => document.querySelector('.lang-option.active')?.dataset.lang === 'zh' ? 'zh' : 'en';

    function initReader() {
        const desk = byId('research-reader');
        if (!desk) return;
        const options = desk.querySelectorAll('.reader-option');
        options.forEach(button => button.addEventListener('click', () => {
            options.forEach(option => {
                const selected = option === button;
                option.setAttribute('aria-pressed', String(selected));
                byId(option.getAttribute('aria-controls')).hidden = !selected;
            });
        }));
    }

    function initChatDesk() {
        const question = byId('trace-question');
        if (!question) return;
        const prompts = [
            { en: 'How does the research dashboard choose which papers to show?', zh: '科研看板怎样挑出值得读的论文？' },
            { en: 'How does your investment assistant handle different currencies?', zh: '投资助手怎样把不同币种的持仓放进同一本账？' },
            { en: 'How did you build the chat on this site?', zh: '这个网站的聊天功能是怎么做的？' }
        ];
        let current = 0;
        let edited = false;
        let opened = false;
        let awaitingAnswer = false;
        const open = byId('trace-open');
        const steps = document.querySelectorAll('#portfolio-trace .trace-route li');
        function markStep(index) {
            steps.forEach((step, i) => {
                if (i === index) step.setAttribute('aria-current', 'step');
                else step.removeAttribute('aria-current');
            });
        }
        function showPrompt() {
            question.value = prompts[current][language()];
            edited = false;
            open.disabled = false;
        }
        showPrompt();
        byId('trace-next').addEventListener('click', () => {
            current = (current + 1) % prompts.length;
            showPrompt();
            markStep(0);
        });
        question.addEventListener('input', () => {
            edited = true;
            open.disabled = !question.value.trim();
            markStep(0);
        });
        document.addEventListener('portfolio:language', () => { if (!edited) showPrompt(); });
        open.addEventListener('click', () => {
            const input = byId('chatbot-input');
            const widget = byId('chatbot-window');
            if (!widget || !input || !question.value.trim()) return;
            if (!widget.classList.contains('active')) byId('chatbot-toggle').click();
            if (!input.disabled) {
                input.value = question.value.trim();
                input.focus();
            }
            opened = true;
        });
        // The timeline follows the existing widget, including a returned error message.
        const messages = byId('chatbot-messages');
        if (messages) new MutationObserver(records => {
            if (!opened) return;
            for (const record of records) for (const node of record.addedNodes) {
                if (node.classList?.contains('user-message')) {
                    awaitingAnswer = true;
                    markStep(1);
                }
                if (awaitingAnswer && node.classList?.contains('bot-message') && !node.classList.contains('chatbot-thinking')) {
                    awaitingAnswer = false;
                    markStep(2);
                }
            }
        }).observe(messages, { childList: true });
    }

    // An original harbor illustration. All positions are computed from the playhead
    // so seeking backwards reproduces the same boat, waves and lights.
    function drawHarbor(canvas, time) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.scale(w / 1200, h / 520);
        function shape(points, fill) {
            ctx.beginPath();
            points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
        }
        function random(i) {
            const n = Math.sin(i * 73.17 + 18.2) * 1309.813;
            return n - Math.floor(n);
        }
        const sky = ctx.createLinearGradient(0, 0, 0, 330);
        sky.addColorStop(0, '#61788a'); sky.addColorStop(.59, '#d5a78e'); sky.addColorStop(1, '#f8cc9e');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, 1200, 330);
        ctx.fillStyle = '#ffe1b0';
        ctx.beginPath(); ctx.arc(848, 155, 33, 0, Math.PI * 2); ctx.fill();
        for (let layer = 0; layer < 3; layer++) {
            const ridge = [[0,330]];
            for (let x = 0; x <= 1212; x += 12) {
                const y = 191 + layer * 33 + Math.sin(x / 152 + layer * 2.6) * 27 + Math.sin(x / 52 + layer) * 10 + random(x + layer * 99) * 5;
                ridge.push([x, y]);
            }
            ridge.push([1212,330]);
            shape(ridge, ['#af9590','#9a8b88','#757f7e'][layer]);
        }
        const sea = ctx.createLinearGradient(0, 284, 0, 520);
        sea.addColorStop(0, '#a2aaa0'); sea.addColorStop(.2, '#7d9897'); sea.addColorStop(1, '#375e69');
        ctx.fillStyle = sea; ctx.fillRect(0, 284, 1200, 236);
        for (let i = 1; i < 235; i++) {
            const depth = random(i * 3);
            const y = 287 + depth * 230;
            const x = (random(i * 7) * 1280 + Math.sin(time * .45 + i) * 7) % 1280 - 40;
            const nearSun = Math.abs(x - 849) < 25 + depth * 130;
            ctx.fillStyle = nearSun ? 'rgba(255,218,164,.45)' : 'rgba(194,210,198,.32)';
            ctx.fillRect(x, y, 3 + depth * (9 + random(i) * 40), .7 + depth);
        }
        // A receding wharf on the far shore, behind the moving passenger ferry.
        ctx.fillStyle = '#485d5f';
        for (let i = 0; i < 33; i++) {
            const x = 20 + i * 9;
            const roof = 260 - random(i) * 13;
            ctx.fillRect(x, roof, 5 + random(i + 30) * 12, 284 - roof);
            if (i % 3 === 0) { ctx.fillStyle = '#f2c69b'; ctx.fillRect(x + 2, roof + 3, 2, 3); ctx.fillStyle = '#485d5f'; }
        }
        const boatX = 475 + time * 14, boatY = 318 + Math.sin(time * 2) * 1.4;
        ctx.save(); ctx.translate(boatX, boatY);
        ctx.fillStyle = '#343f43'; ctx.fillRect(20, -31, 2.5, 23);
        shape([[-86,0],[79,0],[97,-8],[84,8],[-64,12]], '#334850');
        shape([[-66,0],[-55,-11],[53,-11],[70,-2]], '#e8ceae');
        shape([[-44,-12],[-31,-21],[27,-21],[46,-12]], '#d9c0a8');
        ctx.fillStyle = '#654e46'; ctx.fillRect(-48, -13, 93, 2);
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = i % 3 ? '#755f55' : '#f7d59f'; ctx.fillRect(-47 + i * 10, -9, 6, 5);
        }
        ctx.fillStyle = '#eab77c'; ctx.fillRect(20, -32, 3, 2);
        ctx.restore();
        // Near-bank pines frame the water without covering the captions.
        for (const [x, base, height] of [[-7,388,155],[29,381,129],[49,372,85],[69,365,67],[1160,366,97],[1200,376,166]]) {
            ctx.fillStyle = '#354c50'; ctx.fillRect(x - 2, base - height, 4, height);
            for (let i = 0; i < 5; i++) {
                const y = base - height + i * height * .13;
                const spread = height * (.075 + i * .025);
                shape([[x,y],[x + spread,y + height * .35],[x - spread,y + height * .35]], '#354c50');
            }
        }
        shape([[0,350],[34,351],[105,373],[141,378],[84,380],[0,367]], '#33484b');
        shape([[1200,346],[1130,367],[1080,373],[1152,372],[1200,365]], '#33484b');
        ctx.restore();
    }

    function initSubtitlePlayer() {
        const player = byId('subtitle-player');
        if (!player) return;
        const canvas = byId('subtitle-landscape');
        const seek = byId('subtitle-seek');
        const play = byId('subtitle-play');
        const mode = byId('subtitle-mode');
        const en = byId('subtitle-en'), zh = byId('subtitle-zh');
        const cues = [
            ['There’s one more ferry tonight.', '今晚还有最后一班渡轮。'],
            ['See the light by the pier?', '看见码头边的灯了吗？'],
            ['That’s where we get on.', '我们就在那儿上船。']
        ];
        let playing = false, bilingual = true, time = 0, frame = 0, origin = 0, previousDraw = -1;
        function controls() {
            const chinese = language() === 'zh';
            play.textContent = playing ? (chinese ? '暂停' : 'Pause') : (chinese ? '播放' : 'Play');
            play.setAttribute('aria-pressed', String(playing));
            mode.textContent = bilingual ? (chinese ? '双语' : 'Bilingual') : (chinese ? '仅英文' : 'English only');
            mode.setAttribute('aria-pressed', String(bilingual));
            seek.setAttribute('aria-label', chinese ? '播放进度' : 'Playback position');
        }
        function render() {
            const cue = cues[Math.min(2, Math.floor(time / 4))];
            drawHarbor(canvas, time);
            en.textContent = cue[0]; zh.textContent = cue[1]; zh.hidden = !bilingual;
            seek.value = time;
            const display = '0:' + String(Math.floor(time)).padStart(2, '0') + ' / 0:12';
            byId('subtitle-time').textContent = display;
            seek.setAttribute('aria-valuetext', display);
        }
        function pause() {
            playing = false;
            cancelAnimationFrame(frame);
            controls();
        }
        function tick(now) {
            time = Math.min(12, (now - origin) / 1000);
            if (now - previousDraw > 40 || time === 12) { render(); previousDraw = now; }
            if (time === 12) pause();
            else frame = requestAnimationFrame(tick);
        }
        play.addEventListener('click', () => {
            if (playing) return pause();
            if (time >= 12) time = 0;
            playing = true;
            controls();
            origin = performance.now() - time * 1000;
            frame = requestAnimationFrame(tick);
        });
        seek.addEventListener('input', () => {
            time = Number(seek.value);
            origin = performance.now() - time * 1000;
            render();
        });
        mode.addEventListener('click', () => { bilingual = !bilingual; controls(); render(); });
        document.addEventListener('portfolio:language', controls);
        document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting && playing) pause();
            }).observe(player);
        }
        controls();
        render();
    }

    initReader();
    initChatDesk();
    initSubtitlePlayer();
})();
