// Gyn Research Dashboard: the morning brief as the researcher meets it. Grades, tiers, the fields of the reading card,
// the TCM transfer band and the guideline diff are the real structure of the product. The six papers are made up.
(function () {
  var P = window.P, BUR = '#8B2C2C', MOSS = '#5A7547';
  var D = [
    { g: 'A', type: 'Guideline', tier: 'Guideline', iff: '—', t: 'Updated consensus on managing endometriosis-associated pain', core: 'First-line advice changes; worth reading in full.',
      was: 'Surgery considered early when pain persists after one hormonal option.', now: 'Two hormonal options tried first; surgery after shared decision-making, with imaging before referral.',
      tcm: 'Where the new pathway leaves a waiting period before surgery, that window is a natural place to design an adjunct trial.' },
    { g: 'A', type: 'RCT', tier: 'Top general', iff: '39.2', q1: 'Q1', t: 'Two ovulation-induction regimens compared in polycystic ovary syndrome', core: 'Large, well-run trial on a question clinics face weekly.',
      q: 'Does regimen A lead to more live births than regimen B in first-line treatment?', d: 'Multicentre, double-blind, randomised; live birth as primary outcome.', r: 'Regimen A did better on the primary outcome; multiple-pregnancy rates were similar.', l: 'Participants were younger and leaner than a typical clinic population.',
      tcm: 'The live-birth endpoint and blinding scheme can be reused as the comparator arm for a herbal-adjunct study.' },
    { g: 'A', type: 'Cohort', tier: 'Ob-Gyn', iff: '8.7', q1: 'Q1', t: 'Self-sampling for HPV among women who miss routine screening', core: 'Implementation evidence, directly usable in outreach planning.',
      q: 'Does mailing a self-sampling kit bring under-screened women back into screening?', d: 'Population-based cohort with registry follow-up.', r: 'Participation rose in the kit group, most in the longest-overdue women.', l: 'Follow-up after a positive result depended on local clinic capacity.',
      tcm: 'Community TCM clinics are a possible distribution point; the registry linkage method is the reusable part.' },
    { g: 'B', type: 'Review', tier: 'Ob-Gyn', iff: '6.1', q1: 'Q1', t: 'The vaginal microbiome and repeated implantation failure', core: 'Good map of a fast-moving area; conclusions still tentative.',
      q: 'What is known about microbiome profiles in repeated implantation failure?', d: 'Systematic review; small observational studies dominate.', r: 'A consistent association, but no agreed definition of a favourable profile.', l: 'Heterogeneous sampling methods; few interventional studies.',
      tcm: 'Pattern differentiation could be tested as a stratifier, since current studies have none.' },
    { g: 'B', type: 'Cohort', tier: 'Crosscut', iff: '11.4', q1: 'Q1', t: 'Sleep disruption and menstrual-cycle irregularity in shift workers', core: 'Outside the core field, but the exposure data are unusually good.',
      q: 'Is rotating night work linked to irregular cycles?', d: 'Prospective cohort with wearable-recorded sleep.', r: 'Irregular cycles were more common with frequent night rotations.', l: 'Self-reported cycle data; one occupational group.',
      tcm: 'Wearable sleep data would give an objective measure for studies of cycle regulation.' },
    { g: 'C', type: 'Basic', tier: 'Crosscut', iff: '5.3', q1: 'Q2', t: 'Macrophage behaviour in adenomyosis lesions', core: 'Mechanism only; keep on file.',
      q: 'How do immune cells behave inside adenomyosis lesions?', d: 'Tissue samples and a mouse model.', r: 'A shift in macrophage type tracked with lesion depth.', l: 'Small sample; no clinical outcome.',
      tcm: 'A candidate marker if a later herbal study needs a tissue-level readout.' }
  ];
  P.mount('proto', function (root) {
    P.css('gy1', [
      '#proto .gy{position:absolute;inset:0;display:grid;grid-template-columns:44% 1fr}',
      '#proto .li{border-right:1px solid #141414;display:flex;flex-direction:column;min-height:0}',
      '#proto .hd{display:flex;align-items:center;gap:6px;padding:14px 16px;border-bottom:1px solid #141414}',
      '#proto .hd button{min-height:32px;width:32px;padding:0;font-weight:600;font-size:14px}',
      '#proto .hd span{margin-left:auto;font-size:12px;color:#6A6862}',
      '#proto .rows{overflow:auto;flex:1}',
      '#proto .rw{display:grid;grid-template-columns:28px 1fr 32px;gap:12px;align-items:start;padding:11px 12px 11px 16px;border-bottom:1px solid #CFCCC4;cursor:pointer;border-left:3px solid transparent}',
      '#proto .rw[aria-current=true]{background:#EFEDE7;border-left-color:#141414}',
      '#proto .gd{width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;border:1px solid #141414}',
      '#proto .gd.A{background:' + BUR + ';border-color:' + BUR + ';color:#F7F5F0}#proto .gd.C{border-color:#BDB9B0;color:#8B8880}',
      '#proto .rw h4{margin:0;font-size:14px;font-weight:600;line-height:1.3;letter-spacing:-.01em}',
      '#proto .rw p{margin:3px 0 0;font-size:11px;color:#6A6862}',
      '#proto .rw button{min-height:28px;width:28px;padding:0;border-color:transparent;background:transparent;font-size:16px;line-height:1;color:#BDB9B0}',
      '#proto .rw button:hover{background:transparent;color:#141414}#proto .rw button[aria-pressed=true]{background:transparent;color:' + BUR + '}',
      '#proto .cd{padding:22px 26px;overflow:auto;display:flex;flex-direction:column}',
      '#proto .mt{display:flex;flex-wrap:wrap;gap:6px;font-size:11px;margin-bottom:12px}',
      '#proto .mt span{border:1px solid #BDB9B0;padding:2px 7px}',
      '#proto .mt span:first-child{border-color:#141414}',
      '#proto .cd h3{margin:0 0 8px;font-size:23px;font-weight:600;line-height:1.15;letter-spacing:-.02em;text-wrap:balance}',
      '#proto .cd .cr{margin:0 0 16px;font-size:14px;color:' + BUR + '}',
      '#proto .fl{display:grid;grid-template-columns:118px 1fr;border-top:1px solid #141414}',
      '#proto .fl>*{padding:9px 0;border-bottom:1px solid #CFCCC4;font-size:13.5px;line-height:1.45;animation:gyin .45s both}',
      '#proto .fl dt{font-size:11px;color:#6A6862;margin:0}#proto .fl dt b{display:block;font-weight:400;color:#141414;font-size:12px}#proto .fl dd{margin:0}',
      '#proto .df{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #141414;animation:gyin .45s both}',
      '#proto .df div{padding:10px 14px 12px 0;font-size:13.5px;line-height:1.45}#proto .df div+div{padding-left:14px;border-left:1px solid #141414}',
      '#proto .df small{display:block;font-size:11px;color:#6A6862;margin-bottom:4px}#proto .df div:first-child p{color:#8B8880;text-decoration:line-through}#proto .df p{margin:0}',
      '#proto .tb{margin-top:auto;background:' + MOSS + ';color:#F7F5F0;padding:11px 14px 13px;font-size:13.5px;line-height:1.45;animation:gyin .45s .3s both}',
      '#proto .tb small{display:block;font-size:11px;opacity:.8;margin-bottom:3px}',
      '@keyframes gyin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      '@media(prefers-reduced-motion:reduce){#proto .fl>*,#proto .df,#proto .tb{animation:none}}',
      '@media(max-width:760px){#proto{height:auto}#proto .gy{position:relative;grid-template-columns:1fr}#proto .li{border-right:0;border-bottom:1px solid #141414}#proto .rows{max-height:250px}#proto .cd{padding:18px 16px}#proto .tb{margin-top:16px}#proto .fl{grid-template-columns:96px 1fr}}'
    ].join(''));
    var gy = P.h('div', { 'class': 'gy' }, root), li = P.h('div', { 'class': 'li' }, gy), hd = P.h('div', { 'class': 'hd' }, li), rows = P.h('div', { 'class': 'rows' }, li), cd = P.h('div', { 'class': 'cd', 'aria-live': 'polite' }, gy);
    var show = { A: true, B: true, C: true }, sel = 0, fav = {}, gb = {};
    'ABC'.split('').forEach(function (g) { gb[g] = P.h('button', { type: 'button', text: g, 'aria-label': 'Grade ' + g, 'aria-pressed': 'true' }, hd); gb[g].addEventListener('click', function () { show[g] = !show[g]; if (!show.A && !show.B && !show.C) show[g] = true; list(); }); });
    var stamp = P.h('span', { 'class': 'num' }, hd);
    function list() {
      rows.textContent = '';
      'ABC'.split('').forEach(function (g) { gb[g].setAttribute('aria-pressed', show[g] ? 'true' : 'false'); });
      var vis = D.map(function (d, i) { return i; }).filter(function (i) { return show[D[i].g]; });
      if (vis.indexOf(sel) < 0) { sel = vis[0]; card(); }
      vis.forEach(function (i) {
        var d = D[i], r = P.h('div', { 'class': 'rw', role: 'button', tabindex: '0', 'aria-current': i === sel ? 'true' : 'false' }, rows);
        P.h('div', { 'class': 'gd ' + d.g, text: d.g }, r); var m = P.h('div', {}, r); P.h('h4', { text: d.t }, m); P.h('p', { text: (d.type === d.tier ? d.type : d.type + ' · ' + d.tier) + (d.iff !== '—' ? ' · IF ' + d.iff : '') }, m);
        var s = P.h('button', { type: 'button', text: fav[i] ? '★' : '☆', 'aria-label': 'Favourite', 'aria-pressed': fav[i] ? 'true' : 'false' }, r);
        s.addEventListener('click', function (e) { e.stopPropagation(); fav[i] = !fav[i]; list(); });
        function pick() { sel = i; list(); card(); }
        r.addEventListener('click', pick); r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      var n = Object.keys(fav).filter(function (k) { return fav[k]; }).length;
      stamp.textContent = (n ? '★ ' + n + ' · ' : '') + '08:00';
    }
    function card() {
      var d = D[sel]; cd.textContent = '';
      var mt = P.h('div', { 'class': 'mt' }, cd); [d.type, d.type === d.tier ? null : d.tier, d.iff !== '—' ? 'IF ' + d.iff : null, d.q1, 'Sample Journal'].forEach(function (x) { if (x) P.h('span', { text: x }, mt); });
      P.h('h3', { text: d.t }, cd); P.h('p', { 'class': 'cr', text: d.core }, cd);
      if (d.was) {
        var df = P.h('div', { 'class': 'df' }, cd), a = P.h('div', {}, df), b = P.h('div', {}, df);
        P.h('small', { text: 'Previous version' }, a); P.h('p', { text: d.was }, a); P.h('small', { text: 'This version · 指南更新对比' }, b); P.h('p', { text: d.now }, b);
      } else {
        var fl = P.h('dl', { 'class': 'fl' }, cd);
        [['Core question', '核心问题', d.q], ['Design', '研究设计', d.d], ['Main result', '主要结果', d.r], ['Limitation', '局限性', d.l]].forEach(function (f, k) {
          var dt = P.h('dt', { style: 'animation-delay:' + (k * 70) + 'ms' }, fl); P.h('b', { text: f[0] }, dt); dt.appendChild(document.createTextNode(f[1]));
          P.h('dd', { text: f[2], style: 'animation-delay:' + (k * 70) + 'ms' }, fl);
        });
      }
      var tb = P.h('div', { 'class': 'tb' }, cd); P.h('small', { text: 'TCM transfer · 中医学迁移分析' }, tb); tb.appendChild(document.createTextNode(d.tcm));
    }
    list(); card();
  });
})();
