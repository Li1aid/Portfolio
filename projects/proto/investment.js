// Investment Assistant: the dashboard's central idea in one frame. Everything, in any currency, is measured against one pool of money:
// what each position takes from it, and what is left. The week strip opens into the month, as in the real page. All figures are made up.
(function () {
  var P = window.P;
  P.mount('proto', function (root) {
    P.css('iv1', [
      '#proto .iv{position:absolute;inset:0;padding:18px 22px 0;display:flex;flex-direction:column}',
      '#proto .tp{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}',
      '#proto .tp small{display:block;font-size:11px;color:#6A6862;margin-bottom:2px}',
      '#proto .tp b{display:block;font-weight:500;font-size:clamp(34px,5vw,54px);line-height:1;letter-spacing:-.04em}',
      '#proto .tp em{font-style:normal;font-size:13px;display:block;margin-top:6px}',
      '#proto .cc{display:flex}#proto .cc button{min-height:36px;padding:0 14px;font-size:13px}#proto .cc button+button{border-left:0}',
      '#proto .pl{display:flex;height:40px;margin-top:16px;border:1px solid #141414;overflow:hidden}',
      '#proto .pl i{display:flex;align-items:center;padding-left:8px;font-style:normal;font-size:11px;font-weight:500;color:#F7F5F0;overflow:hidden;white-space:nowrap;transition:flex-grow .35s cubic-bezier(.2,.8,.2,1);flex-basis:0;min-width:0;border-right:1px solid #F7F5F0}',
      '#proto .pl i.cash{background:repeating-linear-gradient(135deg,transparent 0 6px,#DAD7CF 6px 7px);color:#141414;border-right:0}',
      '#proto .tb{flex:1;min-height:0;margin-top:10px;overflow:auto}',
      '#proto .rw{display:grid;grid-template-columns:14px 1.2fr 1.6fr 118px 1fr 70px;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid #CFCCC4;font-size:13.5px}',
      '#proto .rw>i{display:block;width:12px;height:12px}',
      '#proto .rw span{color:#6A6862;font-size:12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
      '#proto .rw .q{display:flex;align-items:center;gap:6px;justify-content:space-between}',
      '#proto .rw .q button{min-height:30px;width:30px;padding:0;font-size:16px;line-height:1}',
      '#proto .rw .v{text-align:right}#proto .rw .p{text-align:right;font-weight:500}',
      '#proto .rw.cash b,#proto .rw.cash .p{font-weight:500}#proto .neg{color:#D9412C}',
      '#proto .cal{border-top:1px solid #141414;padding:8px 0 12px;cursor:pointer}',
      '#proto .gr{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}',
      '#proto .gr div{font-size:11px;padding:4px 6px;min-height:36px;border:1px solid #DAD7CF;line-height:1.25}',
      '#proto .gr div b{display:block;font-weight:500}',
      '#proto .gr div.up{background:rgba(31,138,112,.14);border-color:rgba(31,138,112,.5)}#proto .gr div.dn{background:rgba(217,65,44,.12);border-color:rgba(217,65,44,.45)}',
      '#proto .gr div.td{outline:1.5px solid #141414;outline-offset:-1px}#proto .gr div.off{opacity:.35}',
      '@media(max-width:760px){#proto{height:auto}#proto .iv{position:relative;padding:16px 14px 0}#proto .rw{grid-template-columns:12px 1fr 104px 58px;gap:8px}#proto .rw span,#proto .rw .v{display:none}#proto .tb{overflow:visible}}'
    ].join(''));
    var FX = { CNY: 1, USD: 7.1, AUD: 4.7, HKD: 0.91 }, SYM = { CNY: '¥', AUD: 'A$' }, COL = { CNY: P.red, USD: P.blue, AUD: P.green, HKD: P.yellow }, POOL = 100000;
    var H = [
      { s: 'NVDA', n: 'NVIDIA · US', c: 'USD', q: 10, lot: 2, px: 140, cost: 100 },
      { s: '513120', n: 'HK Innovative Drug ETF · A-share', c: 'CNY', q: 12000, lot: 2000, px: 1.25, cost: 1.0 },
      { s: 'IOO', n: 'Global 100 · ASX', c: 'AUD', q: 20, lot: 5, px: 160, cost: 150 },
      { s: '0700', n: 'Tencent · Hong Kong', c: 'HKD', q: 30, lot: 10, px: 520, cost: 480 },
      { s: 'AU9999', n: 'Gold, grams · Shanghai', c: 'CNY', q: 20, lot: 5, px: 780, cost: 720 }
    ];
    var iv = P.h('div', { 'class': 'iv' }, root), tp = P.h('div', { 'class': 'tp' }, iv), tl = P.h('div', {}, tp), lab = P.h('small', {}, tl), big = P.h('b', { 'class': 'num' }, tl), dlt = P.h('em', { 'class': 'num' }, tl);
    var cc = P.h('div', { 'class': 'cc' }, tp), ccy = 'CNY', cb = {};
    ['CNY', 'AUD'].forEach(function (c) { cb[c] = P.h('button', { type: 'button', text: c }, cc); cb[c].addEventListener('click', function () { ccy = c; draw(); }); });
    var pl = P.h('div', { 'class': 'pl', 'aria-hidden': 'true' }, iv), seg = H.map(function (h) { return P.h('i', { text: h.s, style: 'background:' + COL[h.c] + (h.c === 'HKD' ? ';color:#141414' : '') }, pl); }), cashSeg = P.h('i', { 'class': 'cash' }, pl);
    var tb = P.h('div', { 'class': 'tb' }, iv), rows = H.map(function (h) {
      var r = P.h('div', { 'class': 'rw' }, tb); P.h('i', { style: 'background:' + COL[h.c] }, r); P.h('b', { text: h.s }, r); P.h('span', { text: h.n }, r);
      var q = P.h('div', { 'class': 'q' }, r), m = P.h('button', { type: 'button', text: '−', 'aria-label': 'Sell ' + h.s }, q), qt = P.h('div', { 'class': 'num' }, q), p = P.h('button', { type: 'button', text: '+', 'aria-label': 'Buy ' + h.s }, q);
      m.addEventListener('click', function () { h.q = Math.max(0, h.q - h.lot); draw(); }); p.addEventListener('click', function () { h.q += h.lot; draw(); });
      return { q: qt, v: P.h('div', { 'class': 'v num' }, r), p: P.h('div', { 'class': 'p num' }, r) };
    });
    var cr = P.h('div', { 'class': 'rw cash' }, tb); P.h('i', { style: 'background:repeating-linear-gradient(135deg,transparent 0 3px,#8B8880 3px 4px)' }, cr); P.h('b', { text: 'Cash left' }, cr); P.h('span', { text: 'in the pool' }, cr); P.h('div', {}, cr);
    var cv = P.h('div', { 'class': 'v num' }, cr), cp = P.h('div', { 'class': 'p num' }, cr);
    var cal = P.h('div', { 'class': 'cal', role: 'button', tabindex: '0', 'aria-expanded': 'false', 'aria-label': 'Profit and loss calendar' }, iv), gr = P.h('div', { 'class': 'gr' }, cal), open = false;
    function fmt(v) { return Math.round(v).toLocaleString('en-AU'); }
    function conv(cny) { return cny / FX[ccy]; }
    function dayPnl(d) { var k = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate(), x = Math.sin(k * 12.9898) * 43758.5453; x = x - Math.floor(x); return (x - 0.44) * 2600; }
    function cell(d, today, dim) {
      var wk = d.getDay() === 0 || d.getDay() === 6, fut = d > today, v = wk || fut ? null : dayPnl(d);
      var c = P.h('div', { 'class': (v === null ? '' : v >= 0 ? 'up' : 'dn') + (d.toDateString() === today.toDateString() ? ' td' : '') + (dim ? ' off' : '') }, gr);
      P.h('b', { text: String(d.getDate()) }, c); c.appendChild(document.createTextNode(v === null ? '' : (v >= 0 ? '+' : '−') + SYM[ccy] + fmt(Math.abs(conv(v)))));
    }
    function draw() {
      var tot = 0, cost = 0;
      H.forEach(function (h) { h.v = h.q * h.px * FX[h.c]; tot += h.v; cost += h.q * h.cost * FX[h.c]; });
      var left = POOL - tot, pnl = tot - cost;
      lab.textContent = 'Net worth · ' + ccy + (ccy === 'AUD' ? ' · 1 AUD = ' + FX.AUD.toFixed(2) + ' CNY' : '');
      big.textContent = SYM[ccy] + fmt(conv(tot));
      dlt.textContent = (pnl >= 0 ? '+' : '−') + SYM[ccy] + fmt(Math.abs(conv(pnl))) + ' (' + (cost ? (pnl / cost * 100).toFixed(1) : '0') + '%) since inception'; dlt.style.color = pnl >= 0 ? P.green : P.red;
      ['CNY', 'AUD'].forEach(function (c) { cb[c].setAttribute('aria-pressed', c === ccy ? 'true' : 'false'); });
      H.forEach(function (h, i) { seg[i].style.flexGrow = Math.max(0.0001, h.v); rows[i].q.textContent = fmt(h.q); rows[i].v.textContent = SYM[ccy] + fmt(conv(h.v)); rows[i].p.textContent = (h.v / POOL * 100).toFixed(1) + '%'; });
      cashSeg.style.flexGrow = Math.max(0.0001, left); cashSeg.textContent = left > POOL * 0.08 ? 'Cash' : '';
      cv.textContent = (left < 0 ? '−' : '') + SYM[ccy] + fmt(Math.abs(conv(left))); cp.textContent = (left / POOL * 100).toFixed(1) + '%';
      cv.classList.toggle('neg', left < 0); cp.classList.toggle('neg', left < 0);
      gr.textContent = ''; var today = new Date(), d0 = new Date(today), i;
      if (!open) { d0.setDate(today.getDate() - ((today.getDay() + 6) % 7)); for (i = 0; i < 7; i++) { var d = new Date(d0); d.setDate(d0.getDate() + i); cell(d, today, false); } }
      else { d0 = new Date(today.getFullYear(), today.getMonth(), 1); d0.setDate(1 - ((d0.getDay() + 6) % 7)); for (i = 0; i < 35; i++) { var e = new Date(d0); e.setDate(d0.getDate() + i); cell(e, today, e.getMonth() !== today.getMonth()); } }
      tb.style.display = open ? 'none' : ''; cal.setAttribute('aria-expanded', open ? 'true' : 'false'); cal.style.flex = open ? '1' : '';
    }
    function toggle() { open = !open; draw(); }
    cal.addEventListener('click', toggle); cal.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    draw();
  });
})();
