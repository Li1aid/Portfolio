// CoLab: three specimens, one per part of the product. Values and copy come from the real build
// (lecture chapters and grid presets, tutorial terms and their explanations, the trait groups in Team-up).
(function () {
  var P = window.P, OR = '#F26B38';

  // 1. Playable Lecture: the lecture timeline drives a live grid; the student can drag the same three values.
  P.mount('proto', function (root) {
    P.css('cl1', [
      '#proto .pl{position:absolute;inset:0;display:grid;grid-template-columns:1fr 250px;grid-template-rows:1fr 96px}',
      '#proto .pg{position:relative;margin:24px;background:#fff;border:1px solid #141414;overflow:hidden}',
      '#proto .col{position:absolute;top:0;bottom:0;background:' + OR + ';opacity:.13;transition:left .45s cubic-bezier(.2,.8,.2,1),width .45s cubic-bezier(.2,.8,.2,1),opacity .3s}',
      '#proto .bk{position:absolute;transition:left .45s cubic-bezier(.2,.8,.2,1),width .45s cubic-bezier(.2,.8,.2,1),top .45s,height .45s;overflow:hidden}',
      '#proto .bk.t{font-weight:600;letter-spacing:-.03em;line-height:1;color:#141414;font-size:clamp(20px,3.4vw,40px)}',
      '#proto .bk.i{background:' + OR + '}',
      '#proto .bk.x{background:repeating-linear-gradient(#141414 0 2px,transparent 2px 14px);opacity:.75}',
      '#proto .bk.c{border:1px solid #141414}',
      '#proto .sd{border-left:1px solid #CFCCC4;padding:18px 20px 0;display:flex;flex-direction:column;gap:6px}',
      '#proto .sd label{display:block;font-size:11px;color:#6A6862}',
      '#proto .sd b{display:block;font-weight:500;font-size:34px;line-height:1;letter-spacing:-.03em}',
      '#proto .tl{grid-column:1/3;border-top:1px solid #141414;display:grid;grid-template-columns:96px 1fr;align-items:stretch}',
      '#proto .tl>button{border:0;border-right:1px solid #141414;min-height:0;height:100%;font-size:13px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:12px}',
      '#proto .tk{position:relative;cursor:ew-resize;touch-action:pan-y}',
      '#proto .ch{position:absolute;top:0;bottom:0;border-left:1px solid #CFCCC4;padding:12px 8px;font-size:12px;line-height:1.3;overflow:hidden;white-space:nowrap;pointer-events:none}',
      '#proto .ch span{display:block;color:#6A6862;font-size:11px}',
      '#proto .ch[aria-current=true]{background:#141414;color:#F7F5F0}',
      '#proto .ch[aria-current=true] span{color:#BDB9B0}',
      '#proto .hd{position:absolute;top:0;bottom:0;width:2px;background:' + OR + ';pointer-events:none}',
      '@media(max-width:760px){#proto .pl{grid-template-columns:1fr;grid-template-rows:1fr auto 84px}#proto .sd{border-left:0;border-top:1px solid #CFCCC4;flex-direction:row;padding:8px 16px 0;gap:14px}#proto .sd>div{flex:1}#proto .sd b{font-size:22px}#proto .tl{grid-column:1;grid-template-columns:64px 1fr}#proto .pg{margin:14px}#proto .ch{font-size:0}#proto .ch span{font-size:0}}'
    ].join(''));
    var CH = [['Intro', 0, 3, 8, 20], ['Why grids', 45, 2, 16, 20], ['Columns', 185, 12, 12, 16], ['Baseline', 332, 6, 8, 12], ['Responsive', 550, 4, 20, 16], ['Breaking', 680, 8, 6, 10]], END = 765;
    var pl = P.h('div', { 'class': 'pl' }, root), pg = P.h('div', { 'class': 'pg' }, pl), sd = P.h('div', { 'class': 'sd' }, pl), tl = P.h('div', { 'class': 'tl' }, pl);
    var cols = []; for (var i = 0; i < 12; i++) cols.push(P.h('div', { 'class': 'col' }, pg));
    var bT = P.h('div', { 'class': 'bk t', text: 'Grid Systems in Interaction Design' }, pg), bI = P.h('div', { 'class': 'bk i' }, pg), bX = P.h('div', { 'class': 'bk x' }, pg), cards = [P.h('div', { 'class': 'bk c' }, pg), P.h('div', { 'class': 'bk c' }, pg), P.h('div', { 'class': 'bk c' }, pg)];
    var v = { n: 12, g: 12, m: 16 }, ui = {};
    [['n', 'Columns', 1, 12], ['g', 'Gutter', 0, 24], ['m', 'Margin', 0, 32]].forEach(function (c) {
      var d = P.h('div', {}, sd); P.h('label', { text: c[1] }, d); var b = P.h('b', { 'class': 'num' }, d);
      var r = P.range(d, c[2], c[3], v[c[0]], 1, c[1], function (x) { playing = false; v[c[0]] = x; lay(); });
      ui[c[0]] = { b: b, r: r };
    });
    var play = P.h('button', { type: 'button', 'aria-label': 'Play lecture' }, tl), pLab = P.h('span', { text: 'Play' }, play), pTime = P.h('span', { 'class': 'num' }, play);
    var tk = P.h('div', { 'class': 'tk' }, tl), chEl = CH.map(function (c, i) {
      var e = P.h('div', { 'class': 'ch', style: 'left:' + (c[1] / END * 100) + '%;width:' + (((CH[i + 1] ? CH[i + 1][1] : END) - c[1]) / END * 100) + '%' }, tk);
      e.textContent = c[0]; P.h('span', { text: mmss(c[1]) }, e); return e;
    }), hd = P.h('div', { 'class': 'hd' }, tk);
    var t = 0, cur = -1, playing = false, started = false;
    function mmss(s) { s = Math.floor(s); return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + s % 60).slice(-2); }
    function lay() {
      var W = pg.clientWidth, H = pg.clientHeight, k = W / 620, n = v.n, g = v.g * 1.5 * k, m = v.m * 1.5 * k;
      var cw = Math.max(2, (W - 2 * m - (n - 1) * g) / n);
      function x(i) { return m + i * (cw + g); }
      function span(el, a, b, top, h) { el.style.left = x(a) + 'px'; el.style.width = Math.max(4, x(b - 1) + cw - x(a)) + 'px'; el.style.top = top + 'px'; el.style.height = h + 'px'; }
      cols.forEach(function (c, i) { if (i < n) { c.style.left = x(i) + 'px'; c.style.width = cw + 'px'; c.style.opacity = .13; } else { c.style.left = (W - m) + 'px'; c.style.width = '0px'; c.style.opacity = 0; } });
      var a = Math.max(1, Math.round(n * 0.75)), b = Math.max(1, Math.round(n / 2)), y1 = m, hT = H * 0.24, y2 = y1 + hT + 12, y3 = H * 0.7, hM = y3 - y2 - 14;
      span(bT, 0, a, y1, hT);
      span(bI, 0, n > 1 ? b : 1, y2, hM);
      if (n > 1) { bX.style.opacity = .75; span(bX, b, n, y2 + 4, hM - 8); } else bX.style.opacity = 0;
      var kc = n >= 3 ? 3 : n, per = Math.floor(n / kc);
      cards.forEach(function (c, i) { if (i < kc) { c.style.opacity = 1; span(c, i * per, i === kc - 1 ? n : (i + 1) * per, y3, H - y3 - m); } else c.style.opacity = 0; });
      for (var key in ui) { ui[key].b.textContent = v[key]; ui[key].r.value = v[key]; }
    }
    function at(time, fromUser) {
      t = P.clamp(time, 0, END);
      var c = 0; CH.forEach(function (x, i) { if (t >= x[1]) c = i; });
      if (c !== cur) { cur = c; v.n = CH[c][2]; v.g = CH[c][3]; v.m = CH[c][4]; chEl.forEach(function (e, i) { e.setAttribute('aria-current', i === c ? 'true' : 'false'); }); lay(); }
      hd.style.left = (t / END * 100) + '%'; pTime.textContent = mmss(t); pLab.textContent = playing ? 'Pause' : 'Play';
    }
    function seek(e) { var r = tk.getBoundingClientRect(); playing = false; started = true; at((e.clientX - r.left) / r.width * END); }
    P.drag(tk, function (dx, e) { seek(e); }, null, seek);
    play.addEventListener('click', function () { started = true; playing = !playing; if (playing && t >= END - 1) t = 0; at(t); });
    new ResizeObserver(lay).observe(pg);
    at(185);
    P.loop(root, function (dt) {
      if (!started && !P.reduce) { started = true; playing = true; t = 0; cur = -1; }
      if (!playing) return;
      var nt = t + dt / 1000 * 34; if (nt >= END) { nt = END; playing = false; }
      at(nt);
    });
  });

  // 2. Hover a Term: the four highlighted terms from the tutorial, with the explanations the product shows.
  //    Here the poster on the whiteboard changes too, so the term is explained by what it does.
  P.mount('proto2', function (root) {
    P.css('cl2', [
      '#proto2 .ht{position:absolute;inset:0;display:grid;grid-template-columns:1fr 400px}',
      '#proto2 .bd{position:relative;display:flex;align-items:center;justify-content:center;background:#EFEDE7;border-right:1px solid #141414}',
      '#proto2 .po{width:min(420px,78%);height:84%;background:#fff;border:1px solid #141414;padding:14px;display:flex;flex-direction:column;justify-content:flex-start;transition:padding .5s cubic-bezier(.2,.8,.2,1);overflow:hidden}',
      '#proto2 .po.n{padding:52px 48px}',
      '#proto2 .ti{font-weight:600;font-size:54px;line-height:1;display:flex;transition:font-size .5s cubic-bezier(.2,.8,.2,1)}',
      '#proto2 .ti i{font-style:normal;display:block;transition:margin .5s cubic-bezier(.2,.8,.2,1)}',
      '#proto2 .ti i:nth-child(2){margin-left:.16em}#proto2 .ti i:nth-child(3){margin-left:.2em}#proto2 .ti i:nth-child(4){margin-left:.02em}',
      '#proto2 .po.k .ti i:nth-child(2){margin-left:-.085em}#proto2 .po.k .ti i:nth-child(3){margin-left:-.1em}#proto2 .po.k .ti i:nth-child(4){margin-left:-.01em}',
      '#proto2 .su{font-size:30px;font-weight:500;line-height:1.1;margin-top:10px;letter-spacing:-.02em;transition:font-size .5s cubic-bezier(.2,.8,.2,1),color .5s}',
      '#proto2 .po.h .ti{font-size:92px}#proto2 .po.h .su{font-size:15px;color:#6A6862;letter-spacing:0}',
      '#proto2 .im{flex:1;min-height:20px;margin:16px 0;background:' + OR + '}','#proto2 .ls{margin-top:0}',
      '#proto2 .ls u{display:block;height:6px;background:#141414;transition:margin .5s cubic-bezier(.2,.8,.2,1),width .5s}',
      '#proto2 .ls u:nth-child(1){margin-top:0;width:92%}#proto2 .ls u:nth-child(2){margin-top:4px;width:60%}#proto2 .ls u:nth-child(3){margin-top:19px;width:84%}#proto2 .ls u:nth-child(4){margin-top:6px;width:97%}#proto2 .ls u:nth-child(5){margin-top:23px;width:40%}#proto2 .ls u:nth-child(6){margin-top:3px;width:71%}',
      '#proto2 .po.r .ls u{margin-top:11px;width:100%}#proto2 .po.r .ls u:nth-child(3n){width:62%}#proto2 .po.r .ls u:first-child{margin-top:0}',
      '#proto2 .rt{padding:28px 28px 0;display:flex;flex-direction:column}',
      '#proto2 .cp{font-size:22px;line-height:1.5;letter-spacing:-.015em;margin:0}',
      '#proto2 .cp button{display:inline;min-height:0;padding:1px 5px;border:0;background:rgba(242,107,56,.2);box-shadow:inset 0 -2px 0 ' + OR + ';font-size:inherit;letter-spacing:inherit;line-height:1.2}',
      '#proto2 .cp button:hover,#proto2 .cp button.on{background:' + OR + ';color:#141414}',
      '#proto2 .cp button[aria-pressed=true]{background:#141414;color:#F7F5F0;box-shadow:none}',
      '#proto2 .cd{margin-top:auto;border-top:1px solid #141414;padding:14px 0 22px;min-height:190px}',
      '#proto2 .cd h4{margin:0;font-size:22px;font-weight:600;letter-spacing:-.02em;display:flex;justify-content:space-between;gap:12px}',
      '#proto2 .cd h4 span{font-weight:400}',
      '#proto2 .cd p{margin:10px 0 0;font-size:14px;line-height:1.5;color:#3A3936}',
      '@media(max-width:760px){#proto2{height:auto}#proto2 .ht{position:relative;grid-template-columns:1fr}#proto2 .bd{height:300px;border-right:0;border-bottom:1px solid #141414}#proto2 .rt{padding:18px 16px 0}#proto2 .cp{font-size:18px}#proto2 .cd{margin-top:18px}}'
    ].join(''));
    var T = {
      k: ['Kerning', '字距調整', 'The adjustment of space between individual letter pairs to achieve visually pleasing and readable typography. Professional designers fine-tune kerning to create harmonious text.'],
      r: ['Visual Rhythm', '視覺節奏', 'The pattern created by repeating visual elements that guide the eye through a composition. It creates a sense of organized movement and helps establish visual hierarchy.'],
      n: ['Negative Space', '負空間', 'The empty space around and between design elements. Also called white space, it’s crucial for creating balance, improving readability, and directing viewer attention.'],
      h: ['Hierarchy', '視覺層級', 'The arrangement of elements to show their order of importance through size, color, contrast, and placement. Good hierarchy guides viewers through content naturally.']
    };
    var ht = P.h('div', { 'class': 'ht' }, root), bd = P.h('div', { 'class': 'bd' }, ht), po = P.h('div', { 'class': 'po' }, bd);
    var ti = P.h('div', { 'class': 'ti' }, po); 'WAVE'.split('').forEach(function (c) { P.h('i', { text: c }, ti); });
    P.h('div', { 'class': 'su', text: 'Typography Composition Workshop' }, po);
    P.h('div', { 'class': 'im' }, po);
    var ls = P.h('div', { 'class': 'ls' }, po); for (var i = 0; i < 6; i++) P.h('u', {}, ls);
    var rt = P.h('div', { 'class': 'rt' }, ht), cp = P.h('p', { 'class': 'cp' }, rt), btn = {}, pinned = {}, hover = null, auto = 0, touched = false;
    [['Tighten the '], ['k', 'kerning'], [' in the title, keep a '], ['r', 'visual rhythm'], [' down the page, leave '], ['n', 'negative space'], [' around it, and let '], ['h', 'hierarchy'], [' do the talking.']].forEach(function (s) {
      if (s.length === 1) { cp.appendChild(document.createTextNode(s[0])); return; }
      var b = P.h('button', { type: 'button', text: s[1], 'aria-pressed': 'false' }, cp); btn[s[0]] = b;
      b.addEventListener('pointerenter', function () { touched = true; hover = s[0]; draw(); });
      b.addEventListener('pointerleave', function () { hover = null; draw(); });
      b.addEventListener('focus', function () { touched = true; hover = s[0]; draw(); });
      b.addEventListener('blur', function () { hover = null; draw(); });
      b.addEventListener('click', function () { touched = true; pinned[s[0]] = !pinned[s[0]]; draw(); });
    });
    var cd = P.h('div', { 'class': 'cd', 'aria-live': 'polite' }, rt), h4 = P.h('h4', {}, cd), hA = P.h('b', {}, h4), hB = P.h('span', { lang: 'zh-Hant' }, h4), pp = P.h('p', {}, cd), shown = null;
    function draw() {
      var last = hover;
      'krnh'.split('').forEach(function (k) {
        var on = pinned[k] || hover === k; po.classList.toggle(k, !!on);
        btn[k].setAttribute('aria-pressed', pinned[k] ? 'true' : 'false'); btn[k].classList.toggle('on', hover === k);
      });
      if (last) shown = last;
      if (shown) { hA.textContent = T[shown][0]; hB.textContent = T[shown][1]; pp.textContent = T[shown][2]; }
    }
    draw();
    var acc = 0, order = 'khnr';
    P.loop(root, function (dt) {
      if (touched || P.reduce) return;
      acc += dt; var step = Math.floor(acc / 2400);
      var k = order[step % 4]; if (step >= 8) { touched = true; hover = null; draw(); return; }
      if (hover !== k) { hover = k; draw(); }
    });
  });

  // 3. Team Coverage: build your card from the real trait groups, add classmates, and see which strengths and roles the team now covers.
  P.mount('proto3', function (root) {
    P.css('cl3', [
      '#proto3 .tc{position:absolute;inset:0;display:grid;grid-template-columns:300px 1fr 290px}',
      '#proto3 .me,#proto3 .tm{padding:18px 20px}',
      '#proto3 .me{border-right:1px solid #141414}#proto3 .tm{border-left:1px solid #141414;display:flex;flex-direction:column}',
      '#proto3 h5{margin:0 0 6px;font-size:11px;font-weight:500;color:#6A6862}',
      '#proto3 .gp{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:14px}',
      '#proto3 .gp button{min-height:30px;padding:0 8px;font-size:12px;text-align:left;border-color:#CFCCC4}',
      '#proto3 .gp button[aria-pressed=true]{border-color:#141414}',
      '#proto3 .av{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:16px}',
      '#proto3 .av button{min-height:0;aspect-ratio:1;padding:0;border-color:transparent}',
      '#proto3 .av button[aria-pressed=true]{outline:2px solid #141414;outline-offset:2px}',
      '#proto3 .cs{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:10px;padding:18px}',
      '#proto3 .cs button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:12px;min-height:0;gap:6px;font-size:12px;line-height:1.35}',
      '#proto3 .cs button b{font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px}',
      '#proto3 .cs button b i{width:14px;height:14px;display:block}',
      '#proto3 .cs button span{color:#6A6862}#proto3 .cs button[aria-pressed=true] span,#proto3 .cs button:hover span{color:#BDB9B0}',
      '#proto3 .cs button em{font-style:normal;margin-top:auto;display:flex;flex-wrap:wrap;gap:4px}',
      '#proto3 .cs button em u{text-decoration:none;border:1px solid currentColor;padding:1px 5px;font-size:11px}',
      '#proto3 .sl{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:20px}',
      '#proto3 .sl i{display:block;aspect-ratio:1;border:1px dashed #BDB9B0;transition:background .25s}',
      '#proto3 .cv{display:grid;grid-template-columns:14px 1fr;gap:5px 8px;align-items:center;font-size:12px;margin-bottom:16px}',
      '#proto3 .cv i{display:block;width:14px;height:14px;border:1px solid #BDB9B0;transition:background .25s,border-color .25s}',
      '#proto3 .cv i.on{background:' + OR + ';border-color:' + OR + '}',
      '#proto3 .cv span{color:#6A6862}#proto3 .cv i.on+span{color:#141414}',
      '@media(max-width:900px){#proto3{height:auto}#proto3 .tc{position:relative;grid-template-columns:1fr}#proto3 .me,#proto3 .tm{border:0;border-bottom:1px solid #141414}#proto3 .tm{border-bottom:0;border-top:1px solid #141414}#proto3 .cs{grid-template-columns:1fr 1fr;padding:14px}#proto3 .cs button{min-height:120px}}'
    ].join(''));
    var G = { Personality: ['Calm', 'Detail-oriented', 'Empathetic', 'Open-Minded', 'Passionate', 'Reflective'], Strengths: ['Communication', 'Concepts', 'Prototyping', 'Research', 'Technical', 'Visualization'], 'Team Role': ['Critic', 'Facilitator', 'Implementer', 'Innovator', 'Leader', 'Strategist'] };
    var AN = [['Koala', '#8B8880'], ['Wombat', '#74513A'], ['Cockatoo', P.yellow], ['Emu', P.blue], ['Kookaburra', P.green], ['Platypus', P.red]];
    var MATES = [
      [0, 'Mixed-methods researcher. Diary study enjoyer.', 'Reflective', 'Research', 'Critic'],
      [1, 'Design systems & prototyping.', 'Detail-oriented', 'Prototyping', 'Implementer'],
      [2, 'Frontend dev. Accessibility advocate.', 'Passionate', 'Technical', 'Implementer'],
      [3, 'Motion & micro-interactions.', 'Open-Minded', 'Visualization', 'Innovator'],
      [4, 'Service design & facilitation.', 'Empathetic', 'Communication', 'Facilitator'],
      [5, 'Data viz & product thinking.', 'Calm', 'Concepts', 'Strategist']
    ];
    var tc = P.h('div', { 'class': 'tc' }, root), me = P.h('div', { 'class': 'me' }, tc), cs = P.h('div', { 'class': 'cs' }, tc), tm = P.h('div', { 'class': 'tm' }, tc);
    var mine = { av: '#141414', Personality: null, Strengths: null, 'Team Role': null }, team = [], gb = {};
    Object.keys(G).forEach(function (g) {
      P.h('h5', { text: g }, me); var box = P.h('div', { 'class': 'gp' }, me); gb[g] = [];
      G[g].forEach(function (t) { var b = P.h('button', { type: 'button', text: t, 'aria-pressed': 'false' }, box); gb[g].push(b); b.addEventListener('click', function () { mine[g] = mine[g] === t ? null : t; draw(); }); });
    });
    var mb = MATES.map(function (m, i) {
      var b = P.h('button', { type: 'button', 'aria-pressed': 'false' }, cs), nm = P.h('b', {}, b); P.h('i', { style: 'background:' + AN[m[0]][1] }, nm); nm.appendChild(document.createTextNode(AN[m[0]][0]));
      P.h('span', { text: m[1] }, b); var em = P.h('em', {}, b); [m[2], m[3], m[4]].forEach(function (t) { P.h('u', { text: t }, em); });
      b.addEventListener('click', function () { var k = team.indexOf(i); if (k >= 0) team.splice(k, 1); else { if (team.length >= 3) team.shift(); team.push(i); } draw(); });
      return b;
    });
    P.h('h5', { text: 'Team' }, tm); var sl = P.h('div', { 'class': 'sl' }, tm), slots = [0, 1, 2, 3].map(function () { return P.h('i', {}, sl); });
    var cv = {};
    ['Strengths', 'Team Role'].forEach(function (g) { P.h('h5', { text: g }, tm); var box = P.h('div', { 'class': 'cv' }, tm); G[g].forEach(function (t) { cv[t] = P.h('i', {}, box); P.h('span', { text: t }, box); }); });
    function draw() {
      Object.keys(G).forEach(function (g) { gb[g].forEach(function (b) { b.setAttribute('aria-pressed', mine[g] === b.textContent ? 'true' : 'false'); }); });
      var has = {}; if (mine.Strengths) has[mine.Strengths] = 1; if (mine['Team Role']) has[mine['Team Role']] = 1;
      mb.forEach(function (b, i) { var on = team.indexOf(i) >= 0; b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) { has[MATES[i][3]] = 1; has[MATES[i][4]] = 1; } });
      var youIn = mine.Personality || mine.Strengths || mine['Team Role'];
      slots.forEach(function (s, i) { var c = i === 0 ? (youIn ? '#141414' : '') : (team[i - 1] != null ? AN[MATES[team[i - 1]][0]][1] : ''); s.style.background = c; s.style.borderStyle = c ? 'solid' : 'dashed'; s.style.borderColor = c || '#BDB9B0'; });
      for (var t in cv) cv[t].classList.toggle('on', !!has[t]);
    }
    draw();
  });
})();
