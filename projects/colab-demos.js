/* ========================================
   CoLab Subpage — Interactive Demos
   ======================================== */

(function () {
    'use strict';

    // ----- Demo 1: Team Up -----

    const teamUpData = [
        { name: 'Yuchen Men',  initials: 'YM', role: 'Visualization · Storytelling', tags: ['Critical', 'Open-Minded'] },
        { name: 'Bella Wu',    initials: 'BW', role: 'Detail-Oriented · Leader',     tags: ['Visualization', 'Communication'] },
        { name: 'Chris Li',    initials: 'CL', role: 'Storytelling · Adventurous',   tags: ['Visualization', 'Detail'] },
        { name: 'Erin Zhao',   initials: 'EZ', role: 'Open-Minded · Strategist',     tags: ['Prototyping', 'Communication'] },
        { name: 'Felix Tran',  initials: 'FT', role: 'Adventurous · Innovator',      tags: ['Storytelling', 'Critical'] },
        { name: 'Robin Park',  initials: 'RP', role: 'Methodical · Researcher',      tags: ['Data Viz', 'IA'] },
    ];

    const myProfile = {
        name: 'Aiden Yang',
        initials: 'AY',
        role: 'UI/UX · AIGC Creator',
        tags: ['Vibecoding', 'Storytelling', 'Prototyping'],
        isMe: true,
    };

    const teamAvatars = [1, 8, 2, 3, 7, 9];
    const termsZh = {
        Visualization: '可视化', Storytelling: '叙事', Critical: '批判性思考',
        'Open-Minded': '开放思维', 'Detail-Oriented': '注重细节', Leader: '团队组织',
        Communication: '沟通', Adventurous: '乐于探索', Detail: '细节打磨',
        Strategist: '策略', Prototyping: '原型设计', Innovator: '创意',
        Methodical: '规划', Researcher: '研究', 'Data Viz': '数据可视化', IA: '信息架构',
        'AIGC Creator': 'AIGC 创作', Vibecoding: 'AI 辅助编程'
    };
    const chinese = () => document.querySelector('.lang-option.active')?.dataset.lang === 'zh';
    const local = (en, zh) => chinese() ? zh : en;
    const skillLabel = text => chinese() ? termsZh[text] || text : text;

    function initTeamUp() {
        const grid = document.getElementById('teamup-grid');
        const status = document.getElementById('teamup-status');
        const skillSelect = document.getElementById('teamup-skill');
        const tabs = document.querySelectorAll('.teamup-tab');
        if (!grid) return;

        const connected = new Set();
        const saved = new Set();
        let activeFilter = 'all';
        const skills = [...new Set(teamUpData.flatMap(person => person.tags))].sort();
        skills.forEach(skill => skillSelect.add(new Option(skillLabel(skill), skill)));

        function render(focusTarget) {
            const people = teamUpData.map((person, id) => ({...person, id, avatar: teamAvatars[id]}));
            if (activeFilter === 'myteam') people.unshift({...myProfile, id: -1});
            const matches = people.filter(person => {
                const inTab = activeFilter === 'all' ||
                    (activeFilter === 'saved' && saved.has(person.id)) ||
                    (activeFilter === 'myteam' && (person.isMe || connected.has(person.id)));
                return inTab && (!skillSelect.value || person.tags.includes(skillSelect.value));
            });
            tabs.forEach(tab => {
                const selected = tab.dataset.tab === activeFilter;
                tab.classList.toggle('active', selected);
                tab.setAttribute('aria-pressed', selected);
            });
            grid.replaceChildren();
            matches.forEach(person => {
                const card = document.createElement('div');
                card.className = 'teamup-card';
                const avatar = person.isMe ? 'AY' : `<img loading="lazy" src="../Assets/demo-scenes/colab-${person.avatar}.webp" alt="">`;
                card.innerHTML = `
                    <div class="teamup-card-head">
                        <div class="teamup-avatar">${avatar}</div>
                        <div><div class="teamup-name">${person.name}</div><div class="teamup-role">${person.role.split(' · ').map(skillLabel).join(' · ')}</div></div>
                    </div>
                    <div class="teamup-tags">${person.tags.map(tag => `<span class="teamup-tag">${skillLabel(tag)}</span>`).join('')}</div>`;
                if (!person.isMe) {
                    const actions = document.createElement('div');
                    actions.className = 'colab-actions';
                    const member = connected.has(person.id);
                    const bookmarked = saved.has(person.id);
                    actions.innerHTML = `
                        <button type="button" class="teamup-connect" data-id="${person.id}" aria-pressed="${member}">${member ? local('Connected ✓', '已组队 ✓') : local('Connect', '组队')}</button>
                        <button type="button" class="teamup-save" data-id="${person.id}" aria-pressed="${bookmarked}" aria-label="${local('Save profile', '收藏资料')} · ${person.name}">
                            <svg viewBox="0 0 20 20" aria-hidden="true" fill="${bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"><path d="M5.3 3.2h9.4v14l-4.7-3.1-4.7 3.1z"/></svg>
                        </button>`;
                    card.append(actions);
                }
                grid.append(card);
            });
            if (!matches.length) {
                const empty = document.createElement('p');
                empty.className = 'colab-empty';
                empty.textContent = skillSelect.value ? local('No profiles match this skill.', '没有匹配这项技能的资料。') :
                    local('Save a profile using its bookmark.', '点资料上的书签即可收藏。');
                grid.append(empty);
            }
            status.textContent = local(`${connected.size} connected · ${saved.size} saved`, `${connected.size} 位队友 · 已收藏 ${saved.size} 人`);
            if (focusTarget) (grid.querySelector(focusTarget) || document.querySelector('.teamup-tab.active')).focus({preventScroll: true});
        }
        grid.addEventListener('click', event => {
            const button = event.target.closest('button[data-id]');
            if (!button) return;
            const set = button.classList.contains('teamup-save') ? saved : connected;
            const id = Number(button.dataset.id);
            if (set.has(id)) set.delete(id);
            else set.add(id);
            render(`.${button.className}[data-id="${id}"]`);
        });
        tabs.forEach(tab => tab.addEventListener('click', () => { activeFilter = tab.dataset.tab; render(); }));
        skillSelect.addEventListener('change', () => render());
        document.addEventListener('portfolio:language', () => {
            Array.from(skillSelect.options).slice(1).forEach(option => option.textContent = skillLabel(option.value));
            render();
        });
        render();
    }

    // ----- Demo 2: Lecture Player -----

    function initLecturePlayer() {
        const playBtn = document.getElementById('lecture-play');
        const fill = document.getElementById('lecture-progress-fill');
        const knob = document.getElementById('lecture-progress-knob');
        const time = document.getElementById('lecture-current');
        const chapter = document.getElementById('lecture-chapter');
        const playstate = document.getElementById('lecture-playstate');
        const progress = document.getElementById('lecture-progress');
        const chips = document.querySelectorAll('.chapter-chip');
        if (!playBtn) return;

        const total = 765; // 12:45 in seconds
        let current = 0;
        let playing = false;
        let intervalId = null;

        function fmt(t) {
            const m = Math.floor(t / 60);
            const s = Math.floor(t % 60);
            return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }

        function updateUI() {
            const pct = (current / total) * 100;
            fill.style.width = pct + '%';
            knob.style.left = pct + '%';
            time.textContent = fmt(current);
            updateChapter();
        }

        function updateChapter() {
            const items = Array.from(chips).map(c => ({
                el: c,
                t: parseInt(c.dataset.time, 10),
                label: c.dataset.label,
            })).sort((a, b) => a.t - b.t);

            let active = null;
            for (const it of items) {
                if (current >= it.t) active = it;
            }
            stage.dataset.slide = String(Math.max(0, items.indexOf(active)));
            chips.forEach(c => c.classList.remove('active'));
            if (active) {
                active.el.classList.add('active');
                chapter.textContent = local(active.label, active.el.dataset.chapterZh);
            } else {
                chapter.textContent = local('Introduction','导论');
            }
        }

        function setPlay(state) {
            playing = state;
            playBtn.classList.toggle('playing', playing);
            // The center play triangle is shown only when paused.
            playstate.classList.toggle('show', !playing);
            if (playing) {
                intervalId = setInterval(() => {
                    current += 2; // 2x speed for demo
                    if (current >= total) {
                        current = total;
                        setPlay(false);
                    }
                    updateUI();
                }, 100);
            } else if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        playBtn.addEventListener('click', () => setPlay(!playing));

        // Allow clicking the big center area to toggle play
        const stage = document.querySelector('#demo-lecture .lecture-stage');
        if (stage) {
            stage.addEventListener('click', () => setPlay(!playing));
        }

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                current = parseInt(chip.dataset.time, 10);
                updateUI();
                if (!playing) setPlay(true);
            });
        });

        progress.addEventListener('click', (e) => {
            const rect = progress.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            current = Math.max(0, Math.min(total, ratio * total));
            updateUI();
        });

        document.addEventListener('portfolio:language', updateUI);
        playstate.classList.add('show');
        updateUI();
    }

    // ----- Demo 3: Quiz -----

    const quizQuestions = [
        {
            q: 'What is the primary purpose of a grid system in interaction design?',
            options: [
                'Make the page look symmetrical',
                'Provide invisible structure that guides attention',
                'Enforce a single column layout',
                'Replace the need for a designer',
            ],
            correct: 1,
            explain: 'Grids create rhythm and hierarchy without being visible themselves.',
        },
        {
            q: 'Which property defines the vertical rhythm of typography on a page?',
            options: [
                'Letter-spacing',
                'Baseline grid',
                'Margin',
                'Z-index',
            ],
            correct: 1,
            explain: 'A baseline grid aligns text to a consistent vertical interval.',
        },
        {
            q: 'In a 12-column responsive grid, what changes most between breakpoints?',
            options: [
                'The number of columns and gutter sizing',
                'The font of body text',
                'The browser engine',
                'The page title',
            ],
            correct: 0,
            explain: 'Responsive grids reflow column counts and gutters per device.',
        },
    ];

    function initQuiz() {
        const card = document.getElementById('quiz-card');
        const qNum = document.getElementById('quiz-q-num');
        const qEl = document.getElementById('quiz-question');
        const opts = document.getElementById('quiz-options');
        const fb = document.getElementById('quiz-feedback');
        const nextBtn = document.getElementById('quiz-next');
        if (!card) return;

        const questionsZh = [
            {q: '交互设计中，网格的主要作用是什么？', options: ['让页面对称','通过结构引导注意力','规定单列布局','取代设计师'], explain: '网格通过对齐和间距建立视觉节奏与层次。'},
            {q: '哪种工具用于统一文字的垂直节奏？', options: ['字间距','基线网格','外边距','堆叠顺序'], explain: '基线网格让各行文字保持一致的垂直间距。'},
            {q: '在十二栏响应式网格中，断点通常会改变什么？', options: ['栏数与栏间距','正文字体','浏览器引擎','页面标题'], explain: '不同屏宽下可以调整栏数和栏间距。'}
        ];
        let idx = 0;
        let selected = null;
        function render() {
            const source = quizQuestions[idx];
            const q = chinese() ? questionsZh[idx] : source;
            qNum.textContent = String(idx + 1);
            qEl.textContent = q.q;
            opts.replaceChildren();
            nextBtn.disabled = selected === null;
            const right = selected === source.correct;
            fb.textContent = selected === null ? '' :
                (right ? local('Correct. ', '答对了。') : local('Not quite. ', '再看一下。')) + q.explain;
            fb.className = 'quiz-feedback' + (selected === null ? '' : right ? ' correct' : ' wrong');
            q.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'quiz-option';
                button.type = 'button';
                button.disabled = selected !== null;
                if (selected !== null && index === source.correct) button.classList.add('correct');
                else if (index === selected) button.classList.add('wrong');
                button.innerHTML = `<span class="quiz-option-letter">${String.fromCharCode(65 + index)}</span>${option}`;
                button.addEventListener('click', () => {
                    selected = index;
                    render();
                    nextBtn.focus({preventScroll: true});
                });
                opts.appendChild(button);
            });
        }
        nextBtn.addEventListener('click', () => {
            idx = (idx + 1) % quizQuestions.length;
            selected = null;
            render();
            opts.firstElementChild.focus({preventScroll: true});
        });
        document.addEventListener('portfolio:language', render);
        render();
    }

    // ----- Demo 4: Tutorial Whiteboard -----

    const termGlossary = {
        kerning: {
            label: 'KERNING',
            text: 'The manual spacing between two specific letters — e.g. tightening "AV" so the shapes feel balanced rather than gappy.',
        },
        baseline: {
            label: 'BASELINE GRID',
            text: 'An invisible horizontal ruler that text sits on. Aligning lines to it creates calm vertical rhythm across columns.',
        },
        negative: {
            label: 'NEGATIVE SPACE',
            text: 'Empty area between elements — not "wasted." It lets the eye rest, groups related items, and gives content room to breathe.',
        },
        hierarchy: {
            label: 'HIERARCHY',
            text: 'Using size, weight, color and spacing to guide the eye in order of importance. Without it, every element competes equally.',
        },
    };

    function initWhiteboardTooltip() {
        const tooltip = document.getElementById('term-tooltip');
        const terms = document.querySelectorAll('.term');
        if (!tooltip || terms.length === 0) return;

        const container = tooltip.parentElement; // .tutorial-content (positioned)

        function show(termEl) {
            const key = termEl.dataset.term;
            const data = termGlossary[key];
            if (!data) return;

            tooltip.innerHTML = `<div class="term-tooltip-head">${data.label}</div>${data.text}`;
            tooltip.setAttribute('aria-hidden', 'false');

            // Position tooltip below the hovered term, clamped to container bounds
            const containerRect = container.getBoundingClientRect();
            const termRect = termEl.getBoundingClientRect();

            const left = termRect.left - containerRect.left;
            const top = termRect.bottom - containerRect.top + 8;

            tooltip.style.left = Math.max(8, Math.min(left, container.clientWidth - 296)) + 'px';
            tooltip.style.top = top + 'px';
            tooltip.classList.add('visible');
            termEl.classList.add('active');
        }

        function hide() {
            tooltip.classList.remove('visible');
            tooltip.setAttribute('aria-hidden', 'true');
            terms.forEach(t => t.classList.remove('active'));
        }

        terms.forEach(t => {
            t.addEventListener('mouseenter', () => show(t));
            t.addEventListener('mouseleave', hide);
            t.addEventListener('focus', () => show(t));
            t.addEventListener('blur', hide);
            t.tabIndex = 0;
        });
    }

    function initWhiteboardToolbar() {
        const tools = document.querySelectorAll('.wb-tool');
        const toggle = document.getElementById('wb-toggle');
        const state = document.getElementById('wb-toggle-state');

        tools.forEach(t => {
            t.addEventListener('click', () => {
                tools.forEach(x => x.classList.remove('active'));
                t.classList.add('active');
            });
        });

        if (toggle && state) {
            toggle.addEventListener('click', () => {
                const on = toggle.classList.toggle('on');
                state.textContent = on ? 'ON' : 'OFF';
            });
        }
    }

    function initChat() {
        const stream = document.getElementById('chat-stream');
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const count = document.getElementById('chat-count');
        if (!stream || !form) return;

        const seed = [
            { name: 'Hannah Lee', cls: 'instructor', text: 'Welcome — drop questions here.' },
            { name: 'Mia',  cls: '', text: 'Loving the kerning part ✨' },
            { name: 'Sam',  cls: '', text: 'Can someone share the figma?' },
            { name: 'Hannah Lee', cls: 'instructor', text: 'Pinning it now — resources tab.' },
        ];

        const ambient = [
            'so helpful 🙌',
            'baseline grid finally clicked',
            '+1 to the figma file',
            'recording later?',
            'love the AV kerning example',
            'is this in the slides?',
        ];
        const ambientNames = ['Liu', 'Aaron', 'Priya', 'Jules', 'Noa', 'Theo', 'Ren', 'Casey'];

        function addMsg(name, cls, text) {
            const msg = document.createElement('div');
            msg.className = 'chat-msg';
            msg.innerHTML = `<span class="chat-msg-name ${cls}">${name}</span><span class="chat-msg-text">${text}</span>`;
            stream.appendChild(msg);
            stream.scrollTop = stream.scrollHeight;
            while (stream.children.length > 30) stream.removeChild(stream.firstChild);
        }

        seed.forEach(m => addMsg(m.name, m.cls, m.text));

        let viewers = 847;
        setInterval(() => {
            viewers += Math.floor(Math.random() * 5) - 2;
            if (viewers < 800) viewers = 800;
            if (viewers > 920) viewers = 920;
            if (count) count.textContent = String(viewers);
        }, 3000);

        function scheduleAmbient() {
            const delay = 4500 + Math.random() * 5500;
            setTimeout(() => {
                const name = ambientNames[Math.floor(Math.random() * ambientNames.length)];
                const text = ambient[Math.floor(Math.random() * ambient.length)];
                addMsg(name, '', text);
                scheduleAmbient();
            }, delay);
        }
        scheduleAmbient();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = input.value.trim();
            if (!v) return;
            addMsg('You', 'you', v);
            input.value = '';
            if (Math.random() < 0.5) {
                setTimeout(() => {
                    addMsg('Hannah Lee', 'instructor', 'Great point — let\'s circle back.');
                }, 1200 + Math.random() * 800);
            }
        });
    }

    const aiKnowledge = {
        kerning: 'Kerning adjusts the space between two specific letters so visual rhythm reads evenly — e.g. tightening "AV" so the angled shapes feel balanced.',
        baseline: 'A baseline grid is an invisible horizontal ruler text sits on. Aligning to it creates calm vertical rhythm across columns.',
        rhythm: 'Visual rhythm is the repeated cadence of size, spacing or color across a layout. Like music, it sets the tempo of how you scan a page.',
        negative: 'Negative space (whitespace) is the empty area around elements. It is an active design element — it groups, separates, and gives focus.',
        hierarchy: 'Hierarchy is how a layout signals what to read first, second, third. It uses scale, weight, contrast and spacing to lead the eye.',
        whitespace: 'Whitespace is the breathing room around content. Generous whitespace looks premium; cramped layouts feel busy and cheap.',
        leading: 'Leading is the vertical space between baselines of lines. Tight leading feels dense; loose leading feels airy.',
        modular: 'A modular scale is a sequence of sizes derived from a ratio (e.g. 1.25x). It gives typography proportional harmony.',
    };

    function initAI() {
        const stream = document.getElementById('ai-stream');
        const form = document.getElementById('ai-form');
        const input = document.getElementById('ai-input');
        if (!stream || !form) return;

        function addMsg(text, who) {
            const msg = document.createElement('div');
            msg.className = 'ai-msg ai-msg-' + who;
            msg.textContent = text;
            stream.appendChild(msg);
            stream.classList.add('has-msgs');
            stream.scrollTop = stream.scrollHeight;
            return msg;
        }

        function answer(question) {
            const q = question.toLowerCase();
            const key = Object.keys(aiKnowledge).find(k => q.includes(k));
            const reply = key
                ? aiKnowledge[key]
                : `Good question — for "${question}" I'd point you to the highlighted terms in the principles list above. Hover any of them for an inline explanation.`;

            const typing = addMsg('…', 'bot');
            let i = 0;
            const tick = setInterval(() => {
                i++;
                typing.textContent = reply.slice(0, i);
                stream.scrollTop = stream.scrollHeight;
                if (i >= reply.length) clearInterval(tick);
            }, 16);
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = input.value.trim();
            if (!v) return;
            addMsg(v, 'user');
            input.value = '';
            setTimeout(() => answer(v), 300);
        });
    }

    // ----- Init on DOM ready -----

    function init() {
        initTeamUp();
        initLecturePlayer();
        initQuiz();
        initWhiteboardTooltip();
        initWhiteboardToolbar();
        initChat();
        initAI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
