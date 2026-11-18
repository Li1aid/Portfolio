(() => {
    'use strict';

    const stage = document.getElementById('anno-demo');
    if (!stage) return;
    const find = selector => stage.querySelector(selector);
    const body = find('#anno-panel-body');
    const questions = find('#anno-voice-prompts');
    const title = find('#anno-panel-title');
    const transcript = find('#anno-bubble-text');
    let language = document.querySelector('.lang-option.active')?.dataset.lang || 'en';
    const local = (en, zh) => language === 'zh' ? zh : en;
    let scene = 'meds';
    let reply = null;
    let voiceTimer;
    let sosTimer;
    let dispenseTimer;
    let health = 'ready';
    let seconds = 10;
    let tray = 'closed';
    let viewer = 'user';
    let mood = 'calm';
    let reminder = false;
    const consent = { family: false, doctor: false };
    const meds = [
        { label: ['Morning dose', '早上的药'], time: '08:00', status: 'pending' },
        { label: ['Lunch dose', '中午的药'], time: '12:30', status: 'pending' },
        { label: ['Evening dose', '晚上的药'], time: '19:00', status: 'pending' },
    ];
    const moods = {
        calm:    { label: ['Calm', '平静'], reply: ['I’ll sit here with you.', '我在这儿陪你坐会儿。'] },
        happy:   { label: ['Happy', '开心'], reply: ['It’s good to see you. Shall we spend some time together?', '见到你真好。我们一起待会儿吧？'] },
        curious: { label: ['Curious', '好奇'], reply: ['What’s that by the window?', '窗边那个是什么呀？'] },
        worried: { label: ['Concerned', '担心'], reply: ['You seem quiet today. How are you feeling?', '你今天有点安静，还好吗？'] },
    };
    const viewers = { user: ['You', '本人'], family: ['Family', '家人'], doctor: ['Doctor', '医生'] };
    const scenes = {
        meds: {
            title: ['Today’s medication', '今天的用药'],
            line: ['Good morning. Have you taken your morning dose?', '早上好，早上的药吃过了吗？'],
            prompts: [['morning', 'Did I take my pills?', '我早上吃过药了吗？'], ['remind', 'Remind me at 7 pm', '晚上七点提醒我'], ['skip', 'Skip my lunch dose', '跳过中午的药']],
        },
        dispenser: {
            title: ['Medication drawer', '取药抽屉'],
            line: ['Your morning dose is in my side compartment.', '早上的药在我侧边的小抽屉里。'],
            prompts: [['dispense', 'Open the drawer', '打开药盒'], ['next', 'When is my next dose?', '下一次几点吃药？'], ['refill', 'When is the next refill?', '还有多久需要补药？']],
        },
        health: {
            title: ['A change in heart rate', '心率变化'],
            line: ['Your heart rate has gone up. How are you feeling?', '你的心率比刚才高。现在感觉怎么样？'],
            prompts: [['okay', 'I’m okay', '我没事'], ['alert', 'Preview a family alert', '预览家人提醒'], ['pulse', 'What’s my heart rate?', '我的心率是多少？']],
        },
        emotion: {
            title: ['Companion responses', '陪伴时的回应'],
            line: moods.calm.reply,
            prompts: [['hello', 'Good afternoon, Anno', 'Anno，下午好'], ['how', 'How are you?', '你还好吗？'], ['come', 'Come sit with me', '来陪我坐坐']],
        },
        privacy: {
            title: ['Who can see what?', '谁能看到这些记录？'],
            line: ['You choose who can see your health records.', '自己的健康记录，由你决定给谁看。'],
            prompts: [['user', 'Show my records', '看我的记录'], ['family', 'What can my family see?', '家人能看到什么？'], ['doctor', 'Preview my doctor’s view', '预览医生看到的记录']],
        },
    };

    function speak(line, animate = true) {
        reply = line;
        transcript.textContent = local(...line);
        if (animate) {
            clearTimeout(voiceTimer);
            stage.removeAttribute('data-speaking');
            void transcript.offsetWidth;
            stage.setAttribute('data-speaking', '');
            voiceTimer = setTimeout(() => stage.removeAttribute('data-speaking'), 1900);
        }
    }

    function medication() {
        const rows = meds.map((med, i) => {
            const taken = med.status === 'taken';
            const status = taken ? local('Taken', '已服用')
                : med.status === 'skipped' ? local('Skipped', '已跳过')
                : i === 2 && reminder ? local('Reminder set', '已设提醒') : '';
            return `<button type="button" class="anno-pill-row" data-action="dose" data-value="${i}" data-state="${med.status}" aria-pressed="${taken}">
                <span class="anno-med-check" aria-hidden="true">${taken ? '✓' : ''}</span>
                <span>${local(...med.label)}${status ? `<small class="anno-med-status">${status}</small>` : ''}</span>
                <time class="anno-med-time">${med.time}</time>
            </button>`;
        });
        return `<div class="anno-dose-list">${rows.join('')}</div><p class="anno-sub">${local('Tap a dose to mark it as taken.', '点一下，记录哪次药已经吃过。')}</p>`;
    }

    function drawer() {
        const step = { closed: 0, opening: 1, open: 2 }[tray];
        const labels = [
            ['Ready to open', '可以取药'], ['Opening…', '正在打开…'], ['Drawer open', '抽屉已打开'],
        ];
        const action = tray === 'open' ? local('Close drawer', '关上抽屉') : local('Open drawer', '打开抽屉');
        return `<div class="anno-dose-box">
            <p class="anno-sub">${local('The side compartment holds the next pre-sorted dose. Try opening it.', '侧边抽屉里放着预先分好的药。试着打开它。')}</p>
            <div class="anno-tray"><strong>${local(...labels[step])}</strong><small class="anno-med-time">08:00</small></div>
            <div class="anno-dispenser-track" aria-hidden="true">${[0,1,2].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>
            <button type="button" class="anno-action" id="anno-dispense" data-action="tray" ${tray === 'opening' ? 'disabled' : ''}>${tray === 'opening' ? local(...labels[1]) : action}</button>
        </div>`;
    }

    function checkIn() {
        const text = {
            ready: ['Try a ten-second check-in with a sample reading.', '用这组示例读数试一次十秒确认。'],
            running: ['Tap “I’m okay” before the sample alert appears.', '在演示提醒出现前，可以点「我没事」。'],
            okay: ['Check-in complete. The alert was dismissed.', '已确认平安，提醒已解除。'],
            alert: ['This is the alert a contact would see. No call was made.', '这是联系人会看到的提醒预览，演示不会呼叫任何人。'],
        }[health];
        const button = health === 'running' ? local('I’m okay', '我没事')
            : health === 'ready' ? local('Start check-in', '开始确认') : local('Try again', '再试一次');
        return `<div class="anno-heart"><strong>${health === 'okay' ? '86' : '132'}</strong><small>bpm</small><canvas width="270" height="72" aria-hidden="true"></canvas></div>
            <p class="anno-sub">${local(...text)}</p>
            <div class="anno-health-action">
                <button type="button" class="anno-action" id="anno-sos-cancel" data-action="health">${button}</button>
                ${health === 'running' ? `<span class="anno-count"><span id="anno-sos-num">${seconds}</span> s</span>` : ''}
            </div>`;
    }

    function plotPulse() {
        const ctx = find('.anno-heart canvas')?.getContext('2d');
        if (!ctx) return;
        const values = health === 'okay'
            ? [38,41,36,39,37,40,38,34,36,37,39,38,39,36,38,35,38,40,37,38]
            : [50,49,51,47,48,43,46,41,42,37,40,36,32,34,24,25,20,24,15,19];
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#394955';
        [18,38,58].forEach(y => { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(270,y); ctx.stroke(); });
        ctx.beginPath();
        values.forEach((v,i) => i ? ctx.lineTo(8 + i*13.3, v) : ctx.moveTo(8, v));
        ctx.lineWidth = 2.8; ctx.lineJoin = 'round'; ctx.strokeStyle = '#f6b7a1'; ctx.stroke();
        ctx.beginPath(); ctx.arc(8 + (values.length-1)*13.3, values[values.length-1], 4, 0, Math.PI*2);
        ctx.fillStyle = '#f6b7a1'; ctx.fill();
    }

    function companion() {
        return `<p class="anno-sub">${local('Choose a mood to read Anno’s response.', '选一个心情，看看 Anno 会怎么回应。')}</p>
            <div class="anno-moods">${Object.entries(moods).map(([key, item]) =>
                `<button type="button" data-action="mood" data-value="${key}" aria-pressed="${mood === key}">${local(...item.label)}</button>`).join('')}</div>`;
    }

    function privacy() {
        const privateValue = local('Private', '不共享');
        const owner = viewer === 'user';
        const hasAccess = owner || consent[viewer];
        const history = [
            [local('Heart rate', '心率'), hasAccess ? '74 bpm' : privateValue],
            [local('Medication log', '用药记录'), hasAccess ? local(`${meds.filter(m => m.status === 'taken').length} of 3 taken`, `已服 ${meds.filter(m => m.status === 'taken').length} / 3 次`) : privateValue],
            [local('Mood journal', '心情日记'), owner ? local(...moods[mood].label) : privateValue],
        ];
        return `<div class="anno-segment">${Object.entries(viewers).map(([key, label]) =>
            `<button type="button" data-action="viewer" data-value="${key}" class="anno-privacy-tab" aria-pressed="${viewer === key}">${local(...label)}</button>`).join('')}</div>
            <dl class="anno-records">${history.map(([key, val]) => `<div><dt>${key}</dt><dd>${val}</dd></div>`).join('')}</dl>
            ${owner ? '' : `<label class="anno-consent"><input type="checkbox" id="anno-consent" ${hasAccess ? 'checked' : ''}> ${viewer === 'family' ? local('Share health summary with family', '与家人共享健康摘要') : local('Share health summary with doctor', '与医生共享健康摘要')}</label>`}`;
    }

    const panels = { meds: medication, dispenser: drawer, health: checkIn, emotion: companion, privacy };
    function paintPanel() {
        const focused = document.activeElement;
        const restoreFocus = body.contains(focused);
        const action = focused?.dataset.action, value = focused?.dataset.value, id = focused?.id;
        body.innerHTML = panels[scene]();
        if (scene === 'health') plotPulse();
        if (restoreFocus) {
            const target = id ? document.getElementById(id)
                : [...body.querySelectorAll('[data-action]')].find(el => el.dataset.action === action && el.dataset.value === value);
            target?.focus({ preventScroll: true });
        }
    }

    function paint() {
        stage.dataset.scene = scene;
        const photo = find('.anno-photo img');
        const companion = scene === 'emotion';
        const source = companion ? '../Assets/demo-scenes/anno-companion.webp' : '../Assets/3.jpg';
        if (photo.getAttribute('src') !== source) photo.src = source;
        photo.alt = companion
            ? local('An older woman reaches towards Anno in her living room.', '一位老人在客厅里伸手与 Anno 互动。')
            : local('The original white Anno robot with a screen on its side.', '白色 Anno 机器狗的原始设计，机身侧面设有屏幕。');
        stage.dataset.mood = mood;
        find('#anno-scenes').setAttribute('aria-label', local('Scenes by time of day', '按时间选择场景'));
        stage.querySelectorAll('.anno-scene-btn').forEach(button => {
            const selected = button.dataset.scene === scene;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        title.textContent = local(...scenes[scene].title);
        questions.innerHTML = scenes[scene].prompts.map(([key, en, zh]) =>
            `<button type="button" class="anno-voice-prompt" data-prompt="${key}">${local(en,zh)}</button>`
        ).join('');
        paintPanel();
    }

    function stopTimers() {
        clearInterval(sosTimer);
        clearTimeout(dispenseTimer);
        if (health === 'running') health = 'ready';
        if (tray === 'opening') tray = 'closed';
    }

    function switchScene(next) {
        if (!Object.hasOwn(scenes, next)) return;
        if (scene !== next) stopTimers();
        scene = next;
        find('.anno-questions').open = false;
        paint();
        const line = scene === 'emotion' ? moods[mood].reply
            : scene === 'health' && health === 'okay' ? ['Glad you’re okay.', '知道你平安，我就放心了。']
            : scene === 'health' && health === 'alert' ? ['This is a preview of the family alert.', '这是家人提醒的预览。']
            : scene === 'dispenser' && tray === 'open' ? ['The drawer is open.', '抽屉已经打开了。']
            : scenes[scene].line;
        speak(line);
    }

    function setHealth(next) {
        clearInterval(sosTimer);
        health = next;
        paintPanel();
        speak(next === 'okay' ? ['Glad you’re okay.', '知道你平安，我就放心了。']
            : ['Here’s the sample family alert. No one has been contacted.', '这是给家人的提醒预览，没有实际联系任何人。']);
    }

    function startHealth() {
        if (health === 'running') return setHealth('okay');
        clearInterval(sosTimer);
        health = 'running';
        seconds = 10;
        paintPanel();
        speak(['Are you okay? You can dismiss the alert.', '你还好吗？如果没事，可以解除这条提醒。']);
        sosTimer = setInterval(() => {
            seconds -= 1;
            if (seconds <= 0) return setHealth('alert');
            find('#anno-sos-num').textContent = String(seconds);
        }, 1000);
    }

    function openTray() {
        if (tray === 'opening') return;
        tray = 'opening';
        paintPanel();
        speak(['Opening the medication drawer.', '正在打开药盒。']);
        dispenseTimer = setTimeout(() => {
            tray = 'open';
            paintPanel();
            speak(['The drawer is open. Your morning dose is ready.', '药盒打开了，早上的药已经备好。']);
        }, 1100);
    }

    function chooseViewer(key) {
        viewer = key;
        paintPanel();
        const lines = {
            user: ['These are your own records.', '这是你本人的记录。'],
            family: ['Here’s what your family can see.', '这是家人能看到的内容。'],
            doctor: ['Here’s what your doctor can see.', '这是医生能看到的内容。'],
        };
        speak(lines[key]);
    }

    function answer(key) {
        switch (key) {
            case 'morning': return speak(meds[0].status === 'taken'
                ? ['Your morning dose is marked as taken.', '早上的药已经记为已服。'] : ['Your morning dose hasn’t been marked as taken.', '还没有早上服药的记录。']);
            case 'remind':
                reminder = true; paintPanel();
                return speak(['Your reminder is set for seven this evening in this demo.', '演示里的提醒已设在今晚七点。']);
            case 'skip':
                if (meds[1].status === 'taken') return speak(['Your lunch dose is already marked as taken.', '中午的药已经记为已服。']);
                meds[1].status = 'skipped'; paintPanel();
                return speak(['I’ve marked the lunch dose as skipped.', '已记下中午这次跳过。']);
            case 'dispense':
                if (tray === 'open') return speak(['The drawer is already open.', '药盒已经打开了。']);
                return openTray();
            case 'next': {
                const next = meds.find(m => m.status === 'pending');
                return speak(next ? [`Your next pending dose is at ${next.time}.`, `下一次待服时间是 ${next.time}。`] : ['Your schedule has no pending doses.', '今天没有待服项目。']);
            }
            case 'refill': return speak(['The sample supply has fourteen days left.', '演示药盒的余量还够十四天。']);
            case 'okay': return setHealth('okay');
            case 'alert': return setHealth('alert');
            case 'pulse': return speak(health === 'okay' ? ['The sample reading is 86 beats per minute.', '示例读数为每分钟 86 次。'] : ['The sample reading is 132 beats per minute.', '示例读数为每分钟 132 次。']);
            case 'hello': return speak(['Good afternoon. How has your day been?', '下午好，今天过得怎么样？']);
            case 'how': return speak(moods[mood].reply);
            case 'come': return speak(['Of course. I’ll keep you company.', '好，我来陪你。']);
            case 'user': case 'family': case 'doctor': return chooseViewer(key);
        }
    }

    stage.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.dataset.scene) return switchScene(button.dataset.scene);
        if (button.dataset.prompt) return answer(button.dataset.prompt);
        const value = button.dataset.value;
        switch (button.dataset.action) {
            case 'dose': {
                const med = meds[Number(value)];
                med.status = med.status === 'taken' ? 'pending' : 'taken';
                paintPanel();
                return speak(med.status === 'taken'
                    ? [`${med.label[0]} marked as taken.`, `${med.label[1]}已记为已服。`]
                    : [`${med.label[0]} marked as pending.`, `${med.label[1]}已恢复为待服。`]);
            }
            case 'health': return startHealth();
            case 'tray':
                if (tray !== 'open') return openTray();
                tray = 'closed'; paintPanel(); return speak(['The drawer is closed.', '药盒已关好。']);
            case 'mood':
                mood = value; stage.dataset.mood = value; paintPanel(); return speak(moods[mood].reply);
            case 'viewer': return chooseViewer(value);
        }
    });

    stage.addEventListener('change', event => {
        if (event.target.id !== 'anno-consent') return;
        consent[viewer] = event.target.checked;
        paintPanel();
        speak(consent[viewer] ? ['They can now see your health summary. Your mood journal stays private.', '现在对方可以看到健康摘要。心情日记只对你本人开放。']
            : ['Your health summary is private again.', '已收回授权，健康摘要不再共享。']);
    });
    document.querySelectorAll('.anno-feature[data-jump]').forEach(link => {
        link.addEventListener('click', () => switchScene(link.dataset.jump));
    });
    document.addEventListener('portfolio:language', event => {
        language = event.detail.lang;
        paint();
        if (reply) speak(reply, false);
    });
    window.addEventListener('pagehide', stopTimers);
    window.addEventListener('pageshow', event => {
        if (event.persisted) switchScene(scene);
    });
    const initialScene = new URLSearchParams(location.search).get('scene');
    switchScene(Object.hasOwn(scenes, initialScene) ? initialScene : 'meds');
    if ('IntersectionObserver' in window) {
        const firstLook = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            stage.classList.add('anno-in-view');
            if (reply) speak(reply);
            firstLook.disconnect();
        }, { threshold: 0.25 });
        firstLook.observe(stage);
    }
})();
