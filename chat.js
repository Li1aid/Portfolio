// Chat with AI Aiden — the bar that sits at the bottom of every page.
// Talks to the Cloudflare Worker (worker/), which grounds answers in knowledge.md.
(function () {
  var URL_ = 'https://ai.aidenyang.me';
  var root = document.getElementById('chat');
  if (!root) return;
  var log = root.querySelector('.chat-log');
  var msgs = root.querySelector('.chat-msgs');
  var form = root.querySelector('form');
  var input = root.querySelector('input');
  var closeBtn = root.querySelector('.chat-close');
  var history = [];
  var busy = false;
  var sid;
  try {
    sid = sessionStorage.getItem('aiden-chat-session');
    if (!sid) { sid = (crypto.randomUUID && crypto.randomUUID()) || ('s_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)); sessionStorage.setItem('aiden-chat-session', sid); }
  } catch (e) { sid = 's_' + Date.now().toString(36); }

  function open(v) {
    root.classList.toggle('open', v);
    document.documentElement.classList.toggle('chat-open', v);
    window.dispatchEvent(new Event('chat:resize'));
  }
  function clean(t) {
    return t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '').replace(/^\s*[-*+]\s+/gm, '').replace(/\n{3,}/g, '\n\n').trim();
  }
  function add(text, who) {
    var row = document.createElement('div');
    row.className = 'chat-row ' + who;
    var dot = document.createElement('span');
    dot.className = 'chat-dot';
    var p = document.createElement('p');
    p.textContent = who === 'bot' ? clean(text) : text;
    row.appendChild(dot); row.appendChild(p);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return row;
  }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (busy) return;
    var text = input.value.trim() || input.getAttribute('data-q') || '';
    if (!text) return;
    input.value = '';
    open(true);
    add(text, 'user');
    history.push({ role: 'user', content: text });
    var wait = add('…', 'bot wait');
    busy = true;
    try {
      var res = await fetch(URL_, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: history, session_id: sid }) });
      wait.remove();
      if (!res.ok) { add(res.status === 429 ? 'Too many messages for now. Try again in a minute.' : 'Something went wrong. Try again?', 'bot'); history.pop(); return; }
      var data = await res.json();
      var reply = (data.reply || '').trim() || 'Something went wrong. Try again?';
      add(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
      window.dispatchEvent(new CustomEvent('chat:reply', { detail: { question: text, reply: reply } }));
    } catch (err) {
      wait.remove(); history.pop();
      add('Could not reach AI Aiden. Check your connection and try again.', 'bot');
    } finally { busy = false; }
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { open(false); });

  // the placeholder types example questions while the field is idle
  var qs = (root.getAttribute('data-qs') || 'Chat with AI Aiden').split('|');
  if (qs.length > 1 && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var qi = 0, n = qs[0].length, dir = -1, wait = 60;
    setInterval(function () {
      if (document.activeElement === input || input.value) return;
      if (wait > 0) { wait--; return; }
      n += dir;
      if (dir === 1 && n >= qs[qi].length) { dir = -1; wait = qi === 0 ? 60 : 34; }
      else if (dir === -1 && n <= 0) { dir = 1; qi = (qi + 1) % qs.length; wait = 8; input.setAttribute('data-q', qs[qi === 0 ? 1 : qi]); }
      input.setAttribute('placeholder', qs[qi].slice(0, Math.max(0, n)) || ' ');
    }, 55);
    input.setAttribute('data-q', qs[1]);
  }
})();
