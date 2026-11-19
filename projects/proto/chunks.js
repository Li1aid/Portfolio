// Chunks: two specimens that share one deck, following the real app.
// Left: a sentence comes back as English plus phrases, and every phrase is saved without a save button (duplicates are skipped).
// Right: review opens at ten cards; tap to flip; swipe right before flipping = easy, after flipping = good, left = forgot.
// The scheduler is the app's own FSRS-4.5 maths. The translations are canned: the real app asks Claude.
(function () {
  var P = window.P, DAY = 864e5;
  var W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
  var F = 19 / 81, DECAY = -0.5, RET = 0.9;
  function cl(v, a, b) { return Math.min(Math.max(v, a), b); }
  function interval(s) { return cl((s / F) * (Math.pow(RET, 1 / DECAY) - 1), 1, 36500); }
  function retr(days, s) { return s <= 0 ? 1 : Math.pow(1 + F * days / s, DECAY); }
  function curR(c, now) { var s = c.state === 1 && c.s > 0 ? c.s : W[2], ref = c.state === 1 && c.s > 0 ? c.last : c.made; return retr(Math.max(0, (now - ref) / DAY), s); }
  function rate(c, g, now) {
    var s, d;
    if (c.state === 0) { s = cl(W[g - 1], 0.01, 36500); d = cl(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10); }
    else {
      var R = retr(Math.max(0, (now - c.last) / DAY), c.s), dp = c.d + -W[6] * (g - 3) * ((10 - c.d) / 9);
      d = cl(W[7] * (W[4] - Math.exp(W[5] * 2) + 1) + (1 - W[7]) * dp, 1, 10);
      if (g === 1) s = cl(Math.min(Math.pow(c.d, -W[12]) * (Math.pow(c.s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)) * W[11], c.s), 0.01, 36500);
      else s = cl(c.s * (1 + (11 - c.d) * Math.pow(c.s, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1) * (g === 4 ? W[16] : 1) * Math.exp(W[8])), 0.01, 36500);
    }
    c.s = s; c.d = d; c.state = 1; c.last = now; c.iv = interval(s); c.due = now + c.iv * DAY;
  }
  var now = Date.now(), deck = [], subs = [];
  function norm(s) { return s.toLowerCase().replace(/\s+/g, ' ').replace(/^[.,;:!?"'`()\[\]{}]+|[.,;:!?"'`()\[\]{}]+$/g, '').trim(); }
  function add(en, zh, ex, src, made) { deck.push({ en: en, zh: zh, ex: ex, src: src || '', made: made, state: 0, s: 0, d: 0, last: 0 }); }
  [['run into', '偶遇', 'I ran into my old tutor at the station.'], ['sort it out', '把事情解决', 'Leave it with me, I’ll sort it out.'], ['on second thought', '转念一想', 'On second thought, let’s walk.'], ['give it a go', '试一试', 'I’ve never surfed, but I’ll give it a go.'],
   ['catch up', '叙旧', 'Let’s catch up over coffee.'], ['wrap up', '收尾', 'We should wrap up by five.'], ['bear with me', '稍等我一下', 'Bear with me while I find the file.'], ['a heads-up', '提前说一声', 'Thanks for the heads-up.']
  ].forEach(function (c, i) { add(c[0], c[1], c[2], '', now - (5 + i * 0.3) * DAY); });
  function changed() { subs.forEach(function (f) { f(); }); }
  var S = [
    ['我今天实在不想做饭，咱们点外卖吧。', 'I really don’t feel like cooking today. Let’s just order in.', [['don’t feel like doing', '不想做…', 'I don’t feel like going out tonight.'], ['order in', '点外卖', 'We ordered in and watched a film.']]],
    ['这件事我们改天再聊吧，我得先走了。', 'Let’s pick this up another day. I’ve got to run.', [['pick this up', '回头接着聊', 'Can we pick this up after lunch?'], ['another day', '改天', 'Let’s do it another day.'], ['I’ve got to run', '我得先走了', 'Sorry, I’ve got to run.']]],
    ['我本来想早点到的，结果路上堵得要命。', 'I meant to get here early, but the traffic was a nightmare.', [['meant to', '本来想', 'I meant to call you yesterday.'], ['was a nightmare', '糟透了', 'Parking was a nightmare.']]],
    ['别着急，慢慢来，我们时间很充裕。', 'No rush, take your time. We’ve got plenty of time.', [['no rush', '不着急', 'No rush, send it whenever.'], ['take your time', '慢慢来', 'Take your time, I’ll wait.'], ['plenty of', '很充裕', 'There’s plenty of room.']]]
  ];

  P.mount('proto', function (root) {
    P.css('ck1', [
      '#proto .ck{position:absolute;inset:0;padding:20px 22px 0;display:flex;flex-direction:column}',
      '#proto .in{border:1px solid #141414;background:#fff;padding:14px 16px;font-size:20px;line-height:1.4;min-height:86px}',
      '#proto .go{margin-top:10px;background:#141414;color:#F7F5F0;width:100%}',
      '#proto .go:disabled{opacity:.45;cursor:default}',
      '#proto .rs{margin-top:14px;flex:1;min-height:0;overflow:hidden}',
      '#proto .en{font-size:19px;font-weight:600;line-height:1.35;letter-spacing:-.015em;margin:0 0 10px}',
      '#proto .en mark{background:none;color:inherit;box-shadow:inset 0 -2px 0 ' + P.blue + '}',
      '#proto .bn{display:inline-block;padding:4px 10px;font-size:12px;font-weight:500;margin-bottom:8px}',
      '#proto .bn.g{background:' + P.green + ';color:#F7F5F0}#proto .bn.x{background:#DAD7CF;color:#141414}',
      '#proto .ph{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:7px 0;border-top:1px solid #CFCCC4;font-size:14px;animation:ckin .4s both}',
      '#proto .ph b{font-weight:600}#proto .ph span{color:#6A6862}#proto .ph em{grid-column:1/3;font-size:12.5px;color:#6A6862}',
      '#proto .ph.dup b,#proto .ph.dup span,#proto .ph.dup em{color:#BDB9B0}',
      '#proto .dk{border-top:1px solid #141414;padding:12px 0 14px;display:flex;align-items:center;gap:5px}',
      '#proto .dk i{display:block;width:16px;height:16px;border:1px solid #BDB9B0;transition:background .3s,border-color .3s}',
      '#proto .dk i.on{background:#141414;border-color:#141414}',
      '#proto .dk b{margin-left:auto;font-weight:500;font-size:14px}',
      '@keyframes ckin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
    ].join(''));
    var ck = P.h('div', { 'class': 'ck' }, root), inp = P.h('div', { 'class': 'in', lang: 'zh-Hans' }, ck), go = P.h('button', { type: 'button', 'class': 'go' }, ck), rs = P.h('div', { 'class': 'rs', 'aria-live': 'polite' }, ck), dk = P.h('div', { 'class': 'dk' }, ck);
    var sq = []; for (var i = 0; i < 10; i++) sq.push(P.h('i', {}, dk)); var cnt = P.h('b', { 'class': 'num' }, dk);
    var idx = 0, shown = false, busy = false;
    function gate() { sq.forEach(function (s, i) { s.classList.toggle('on', i < deck.length); }); cnt.textContent = deck.length + (deck.length < 10 ? ' / 10' : ' cards'); }
    function ui() { inp.textContent = S[idx % S.length][0]; go.textContent = busy ? 'Translating…' : shown ? 'Next sentence' : 'Translate'; go.disabled = busy; gate(); }
    function result() {
      var s = S[idx % S.length], have = {}, saved = 0, skipped = 0;
      deck.forEach(function (c) { have[norm(c.en)] = 1; });
      rs.textContent = '';
      var en = P.h('p', { 'class': 'en' }, rs), html = s[1];
      s[2].forEach(function (p) { var key = p[0].replace(' doing', ''); html = html.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), function (m) { return '<mark>' + m + '</mark>'; }); });
      en.innerHTML = html;
      var bn = P.h('span', { 'class': 'bn' }, rs);
      s[2].forEach(function (p, k) {
        var dup = have[norm(p[0])];
        if (dup) skipped++; else { saved++; add(p[0], p[1], p[2], s[0], now); have[norm(p[0])] = 1; }
        var r = P.h('div', { 'class': 'ph' + (dup ? ' dup' : ''), style: 'animation-delay:' + (120 + k * 90) + 'ms' }, rs);
        P.h('b', { text: p[0] }, r); P.h('span', { text: p[1], lang: 'zh-Hans' }, r); P.h('em', { text: p[2] }, r);
      });
      bn.className = 'bn ' + (saved ? 'g' : 'x');
      bn.textContent = saved ? 'Saved ' + saved + (saved === 1 ? ' card' : ' cards') + (skipped ? ' · rest already in deck' : '') : 'Already in deck';
      changed();
    }
    go.addEventListener('click', function () {
      if (busy) return;
      if (shown) { idx++; shown = false; rs.textContent = ''; ui(); return; }
      busy = true; ui();
      setTimeout(function () { busy = false; shown = true; result(); ui(); }, P.reduce ? 0 : 650);
    });
    subs.push(gate); ui();
  });

  P.mount('proto2', function (root) {
    P.css('ck2', [
      '#proto2 .rv{position:absolute;inset:0;overflow:hidden}',
      '#proto2 .gl{position:absolute;top:0;height:330px;width:120px;opacity:0;pointer-events:none;transition:opacity .1s}',
      '#proto2 .gl.l{left:0;background:linear-gradient(90deg,rgba(217,65,44,.55),transparent)}#proto2 .gl.r{right:0;background:linear-gradient(270deg,rgba(31,138,112,.55),transparent)}',
      '#proto2 .tp{position:absolute;left:22px;right:22px;top:14px;display:flex;justify-content:space-between;font-size:12px;color:#6A6862}',
      '#proto2 .sg{position:absolute;left:0;right:0;top:44px;height:270px;display:flex;align-items:center;justify-content:center;perspective:1000px;touch-action:pan-y;cursor:grab;outline-offset:-4px}',
      '#proto2 .dr{width:min(300px,78%);height:250px;will-change:transform}',
      '#proto2 .fc{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .45s cubic-bezier(.2,.8,.2,1)}',
      '#proto2 .fc.fl{transform:rotateY(180deg)}',
      '#proto2 .fa{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fff;border:1px solid #141414;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:18px;text-align:center}',
      '#proto2 .fa.bk{transform:rotateY(180deg)}',
      '#proto2 .fa b{font-size:26px;font-weight:600;line-height:1.3;letter-spacing:-.02em}#proto2 .fa span{font-size:15px;color:#6A6862}#proto2 .fa em{font-size:13px;color:#6A6862}',
      '#proto2 .em{position:absolute;left:0;right:0;top:44px;height:270px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:0 30px}',
      '#proto2 .em b{font-size:22px;font-weight:600;letter-spacing:-.02em}#proto2 .em span{font-size:14px;color:#6A6862}',
      '#proto2 .ax{position:absolute;left:0;right:0;bottom:0;height:190px;border-top:1px solid #141414}',
      '#proto2 .ax svg{width:100%;height:100%}',
      '#proto2 .lg{position:absolute;left:22px;bottom:162px;font-size:13px;font-weight:500}'
    ].join(''));
    var rv = P.h('div', { 'class': 'rv' }, root), gl = P.h('div', { 'class': 'gl l' }, rv), gr = P.h('div', { 'class': 'gl r' }, rv);
    var tp = P.h('div', { 'class': 'tp' }, rv), tA = P.h('span', { 'class': 'num' }, tp), tB = P.h('span', { 'class': 'num' }, tp);
    var sg = P.h('div', { 'class': 'sg', tabindex: '0', role: 'group', 'aria-label': 'Flashcard. Space flips, right arrow grades it remembered, left arrow forgotten.' }, rv), dr = P.h('div', { 'class': 'dr' }, sg), fc = P.h('div', { 'class': 'fc' }, dr);
    var fF = P.h('div', { 'class': 'fa' }, fc), fB = P.h('div', { 'class': 'fa bk' }, fc);
    var em = P.h('div', { 'class': 'em' }, rv), eT = P.h('b', {}, em), eS = P.h('span', {}, em), eB = P.h('button', { type: 'button' }, em);
    var ax = P.h('div', { 'class': 'ax' }, rv), svg = P.s('svg', { viewBox: '0 0 520 190', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, ax), lg = P.h('div', { 'class': 'lg num' }, rv);
    var day0 = now, queue = [], cur = null, flipped = false, out = false, lastRated = null, hist = [];
    var XM = 90, AW = 520; function X(d) { return 22 + (AW - 44) * Math.sqrt(Math.min(d, XM) / XM); } function Y(r) { return 50 + (1 - r) / 0.5 * 100; }
    function build() { queue = deck.filter(function (c) { return curR(c, now) < RET; }).sort(function (a, b) { return curR(a, now) - curR(b, now); }).slice(0, 30); }
    function plot() {
      var h = '<line x1="22" x2="' + (AW - 22) + '" y1="' + Y(RET) + '" y2="' + Y(RET) + '" stroke="#141414" stroke-dasharray="3 4" stroke-width="1" vector-effect="non-scaling-stroke"/>';
      [1, 7, 30, 90].forEach(function (d) { h += '<line x1="' + X(d) + '" x2="' + X(d) + '" y1="160" y2="168" stroke="#141414" vector-effect="non-scaling-stroke"/><text x="' + X(d) + '" y="182" font-size="11" fill="#6A6862" text-anchor="middle">' + d + ' d</text>'; });
      h += '<line x1="22" x2="' + (AW - 22) + '" y1="160" y2="160" stroke="#141414" vector-effect="non-scaling-stroke"/>';
      hist.concat(lastRated ? [lastRated] : []).forEach(function (c, i, a) {
        var lastOne = i === a.length - 1, p = '';
        for (var d = 0; d <= XM; d += 0.5) { p += (d ? 'L' : 'M') + X(d).toFixed(1) + ' ' + Y(Math.max(0.5, retr(d, c.s))).toFixed(1); }
        h += '<path d="' + p + '" fill="none" stroke="' + (lastOne ? (c.g === 1 ? P.red : P.green) : '#CFCCC4') + '" stroke-width="' + (lastOne ? 2 : 1) + '" vector-effect="non-scaling-stroke"/>';
        if (lastOne) h += '<rect x="' + (X(c.iv) - 4) + '" y="' + (Y(RET) - 4) + '" width="8" height="8" fill="#141414"/>';
      });
      svg.innerHTML = h;
      lg.textContent = lastRated ? ({ 1: 'Forgot', 3: 'Good', 4: 'Easy' })[lastRated.g] + ' · back in ' + (lastRated.iv < 10 ? lastRated.iv.toFixed(1) : Math.round(lastRated.iv)) + ' days' : '';
    }
    function face() {
      fF.textContent = ''; fB.textContent = ''; if (!cur) return;
      P.h('b', { text: cur.zh, lang: 'zh-Hans' }, fF);
      P.h('b', { text: cur.en }, fB); P.h('span', { text: cur.zh, lang: 'zh-Hans' }, fB); if (cur.ex) P.h('em', { text: cur.ex }, fB);
    }
    function setDrag(x, anim) { dr.style.transition = anim ? 'transform ' + anim : 'none'; dr.style.transform = 'translateX(' + x + 'px) rotate(' + (x / 30) + 'deg)'; dr.style.transformOrigin = 'bottom center'; }
    function glow(p) { gl.style.opacity = p < 0 ? Math.min(1, -p) : 0; gr.style.opacity = p > 0 ? Math.min(1, p) : 0; }
    function view() {
      var dayN = Math.round((now - day0) / DAY);
      tA.textContent = 'Day ' + dayN; tB.textContent = cur ? (queue.indexOf(cur) + 1) + ' / ' + queue.length : '';
      var locked = deck.length < 10;
      sg.style.display = cur && !locked ? '' : 'none'; em.style.display = cur && !locked ? 'none' : '';
      if (locked) { eT.textContent = 'Translate a few more sentences'; eS.textContent = 'Review opens at 10 cards. Now ' + deck.length + ' / 10'; eB.style.display = 'none'; }
      else if (!cur) {
        var next = Math.min.apply(null, deck.map(function (c) { return c.state === 1 ? c.due : c.made + W[2] * DAY; }));
        eT.textContent = 'Done for today'; eS.textContent = 'The next card is due in ' + Math.max(1, Math.ceil((next - now) / DAY)) + ' days'; eB.style.display = ''; eB.textContent = 'Skip to that day';
        eB.onclick = function () { now = Math.max(now + DAY, next + 0.6 * DAY); start(); };
      }
      plot();
    }
    function start() { build(); cur = queue[0] || null; flipped = false; fc.classList.remove('fl'); face(); setDrag(0); glow(0); out = false; view(); }
    function grade(g) {
      if (!cur || out) return; out = true;
      setDrag(g === 1 ? -700 : 700, '.2s ease-in');
      setTimeout(function () {
        rate(cur, g, now); if (lastRated) { hist.push(lastRated); if (hist.length > 6) hist.shift(); }
        lastRated = { s: cur.s, iv: cur.iv, g: g };
        var i = queue.indexOf(cur); cur = queue[i + 1] || null; flipped = false;
        fc.style.transition = 'none'; fc.classList.remove('fl'); face(); setDrag(0); void fc.offsetWidth; fc.style.transition = ''; glow(0); out = false; view();
      }, P.reduce ? 0 : 200);
    }
    function flip() { if (cur && !flipped) { flipped = true; fc.classList.add('fl'); } }
    var moved = false, TH = 90;
    P.drag(sg, function (dx, e, dy) {
      if (out) return; if (!moved && Math.abs(dx) < 8) return;
      if (!moved && Math.abs(dx) <= Math.abs(dy)) return;
      moved = true; setDrag(dx); glow(cl(dx / TH, -1, 1));
    }, function (dx) {
      if (out) return;
      if (moved && Math.abs(dx) >= TH) { grade(dx < 0 ? 1 : flipped ? 3 : 4); }
      else { setDrag(0, '.3s cubic-bezier(.2,.9,.4,1.1)'); glow(0); if (!moved) flip(); }
      moved = false;
    }, function () { moved = false; });
    sg.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); grade(flipped ? 3 : 4); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); grade(1); }
    });
    subs.push(function () { if (!cur) start(); else view(); });
    new ResizeObserver(function () { AW = Math.max(240, ax.clientWidth); svg.setAttribute('viewBox', '0 0 ' + AW + ' 190'); plot(); }).observe(ax);
    start();
  });
})();
