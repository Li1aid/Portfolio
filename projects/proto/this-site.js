// This Portfolio: three specimens taken from the homepage itself, using the same formulas and the same sprites.
(function () {
  var P = window.P, SPR = window.SPR || { knight: {}, skel: [], name: [] };

  // 1. One Scroll: a small copy of the timeline. One number (scroll) sets zoom, pan, clip widths, pinned words and parallax.
  P.mount('proto', function (root) {
    P.css('ts1', [
      '#proto .st{position:absolute;left:0;right:0;top:0;bottom:104px;overflow:hidden;cursor:grab;touch-action:pan-y}',
      '#proto .st:active{cursor:grabbing}',
      '#proto .wd{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;will-change:transform}',
      '#proto .ln{position:absolute;left:-400px;width:3200px;height:1px;background:#141414}',
      '#proto .pin{position:absolute;left:0;font-weight:600;font-size:92px;line-height:70px;letter-spacing:-.045em;white-space:nowrap;will-change:transform}',
      '#proto .cl{position:absolute;height:70px;display:flex;align-items:flex-end;padding:0 8px 6px;font-size:11px;font-weight:500;color:#F7F5F0;overflow:hidden;white-space:nowrap;will-change:transform,width}',
      '#proto .yr{position:absolute;top:44px;font-size:10px;color:#6A6862;padding-left:4px;border-left:1px solid #141414;height:16px;line-height:10px}',
      '#proto .lay{position:absolute;left:0;top:0;will-change:transform}',
      '#proto .lay i{position:absolute;display:block}',
      '#proto .ph{position:absolute;left:50%;top:0;bottom:0;width:1px;background:#141414;pointer-events:none}',
      '#proto .ct{position:absolute;left:20px;right:20px;bottom:0;height:104px}',
      '#proto .rd{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;border-top:1px solid #CFCCC4;padding-top:10px}',
      '#proto .rd span{display:block;font-size:11px;color:#6A6862}',
      '#proto .rd b{display:block;font-weight:500;font-size:20px;letter-spacing:-.02em;line-height:1.2}'
    ].join(''));
    var st = P.h('div', { 'class': 'st' }, root), wd = P.h('div', { 'class': 'wd' }, st);
    var STARTX = 20, ENDX = 1900, ZLEN = 280, CY = 142, M = 20, BASEW = 150, EXTRA = 50, R = BASEW * 0.9;
    [60, 140, 160, 230].forEach(function (y) { P.h('div', { 'class': 'ln', style: 'top:' + y + 'px' }, wd); });
    var far = P.h('div', { 'class': 'lay' }, wd), mid = P.h('div', { 'class': 'lay' }, wd);
    [[1230, 78, 46, 10], [1420, 90, 60, 10], [1640, 74, 40, 10]].forEach(function (c) { P.h('i', { style: 'left:' + c[0] + 'px;top:' + c[1] + 'px;width:' + c[2] + 'px;height:' + c[3] + 'px;background:#DAD7CF' }, far); });
    [[1210, 116], [1330, 110], [1480, 118], [1600, 112], [1740, 116]].forEach(function (c) { P.h('i', { style: 'left:' + c[0] + 'px;top:' + c[1] + 'px;width:10px;height:' + (140 - c[1]) + 'px;background:#BDB9B0' }, mid); });
    var names = [['CoLab', 1, 520, 0], ['Gyn Dashboard', 1, 676, 1], ['Chunks', 1, 832, 1], ['This Portfolio', 1, 988, 1], ['ANNO', 2, 1150, 0], ['VividXperience', 2, 1306, 0], ['Whisperfield', 2, 1462, 0], ['Investment', 2, 1618, 1]];
    var lanes = { 1: [], 2: [] };
    names.forEach(function (n) {
      var el = P.h('div', { 'class': 'cl', text: n[0], style: 'left:' + n[2] + 'px;top:' + (n[1] === 1 ? 70 : 160) + 'px;width:' + BASEW + 'px;background:' + (n[3] ? P.red : P.blue) }, wd);
      lanes[n[1]].push({ el: el, x0: n[2], c0: n[2] + BASEW / 2, x: n[2], w: BASEW });
    });
    var pins = [P.h('div', { 'class': 'pin', text: 'DESIGN', style: 'top:70px;color:' + P.blue }, wd), P.h('div', { 'class': 'pin', text: 'PRODUCTS', style: 'top:160px;color:' + P.red }, wd)];
    P.h('div', { style: 'position:absolute;left:' + ENDX + 'px;top:160px;width:900px;height:70px;background:' + P.yellow }, wd);
    P.h('div', { 'class': 'ph' }, st);
    var ct = P.h('div', { 'class': 'ct' }, root);
    var S = { W: 0, H: 0, max: 1 }, sx = 0, touched = false;
    var rng = P.range(ct, 0, 1000, 0, 1, 'Scroll position', function (v) { touched = true; sx = v / 1000 * S.max; draw(); });
    var rd = P.h('div', { 'class': 'rd' }, ct), out = {};
    [['scroll', 'Scroll'], ['zoom', 'Zoom'], ['clip', 'Clip under playhead'], ['par', 'Background layers']].forEach(function (k) { var c = P.h('div', {}, rd); P.h('span', { text: k[1] }, c); out[k[0]] = P.h('b', { 'class': 'num' }, c); });
    function measure() {
      S.W = st.clientWidth; S.H = st.clientHeight; S.cx = S.W / 2; S.cy = S.H / 2;
      S.z0 = Math.min(S.H * 0.9 / 215, (S.W - 2 * M) / 430); S.z1 = S.z0 * 0.72; S.zE = S.z0;
      S.p0 = STARTX + (S.cx - M) / S.z0; S.pend = ENDX + (S.cx - M) / S.zE; S.max = S.pend - S.p0;
    }
    function draw() {
      sx = P.clamp(sx, 0, S.max);
      var Pp = S.p0 + sx, k1 = P.smooth(sx / ZLEN), k2 = P.smooth((sx - (S.max - ZLEN)) / ZLEN);
      var z = S.z0 + (S.z1 - S.z0) * k1 + (S.zE - S.z1) * k2, iz = 1 / z, best = 0;
      wd.style.transform = 'translate(' + S.cx.toFixed(1) + 'px,' + S.cy.toFixed(1) + 'px) scale(' + z.toFixed(4) + ') translate(' + (-Pp).toFixed(1) + 'px,' + (-CY) + 'px)';
      [1, 2].forEach(function (ln, li) {
        var L = lanes[ln], E = 0, pre = 0;
        L.forEach(function (c) { c.fo = P.smooth(1 - Math.min(1, Math.abs(Pp - c.c0) / R)); c.e = EXTRA * c.fo; E += c.e * P.clamp((Pp - c.x0) / BASEW, 0, 1); best = Math.max(best, c.e); });
        L.forEach(function (c) { c.x = c.x0 + pre - E; c.w = BASEW + c.e; pre += c.e; c.el.style.transform = 'translateX(' + (c.x - c.x0).toFixed(1) + 'px)'; c.el.style.width = c.w.toFixed(1) + 'px'; });
        var pin = pins[li], want = Pp - (S.cx - M) * iz, b = L[0].x;
        pin.style.transform = 'translateX(' + Math.min(want, b - pin.offsetWidth - 14).toFixed(1) + 'px)';
      });
      var pc = Pp - 1500;
      far.style.transform = 'translateX(' + P.clamp(0.7 * pc, -700, 700).toFixed(1) + 'px)';
      mid.style.transform = 'translateX(' + P.clamp(0.4 * pc, -400, 400).toFixed(1) + 'px)';
      out.scroll.textContent = Math.round(sx) + ' px';
      out.zoom.textContent = Math.round(z / S.z0 * 100) + '%';
      out.clip.textContent = '+' + Math.round(best) + ' px';
      out.par.textContent = Math.round(P.clamp(0.7 * pc, -700, 700)) + ' / ' + Math.round(P.clamp(0.4 * pc, -400, 400));
      rng.value = Math.round(sx / S.max * 1000);
    }
    var sx0 = 0;
    P.drag(st, function (dx) { sx = sx0 - dx / (S.z1 || 1); draw(); }, null, function () { touched = true; sx0 = sx; });
    new ResizeObserver(function () { var f = S.max ? sx / S.max : 0; measure(); sx = f * S.max; draw(); }).observe(st);
    measure(); draw();
    // one slow pass when it first comes into view, until someone takes over
    var t0 = null;
    P.loop(root, function (dt, t) {
      if (touched || P.reduce) return;
      if (t0 === null) t0 = t;
      var u = (t - t0) / 9000; if (u > 1) { touched = true; return; }
      sx = S.max * 0.62 * P.smooth(u); draw();
    });
  });

  // 2. Push: the real knight and skeletons. Frame choice and skeleton state depend only on distance.
  P.mount('proto2', function (root) {
    P.css('ts2', [
      '#proto2{--c1:#2247C9;--c2:#D9412C;--c3:#F2C12E}','#proto2 .st{position:absolute;left:0;right:0;top:0;height:300px;overflow:hidden}',
      '#proto2 .wl{position:absolute;left:0;top:44px;width:1000px;height:223px;transform-origin:0 0}',
      '#proto2 .gd{position:absolute;left:-2000px;right:-2000px;top:223px;height:1px;background:#141414}',
      '#proto2 .ct{position:absolute;left:20px;right:20px;top:300px}',
      '#proto2 .fs{position:absolute;left:20px;right:20px;bottom:16px;display:grid;grid-template-columns:repeat(8,1fr);gap:8px}',
      '#proto2 .fs div{border:1px solid #CFCCC4;padding:4px 4px 6px;font-size:11px;color:#6A6862;text-align:center;line-height:1.2}',
      '#proto2 .fs div[aria-current=true]{border-color:#141414;color:#141414;background:#EFEDE7}',
      '#proto2 .fs svg{width:100%;height:auto;display:block}'
    ].join(''));
    var st = P.h('div', { 'class': 'st' }, root), wl = P.h('div', { 'class': 'wl' }, st);
    P.h('div', { 'class': 'gd' }, wl);
    var BACK = 48, FRONT = 138, RUN = ['r0', 'r1', 'r2', 'r3'], ORDER = ['i0', 'r0', 'r1', 'r2', 'r3', 'a0', 'a1', 'a2'];
    var kn = P.h('span', { style: 'position:absolute;left:0;top:0;width:258px;height:220px;display:block;will-change:transform' }, wl);
    var svg = '<svg viewBox="0 0 86 62" shape-rendering="crispEdges" style="position:absolute;left:0;top:37px;width:258px;height:186px;overflow:visible">';
    ORDER.forEach(function (k) { svg += '<g data-hf="' + k + '" style="display:none">' + (SPR.knight[k] || '') + '</g>'; });
    kn.innerHTML = svg + '</svg>';
    var frames = {}; ORDER.forEach(function (k) { frames[k] = kn.querySelector('[data-hf="' + k + '"]'); });
    var obst = [520, 800].map(function (x, i) {
      var el = P.h('span', { style: 'position:absolute;left:' + (x - 86) + 'px;top:82px;width:141px;height:141px;display:block;clip-path:inset(-300px -400px 0px -400px)' }, wl);
      el.innerHTML = SPR.skel[i % Math.max(1, SPR.skel.length)] || '';
      return { el: el, x: x, body: el.querySelector('[data-sf="body"]'), s0: el.querySelector('[data-sf="s0"]'), s1: el.querySelector('[data-sf="s1"]'), pile: el.querySelector('[data-sf="p"]'), st: null };
    });
    var ct = P.h('div', { 'class': 'ct' }, root), tx = 0, touched = false;
    var rng = P.range(ct, 0, 760, 0, 1, 'Push distance', function (v) { touched = true; tx = v; draw(); });
    var fs = P.h('div', { 'class': 'fs' }, root), cells = {};
    ORDER.forEach(function (k) {
      var c = P.h('div', {}, fs);
      c.innerHTML = '<svg viewBox="14 0 62 62" shape-rendering="crispEdges">' + (SPR.knight[k] || '') + '</svg>' + ({ i0: 'idle', r0: 'run 1', r1: 'run 2', r2: 'run 3', r3: 'run 4', a0: 'attack 1', a1: 'attack 2', a2: 'attack 3' })[k];
      cells[k] = c;
    });
    var pose = null;
    function draw() {
      kn.style.transform = 'translateX(' + tx.toFixed(1) + 'px)';
      var p = tx > 0 && tx < 760 ? RUN[Math.floor(tx / 22) % 4] : 'i0', front = tx + FRONT;
      obst.forEach(function (o) {
        var qd = front - o.x;
        if (qd >= -196 && qd < -131) p = 'a0'; else if (qd >= -131 && qd < -70) p = 'a1'; else if (qd >= -70 && qd < -25) p = 'a2';
        var s = qd < -260 ? 0 : (qd < -70 ? 1 : 2), rot = P.clamp((qd + 128) / 58, 0, 1) * 88, op = s === 2 ? P.clamp(1 - (qd + 60) / 90, 0, 1) : 1;
        if (s !== o.st) {
          o.st = s;
          if (o.s0) o.s0.style.display = s === 0 ? '' : 'none';
          if (o.s1) o.s1.style.display = s === 1 ? '' : 'none';
          if (o.body) o.body.style.display = s === 2 ? 'none' : '';
          if (o.pile) o.pile.style.display = s === 2 ? '' : 'none';
        }
        if (o.body) o.body.style.transform = 'rotate(' + rot.toFixed(1) + 'deg)';
        o.el.style.opacity = op.toFixed(2);
      });
      if (p !== pose) { for (var k in frames) { if (frames[k]) frames[k].style.display = k === p ? '' : 'none'; cells[k].setAttribute('aria-current', k === p ? 'true' : 'false'); } pose = p; }
      rng.value = Math.round(tx);
    }
    function fit() { var s = Math.min(1, (st.clientWidth - 20) / 1000); wl.style.transform = 'translateX(10px) scale(' + s.toFixed(3) + ')'; }
    new ResizeObserver(fit).observe(st); fit(); draw();
    var tx0 = 0;
    P.drag(st, function (dx) { tx = P.clamp(tx0 + dx / Math.min(1, (st.clientWidth - 20) / 1000), 0, 760); draw(); }, null, function () { touched = true; tx0 = tx; });
    st.style.cursor = 'ew-resize'; st.style.touchAction = 'pan-y';
    var t0 = null;
    P.loop(root, function (dt, t) {
      if (touched || P.reduce) return;
      if (t0 === null) t0 = t;
      var u = (t - t0) / 7000; if (u > 1) { touched = true; return; }
      tx = 460 * u; draw();
    });
  });

  // 3. Outline Draw: the nine letter outlines, drawn with a dash offset and then filled. Same timing as the homepage.
  P.mount('proto3', function (root) {
    P.css('ts3', [
      '#proto3 .nm{fill:#141414;stroke:#141414;stroke-width:1.1;stroke-linejoin:round}',
      '#proto3 .top{position:absolute;left:40px;right:40px;top:0;height:230px;display:flex;align-items:center}',
      '#proto3 .top svg{width:100%;height:auto;overflow:visible}',
      '#proto3 .bars{position:absolute;left:40px;right:40px;top:236px;display:grid;grid-template-columns:28px 1fr;row-gap:5px;align-items:center;font-size:11px;color:#6A6862}',
      '#proto3 .bars i{display:block;height:6px;background:#CFCCC4;position:relative}',
      '#proto3 .bars i b{position:absolute;left:0;top:0;bottom:0;background:#141414}',
      '#proto3 .ct{position:absolute;left:40px;right:40px;bottom:14px;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center}'
    ].join(''));
    var top = P.h('div', { 'class': 'top' }, root);
    var svg = P.s('svg', { viewBox: '0 6 720 62', role: 'img', 'aria-label': 'AIDEN YANG' }, top);
    var L = SPR.name.map(function (l) { var len = +l.l || 300; return { len: len, el: P.s('path', { 'class': 'nm', d: l.d, 'stroke-dasharray': len }, svg) }; });
    var maxLen = Math.max.apply(null, L.map(function (l) { return l.len; }).concat([1]));
    var bars = P.h('div', { 'class': 'bars' }, root);
    'AIDENYANG'.split('').forEach(function (ch, i) { if (!L[i]) return; P.h('span', { text: ch }, bars); var tr = P.h('i', { style: 'width:' + (L[i].len / maxLen * 100).toFixed(1) + '%' }, bars); L[i].bar = P.h('b', {}, tr); });
    var ct = P.h('div', { 'class': 'ct' }, root), T = 1.95, t = T, playing = false;
    var rng = P.range(ct, 0, 1000, 1000, 1, 'Draw progress', function (v) { playing = false; t = v / 1000 * T; draw(); });
    var btn = P.h('button', { type: 'button', text: 'Replay' }, ct);
    function ease(u) { return u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u); }
    function draw() {
      L.forEach(function (l, i) {
        var u = P.clamp((t - 0.1 * i) / 1.15, 0, 1), d = ease(Math.min(1, u / 0.62)), f = P.clamp((u - 0.62) / 0.38, 0, 1);
        l.el.style.strokeDashoffset = (l.len * (1 - d)).toFixed(1);
        l.el.style.fillOpacity = f.toFixed(2);
        l.el.style.strokeOpacity = u > 0 ? 1 : 0;
        if (l.bar) l.bar.style.width = (d * 100).toFixed(1) + '%';
      });
      rng.value = Math.round(t / T * 1000);
    }
    btn.addEventListener('click', function () { t = 0; playing = true; draw(); });
    var seen = false;
    P.loop(root, function (dt) {
      if (!seen) { seen = true; if (!P.reduce) { t = 0; playing = true; } }
      if (!playing) return;
      t += dt / 1000 * 0.8; if (t >= T) { t = T; playing = false; }
      draw();
    });
    draw();
  });
})();
