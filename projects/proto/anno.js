// Anno: one heart rate, three views. The side screen always tells its owner everything, Anno answers with its body
// and its voice, and the family's phone stays empty until a prompt goes unanswered. That is the privacy rule, drawn as layout.
(function () {
  var P = window.P;
  P.mount('proto', function (root) {
    P.css('an1', [
      '#proto .an{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1.5fr 1fr;grid-template-rows:1fr 76px}',
      '#proto .c{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:34px 16px 8px}',
      '#proto .c+.c{border-left:1px solid #CFCCC4}',
      '#proto .c>small{position:absolute;left:16px;top:14px;font-size:11px;color:#6A6862}',
      '#proto .sc{width:min(230px,100%);background:#141414;color:#F7F5F0;border-radius:18px;padding:18px 18px 16px}',
      '#proto .sc b{display:block;font-weight:500;font-size:64px;line-height:1;letter-spacing:-.04em;transition:color .3s}',
      '#proto .sc b span{font-size:13px;letter-spacing:0;margin-left:6px;color:#BDB9B0}',
      '#proto .sc svg{width:100%;height:44px;margin:8px 0 12px}',
      '#proto .sc dl{margin:0;display:grid;grid-template-columns:1fr auto;gap:8px;font-size:12px;color:#BDB9B0;align-items:center}',
      '#proto .sc dd{margin:0;display:flex;gap:4px}#proto .sc dd i{display:block;width:10px;height:10px;border:1px solid #F7F5F0}#proto .sc dd i.on{background:#F7F5F0}',
      '#proto .sc dd u{display:block;width:70px;height:4px;background:#474642;position:relative;text-decoration:none}#proto .sc dd u::after{content:"";position:absolute;left:0;top:0;bottom:0;width:62%;background:#F7F5F0}',
      '#proto .dog{width:min(360px,100%);height:auto;overflow:visible}',
      '#proto .say{height:54px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;font-size:20px;font-weight:600;letter-spacing:-.02em}',
      '#proto .say i{display:block;height:3px;width:160px;background:#CFCCC4;position:relative}#proto .say i b{position:absolute;left:0;top:0;bottom:0;background:#D9412C}',
      '#proto .ok{margin-top:6px;visibility:hidden}#proto .ok.on{visibility:visible}',
      '#proto .ph{width:150px;height:270px;border:1.5px solid #141414;border-radius:22px;padding:8px;background:#F7F5F0}',
      '#proto .ph div{height:100%;border-radius:15px;background:#E4E1D9;display:flex;flex-direction:column;justify-content:flex-end;padding:12px;transition:background .3s,color .3s;color:transparent;font-size:12px;line-height:1.35}',
      '#proto .ph div.on{background:#D9412C;color:#F7F5F0}',
      '#proto .ph div b{font-size:30px;font-weight:600;letter-spacing:-.03em;line-height:1;margin-bottom:6px}',
      '#proto .ct{grid-column:1/4;border-top:1px solid #141414;padding:14px 20px 0;position:relative}',
      '#proto .ct i{position:absolute;top:30px;width:1px;height:12px;background:#141414}',
      '@media(max-width:760px){#proto{height:auto}#proto .an{position:relative;grid-template-columns:1fr 1fr;grid-template-rows:auto auto 76px}#proto .c.mid{grid-column:1/3;grid-row:1;border-left:0;border-bottom:1px solid #CFCCC4}#proto .c.l{grid-row:2;border-left:0}#proto .c.r{grid-row:2}#proto .ct{grid-column:1/3}#proto .sc b{font-size:44px}#proto .ph{width:120px;height:210px}}'
    ].join(''));
    var an = P.h('div', { 'class': 'an' }, root);
    var cL = P.h('div', { 'class': 'c l' }, an), cM = P.h('div', { 'class': 'c mid' }, an), cR = P.h('div', { 'class': 'c r' }, an), ct = P.h('div', { 'class': 'ct' }, an);
    P.h('small', { text: 'Side screen' }, cL); P.h('small', { text: 'Anno' }, cM); P.h('small', { text: 'Family’s phone' }, cR);
    var sc = P.h('div', { 'class': 'sc' }, cL), num = P.h('b', { 'class': 'num' }, sc), numT = document.createTextNode('72'); num.appendChild(numT); P.h('span', { text: 'bpm' }, num);
    var ps = P.s('svg', { viewBox: '0 0 160 44', preserveAspectRatio: 'none' }, sc), pl = P.s('path', { fill: 'none', stroke: '#F7F5F0', 'stroke-width': 1.6, 'vector-effect': 'non-scaling-stroke' }, ps);
    var dl = P.h('dl', {}, sc); P.h('dt', { text: 'Medication' }, dl); var dd = P.h('dd', {}, dl); P.h('i', { 'class': 'on' }, dd); P.h('i', { 'class': 'on' }, dd); P.h('i', {}, dd);
    P.h('dt', { text: 'Activity' }, dl); P.h('u', {}, P.h('dd', {}, dl));
    var say = P.h('div', { 'class': 'say', 'aria-live': 'polite' }, cM), sayT = P.h('span', {}, say), bar = P.h('i', {}, say), barF = P.h('b', {}, bar);
    var dog = P.s('svg', { 'class': 'dog', viewBox: '20 30 290 190', role: 'img', 'aria-label': 'Anno, a puppy-shaped companion' }, cM);
    var INK = P.ink, WH = '#FFFFFF';
    P.s('line', { x1: 20, x2: 310, y1: 208, y2: 208, stroke: INK, 'stroke-width': 1 }, dog);
    P.s('rect', { x: 226, y: 150, width: 20, height: 58, rx: 8, fill: '#DAD7CF', stroke: INK, 'stroke-width': 1.5 }, dog);
    P.s('rect', { x: 126, y: 150, width: 20, height: 58, rx: 8, fill: '#DAD7CF', stroke: INK, 'stroke-width': 1.5 }, dog);
    var tail = P.s('rect', { x: 238, y: 84, width: 12, height: 44, rx: 6, fill: WH, stroke: INK, 'stroke-width': 1.5 }, dog);
    P.s('rect', { x: 96, y: 104, width: 156, height: 64, rx: 28, fill: WH, stroke: INK, 'stroke-width': 1.5 }, dog);
    P.s('rect', { x: 210, y: 152, width: 20, height: 56, rx: 8, fill: WH, stroke: INK, 'stroke-width': 1.5 }, dog);
    P.s('rect', { x: 110, y: 152, width: 20, height: 56, rx: 8, fill: WH, stroke: INK, 'stroke-width': 1.5 }, dog);
    P.s('rect', { x: 156, y: 118, width: 60, height: 34, rx: 7, fill: INK }, dog);
    var beat = P.s('rect', { x: 180, y: 129, width: 12, height: 12, fill: P.green }, dog);
    var head = P.s('g', {}, dog);
    P.s('rect', { x: 118, y: 44, width: 18, height: 42, rx: 9, fill: INK, transform: 'rotate(14 127 60)' }, head);
    P.s('rect', { x: 56, y: 56, width: 84, height: 64, rx: 24, fill: WH, stroke: INK, 'stroke-width': 1.5 }, head);
    P.s('rect', { x: 38, y: 88, width: 40, height: 28, rx: 12, fill: WH, stroke: INK, 'stroke-width': 1.5 }, head);
    P.s('circle', { cx: 44, cy: 98, r: 4, fill: INK }, head);
    P.s('rect', { x: 66, y: 72, width: 62, height: 22, rx: 11, fill: INK }, head);
    var e1 = P.s('circle', { cx: 86, cy: 83, r: 4, fill: P.green }, head), e2 = P.s('circle', { cx: 108, cy: 83, r: 4, fill: P.green }, head);
    P.s('rect', { x: 110, y: 116, width: 26, height: 8, fill: P.red }, dog);
    var ok = P.h('button', { type: 'button', 'class': 'ok', text: 'I’m okay' }, cM);
    var ph = P.h('div', { 'class': 'ph' }, cR), phS = P.h('div', {}, ph), phB = P.h('b', { text: 'SOS' }, phS), phT = P.h('span', {}, phS);
    var hr = 72, state = 'calm', askT = 0, answered = false, ph0 = 0, ASK = 6000;
    var rng = P.range(ct, 50, 160, hr, 1, 'Heart rate', function (v) { hr = v; step(0); });
    [100, 130].forEach(function (v) { P.h('i', { style: 'left:calc(20px + (100% - 40px) * ' + ((v - 50) / 110).toFixed(4) + ')' }, ct); });
    ok.addEventListener('click', function () { if (state === 'ask') { answered = true; state = 'heard'; draw(); } });
    function step(dt) {
      if (state === 'sos') { if (hr < 100) { state = 'calm'; answered = false; } }
      else if (hr >= 130) { if (!answered && state !== 'ask') { state = 'ask'; askT = 0; } if (state === 'ask') { askT += dt; if (askT >= ASK) state = 'sos'; } }
      else { if (hr < 125) answered = false; state = hr >= 100 ? 'alert' : 'calm'; }
      draw();
    }
    function draw() {
      numT.nodeValue = String(hr);
      var col = state === 'calm' ? P.green : state === 'alert' ? P.yellow : P.red;
      num.style.color = state === 'calm' ? '#F7F5F0' : col; e1.setAttribute('fill', col); e2.setAttribute('fill', col); beat.setAttribute('fill', col);
      var r = state === 'ask' ? 6 : 4; e1.setAttribute('r', r); e2.setAttribute('r', r);
      sayT.textContent = state === 'ask' ? 'Are you okay?' : state === 'heard' ? 'Okay. I’m right here.' : state === 'sos' ? 'I’m calling your family.' : '';
      bar.style.visibility = state === 'ask' ? 'visible' : 'hidden'; barF.style.width = (100 - askT / ASK * 100).toFixed(1) + '%';
      ok.classList.toggle('on', state === 'ask');
      var on = state === 'sos'; phS.classList.toggle('on', on);
      if (on && !phT.textContent) { var d = new Date(); phT.textContent = 'No answer to a voice check. Heart rate ' + hr + ' bpm at ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + '.'; }
      if (!on) phT.textContent = '';
    }
    var tt = 0;
    P.loop(root, function (dt, t) {
      step(dt);
      tt += dt / 1000;
      var wag = state === 'calm' ? Math.sin(tt * 13) * 22 : state === 'alert' ? Math.sin(tt * 4) * 8 : state === 'heard' ? Math.sin(tt * 8) * 12 : 0;
      tail.setAttribute('transform', 'rotate(' + (24 + (P.reduce ? 0 : wag)).toFixed(1) + ' 244 126)');
      var tilt = state === 'alert' ? -9 : state === 'ask' ? 7 : state === 'sos' ? 7 : state === 'heard' ? -4 : Math.sin(tt * 1.3) * 2;
      head.setAttribute('transform', 'rotate(' + tilt.toFixed(1) + ' 128 116)');
      ph0 += dt / 1000 * hr / 60 * 40;
      var d = '', off = ph0 % 40;
      for (var x = -off; x < 170; x += 40) d += (d ? 'L' : 'M') + x.toFixed(1) + ' 24 L' + (x + 14).toFixed(1) + ' 24 L' + (x + 18).toFixed(1) + ' 6 L' + (x + 23).toFixed(1) + ' 40 L' + (x + 27).toFixed(1) + ' 24 ';
      pl.setAttribute('d', d);
      beat.setAttribute('opacity', (off < 12 ? 1 : 0.35));
    });
    draw();
  });
})();
