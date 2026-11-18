(() => {
    const chatEndpoint = 'https://ai.aidenyang.me';
    let language;
    try { language = localStorage.getItem('preferredLang') === 'zh' ? 'zh' : 'en'; }
    catch { language = 'en'; }

    function translate(root) {
        root.querySelectorAll('[data-en][data-zh]').forEach(element => {
            const value = element.dataset[language];
            if (element.matches('input, textarea')) element.placeholder = value;
            else if (element.textContent.trim() !== value) element.textContent = value;
        });
        root.querySelectorAll('[data-aria-en]').forEach(element => {
            element.setAttribute('aria-label', language === 'en' ? element.dataset.ariaEn : element.dataset.ariaZh);
        });
    }

    function applyLanguage(next, remember = true) {
        language = next === 'zh' ? 'zh' : 'en';
        document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
        document.body.classList.toggle('lang-zh', language === 'zh');
        document.body.classList.toggle('lang-en', language === 'en');
        translate(document);
        document.querySelectorAll('[data-switch-language], #langToggle').forEach(button => {
            const options = button.querySelectorAll('[data-lang]');
            button.setAttribute('aria-label', language === 'en' ? '切换为中文' : 'Switch to English');
            if (options.length) {
                options.forEach(option => option.classList.toggle('active', option.dataset.lang === language));
            } else {
                button.lang = language === 'en' ? 'zh-CN' : 'en';
                button.textContent = language === 'en' ? '中文' : 'EN';
            }
        });
        if (remember) {
            try { localStorage.setItem('preferredLang', language); } catch { /* This session still switches. */ }
        }
        document.dispatchEvent(new CustomEvent('portfolio:language', { detail: {lang: language} }));
    }

    function setupChat() {
        const dialog = document.createElement('dialog');
        dialog.id = 'chatbot-window';
        dialog.className = 'chat-dialog';
        dialog.setAttribute('aria-labelledby', 'chat-title');
        dialog.innerHTML = `
            <div class="chat-inner">
                <div class="chat-top"><h2 id="chat-title">AI Aiden</h2><button type="button" id="chatbot-close" data-aria-en="Close chat" data-aria-zh="关闭聊天" aria-label="Close chat">×</button></div>
                <div class="chat-messages" id="chatbot-messages" role="log" aria-live="polite" aria-relevant="additions text">
                    <p class="bot-message" data-en="What would you like to know about my work?" data-zh="你想了解我的哪个项目？">What would you like to know about my work?</p>
                </div>
                <form class="chat-form">
                    <input required maxlength="4000" id="chatbot-input" type="text" autocomplete="off" aria-label="Your question" data-aria-en="Your question" data-aria-zh="你的问题" data-en="Ask about my work…" data-zh="输入你的问题…" placeholder="Ask about my work…">
                    <button id="chatbot-send" data-en="Send" data-zh="发送">Send</button>
                </form>
            </div>`;
        document.body.append(dialog);
        const messages = dialog.querySelector('#chatbot-messages');
        const input = dialog.querySelector('input');
        const form = dialog.querySelector('form');
        const send = form.querySelector('button');
        const history = [];
        let sessionId;
        let busy = false;

        function getSessionId() {
            if (sessionId) return sessionId;
            try { sessionId = sessionStorage.getItem('aiden-chat-session'); } catch { /* Optional storage. */ }
            if (!sessionId) {
                sessionId = globalThis.crypto?.randomUUID?.() || 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
                try { sessionStorage.setItem('aiden-chat-session', sessionId); } catch { /* Use the in-memory ID. */ }
            }
            return sessionId;
        }

        function appendMessage(content, className) {
            const p = document.createElement('p');
            p.className = className;
            p.textContent = content;
            messages.append(p);
            messages.scrollTop = messages.scrollHeight;
            return p;
        }

        document.addEventListener('click', event => {
            const opener = event.target.closest('[data-chat-open]');
            if (opener && !dialog.open) {
                dialog.showModal();
                input.focus({preventScroll: true});
            }
        });
        dialog.querySelector('#chatbot-close').addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.close();
        });
        form.addEventListener('submit', async event => {
            event.preventDefault();
            const content = input.value.trim();
            if (!content || busy) return;
            const question = {role: 'user', content};
            busy = true;
            send.disabled = true;
            appendMessage(content, 'user-message');
            input.value = '';
            const waiting = appendMessage('…', 'chat-status');
            try {
                const response = await fetch(chatEndpoint, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({messages: [...history.slice(-18), question], session_id: getSessionId()}),
                    signal: AbortSignal.timeout(60000)
                });
                if (!response.ok) throw new Error(String(response.status));
                const data = await response.json();
                const reply = typeof data.reply === 'string' ? data.reply.trim() : '';
                if (!reply) throw new Error('empty');
                history.push(question, {role: 'assistant', content: reply});
                appendMessage(reply.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/^#{1,6}\s+/gm, ''), 'bot-message');
            } catch (error) {
                const rateLimited = error.message === '429';
                const en = rateLimited ? 'Please wait a minute before trying again.' : 'The reply didn’t come through. Try sending your question again.';
                const zh = rateLimited ? '请稍等一分钟再试。' : '暂时没有收到回复，可以重新发送。';
                appendMessage(language === 'en' ? en : zh, 'chat-status');
                if (!input.value) input.value = content;
            } finally {
                waiting.remove();
                busy = false;
                send.disabled = false;
                if (dialog.open) input.focus({preventScroll: true});
            }
        });
    }

    async function updateAvailability() {
        const label = document.getElementById('status-text');
        if (!label) return;
        try {
            let saved;
            try { saved = localStorage.getItem('portfolioStatus'); } catch { /* Fetch the public status. */ }
            const status = saved ? JSON.parse(saved) : await (await fetch('/status.json')).json();
            if (typeof status.statusText?.en === 'string' && typeof status.statusText?.zh === 'string') {
                label.dataset.en = status.statusText.en;
                label.dataset.zh = status.statusText.zh;
                label.textContent = label.dataset[language];
            }
        } catch { /* The HTML includes the last public availability. */ }
    }

    function start() {
        setupChat();
        document.querySelectorAll('[data-switch-language], #langToggle').forEach(button => {
            button.addEventListener('click', event => {
                const option = event.target.closest('[data-lang]');
                applyLanguage(option ? option.dataset.lang : (language === 'en' ? 'zh' : 'en'));
            });
        });
        applyLanguage(language, false);
        updateAvailability();
        window.addEventListener('storage', event => {
            if (event.key === 'portfolioStatus') updateAvailability();
            if (event.key === 'preferredLang') applyLanguage(event.newValue, false);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
    else start();
})();
