/* ── Investment Assistant · interactive demo ──────────────────────
   Bilingual (EN / 中). All dynamically-generated strings live in t().
   Listens to the global language toggle to re-render on switch.
   Mirrors only features that exist in the real app: holdings with
   live ticks, currency switch (CNY/AUD like the real toggle),
   transactions ledger, and the P&L calendar. */

(function () {
    // ── Synthetic portfolio (entirely fictional) ──────────────────
    const FX = { CNY: 1, AUD: 4.72, HKD: 0.91, USD: 7.18 };
    const SYM = { CNY: '¥', AUD: 'A$', HKD: 'HK$', USD: 'US$' };

    const holdings = [
        { nameEn: 'Acme A-Share ETF',    nameZh: 'Acme A 股 ETF',    ticker: '510TEST',  marketEn: 'A-share',  marketZh: 'A 股',    ccy: 'CNY', qty: 8000, cost: 1.42,  price: 1.55, close: 1.53,  vol: 0.012 },
        { nameEn: 'Phoenix Industries',  nameZh: 'Phoenix 工业',     ticker: 'PHX.AX',   marketEn: 'ASX',      marketZh: '澳股',     ccy: 'AUD', qty: 240,  cost: 12.40, price: 13.18, close: 13.24, vol: 0.018 },
        { nameEn: 'Onyx Tech Group',     nameZh: 'Onyx 科技',        ticker: '0788.HK',  marketEn: 'HK',       marketZh: '港股',     ccy: 'HKD', qty: 1500, cost: 8.95,  price: 8.42, close: 8.48,  vol: 0.022 },
        { nameEn: 'Crimson Growth Fund', nameZh: 'Crimson 成长基金', ticker: '008812',   marketEn: 'CN fund',  marketZh: '内地基金', ccy: 'CNY', qty: 3500, cost: 2.18,  price: 2.31, close: 2.30,  vol: 0.009 },
        { nameEn: 'Aurum Physical Gold', nameZh: 'Aurum 实物黄金',   ticker: 'Au99.99',  marketEn: 'Gold',     marketZh: '实物金',   ccy: 'CNY', qty: 60,   cost: 612,   price: 638, close: 635,   vol: 0.006 },
        { nameEn: 'Beacon Resources',    nameZh: 'Beacon 资源',      ticker: 'BEA.AX',   marketEn: 'ASX',      marketZh: '澳股',     ccy: 'AUD', qty: 180,  cost: 5.20,  price: 4.93, close: 4.97,  vol: 0.020 },
    ];

    let cashCny = 20000;
    const openingEquityCny = cashCny + totalCostCny();
    const dayOpening = { CNY: 0, AUD: 0 };
    const dayTradeCash = { CNY: 0, AUD: 0 };

    let displayCcy = 'CNY';
    let refreshTimer = null;

    // Initial action log (relative dates use bilingual buckets)
    const actionLog = [
        { dateKey: 'd5',     side: 'buy',  ticker: '510TEST', qty: 2000, price: 1.51 },
        { dateKey: 'd4',     side: 'sell', ticker: 'BEA.AX',  qty: 50,   price: 5.07 },
        { dateKey: 'd2',     side: 'buy',  ticker: 'Au99.99', qty: 10,   price: 632 },
        { dateKey: 'today',  side: 'buy',  ticker: 'PHX.AX',  qty: 30,   price: 13.05 },
    ];

    for (const h of holdings) {
        if (h.ccy in dayOpening) dayOpening[h.ccy] += h.qty * h.close;
    }
    for (const trade of actionLog.filter(entry => entry.dateKey === 'today')) {
        const h = holdings.find(row => row.ticker === trade.ticker);
        if (!(h.ccy in dayOpening)) continue;
        const change = trade.side === 'buy' ? trade.qty : -trade.qty;
        dayOpening[h.ccy] -= change * h.close;
        dayTradeCash[h.ccy] -= change * trade.price;
    }
    let lastTrade = null;

    // ── Bilingual strings ────────────────────────────────────────
    const STRINGS = {
        priceUpdated:    { en: 'Simulated prices · 1 AUD = 4.72 CNY', zh: '模拟行情 · 1 AUD = 4.72 CNY' },
        cost:            { en: 'Cost',  zh: '成本' },
        pnl:             { en: 'P&L',   zh: '盈亏' },
        emptyLog:        { en: 'No actions yet.', zh: '还没有记录。' },
        sideBuy:         { en: 'BUY', zh: '买入' },
        sideSell:        { en: 'SELL', zh: '卖出' },
        days: {
            en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            zh: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        },
        calFoot: {
            en: (win, loss, total) => `${win} green days · ${loss} red days · month ${total}`,
            zh: (win, loss, total) => `盈利 ${win} 天 · 亏损 ${loss} 天 · 本月 ${total}`,
        },
        dateLabels: {
            d5:    { en: '5d ago', zh: '5 天前' },
            d4:    { en: '4d ago', zh: '4 天前' },
            d2:    { en: '2d ago', zh: '2 天前' },
            today: { en: 'today', zh: '今天' },
            now:   { en: 'just now', zh: '刚刚' },
        },
    };

    // ── Helpers ───────────────────────────────────────────────────
    const $ = (id) => document.getElementById(id);

    function lang() {
        return document.querySelector('.lang-option.active')?.dataset.lang === 'zh' ? 'zh' : 'en';
    }
    function t(key) {
        const v = STRINGS[key];
        if (!v) return '';
        return v[lang()] || v.en;
    }

    function fmt(n) {
        if (n == null || isNaN(n)) return '0';
        const abs = Math.abs(n);
        if (abs >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
        if (abs >= 100)   return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
        return n.toFixed(2);
    }
    function fmtSigned(n) {
        return (n >= 0 ? '+' : '−') + fmt(Math.abs(n));
    }
    function inDisplay(amountCny) { return amountCny / FX[displayCcy]; }
    function withSym(amount, ccy = displayCcy) { return SYM[ccy] + ' ' + fmt(amount); }

    // ── Totals ───────────────────────────────────────────────────
    function totalValCny() { return holdings.reduce((s, h) => s + h.qty * h.price * FX[h.ccy], 0); }
    function totalCostCny() { return holdings.reduce((s, h) => s + h.qty * h.cost * FX[h.ccy], 0); }

    const allocationGroups = [
        { id: 'CNY', color: '#abc398', en: 'CNY holdings', zh: '人民币持仓' },
        { id: 'AUD', color: '#ddbd83', en: 'AUD holdings', zh: '澳元持仓' },
        { id: 'HKD', color: '#9fb9cc', en: 'HKD holdings', zh: '港币持仓' },
        { id: 'cash', color: '#baaeae', en: 'Cash', zh: '现金' }
    ];
    let selectedGroup = 'CNY';
    function initAllocation() {
        for (const group of allocationGroups) {
            const segment = document.createElement('span');
            segment.style.setProperty('--mix', group.color);
            $('alloc-bars').append(segment);
            const key = document.createElement('button');
            key.type = 'button';
            key.style.setProperty('--mix', group.color);
            key.addEventListener('click', () => {
                selectedGroup = group.id;
                renderAllocation(totalValCny() + cashCny);
            });
            $('alloc-keys').append(key);
        }
    }
    function renderAllocation(equity) {
        allocationGroups.forEach((group, i) => {
            const marketValue = group.id === 'cash' ? cashCny : holdings
                .filter(h => h.ccy === group.id)
                .reduce((sum, h) => sum + h.qty * h.price * FX[h.ccy], 0);
            const weight = equity ? marketValue / equity * 100 : 0;
            const selected = group.id === selectedGroup;
            const segment = $('alloc-bars').children[i];
            segment.style.flex = String(weight);
            segment.classList.toggle('selected', selected);
            const key = $('alloc-keys').children[i];
            key.textContent = (group.id === 'cash' ? group[lang()] : group.id) + ' ' + weight.toFixed(1) + '%';
            key.setAttribute('aria-pressed', String(selected));
            if (selected) $('alloc-detail').textContent = group[lang()] + ' · ' + withSym(inDisplay(marketValue));
        });
    }

    function renderTotals() {
        const equity = totalValCny() + cashCny;
        renderAllocation(equity);
        const costBasis = totalCostCny();
        const pnl = equity - openingEquityCny;
        const pct = pnl / openingEquityCny * 100;
        $('demo-total').textContent = withSym(inDisplay(equity));
        $('demo-total-pnl').textContent =
            `${t('cost')} ${withSym(inDisplay(costBasis))} · ${t('pnl')} ${fmtSigned(inDisplay(pnl))} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`;
        $('demo-cash').textContent = `${lang() === 'zh' ? '可用现金' : 'Cash available'} ${withSym(inDisplay(cashCny))}`;
        for (const ccy of ['CNY', 'AUD']) {
            const marketValue = holdings.filter(h => h.ccy === ccy)
                .reduce((sum, h) => sum + h.qty * h.price, 0);
            const gain = marketValue + dayTradeCash[ccy] - dayOpening[ccy];
            setPnlCard(ccy.toLowerCase(), gain, gain / dayOpening[ccy] * 100, SYM[ccy]);
        }
    }

    function setPnlCard(key, pnl, pct, sym) {
        const el = $('demo-pnl-' + key), pe = $('demo-pnl-' + key + '-pct');
        const sign = pnl >= 0 ? '+' : '−';
        el.textContent = `${sign}${sym} ${fmt(Math.abs(pnl))}`;
        pe.textContent = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
        const cls = pnl >= 0 ? 'pos' : 'neg';
        el.closest('.demo-card-pnl').classList.remove('pos', 'neg');
        el.closest('.demo-card-pnl').classList.add(cls);
        el.classList.remove('pos', 'neg'); el.classList.add(cls);
        pe.classList.remove('pos', 'neg'); pe.classList.add(cls);
    }

    // ── Holdings rows ─────────────────────────────────────────────
    function renderRows(flashIdx = -1) {
        const L = lang();
        $('demo-rows').innerHTML = holdings.map((h, i) => {
            const dayPct = ((h.price - h.close) / h.close) * 100;
            const dayCls = dayPct >= 0 ? 'pos' : 'neg';
            const val = inDisplay(h.qty * h.price * FX[h.ccy]);
            const nm = L === 'zh' ? h.nameZh : h.nameEn;
            const mk = L === 'zh' ? h.marketZh : h.marketEn;
            return `
                <tr ${i === flashIdx ? 'class="demo-row-flash"' : ''}>
                    <td>
                        <div class="demo-name-main">${nm}</div>
                        <div class="demo-name-sub">${h.ticker} · ${mk}</div>
                    </td>
                    <td>${fmt(h.qty)}</td>
                    <td>${SYM[h.ccy]} ${h.price.toFixed(2)}</td>
                    <td><span class="demo-day-chip ${dayCls}">${dayPct >= 0 ? '+' : ''}${dayPct.toFixed(2)}%</span></td>
                    <td>${withSym(val)}</td>
                </tr>
            `;
        }).join('');
    }

    // ── P&L calendar (mirrors the real app's month view) ─────────
    // Deterministic synthetic month: weekday cells get a pseudo-random
    // P&L; weekends stay empty (no US trading day = no P&L row).
    function calDayPnl(day) {
        const x = Math.sin(day * 12.9898) * 43758.5453;
        const frac = x - Math.floor(x);
        return Math.round((frac - 0.42) * 900); // CNY, mildly positive-biased
    }

    function renderCalendar() {
        const box = $('demo-cal');
        const L = lang();
        const daysHdr = STRINGS.days[L] || STRINGS.days.en;
        const DAYS_IN_MONTH = 30;
        const FIRST_WEEKDAY = 0; // Monday-first grid, month starts Monday

        let html = daysHdr.map(d => `<div class="demo-cal-hd">${d}</div>`).join('');
        let win = 0, loss = 0, total = 0;

        for (let cell = 0; cell < 35; cell++) {
            const day = cell - FIRST_WEEKDAY + 1;
            if (day < 1 || day > DAYS_IN_MONTH) {
                html += '<div class="demo-cal-cell empty"></div>';
                continue;
            }
            const weekend = cell % 7 >= 5;
            if (weekend) {
                html += `<div class="demo-cal-cell off"><span class="d">${day}</span></div>`;
                continue;
            }
            const pnl = calDayPnl(day);
            total += pnl;
            const cls = pnl >= 0 ? 'pos' : 'neg';
            if (pnl >= 0) win++; else loss++;
            html += `
                <div class="demo-cal-cell ${cls}">
                    <span class="d">${day}</span>
                    <span class="v">${pnl >= 0 ? '+' : '−'}${Math.abs(Math.round(pnl / FX[displayCcy]))}</span>
                </div>`;
        }
        box.innerHTML = html;
        const footFn = STRINGS.calFoot[L] || STRINGS.calFoot.en;
        $('demo-cal-foot').textContent = footFn(win, loss, withSym(inDisplay(total)));
    }

    // ── Currency switcher ─────────────────────────────────────────
    function setCcy(c) {
        displayCcy = c;
        document.querySelectorAll('.demo-ccy').forEach(b => {
            const active = b.dataset.ccy === c;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', String(active));
        });
        renderTotals();
        renderRows();
        renderCalendar();
    }

    // ── Live price ticks ──────────────────────────────────────────
    function tickPrices() {
        const i = Math.floor(Math.random() * holdings.length);
        const h = holdings[i];
        const drift = (Math.random() - 0.48) * h.vol * h.price;
        h.price = Math.max(0.01, +(h.price + drift).toFixed(2));
        renderRows(i);
        renderTotals();
        $('demo-meta').textContent = t('priceUpdated');
    }

    // ── Transactions ledger ──────────────────────────────────────
    function dateLabel(key) {
        const v = STRINGS.dateLabels[key];
        if (v) return v[lang()] || v.en;
        return key;
    }
    function sideLabel(side) {
        return side === 'buy' ? t('sideBuy') : t('sideSell');
    }

    function renderLog() {
        const ul = $('demo-log');
        if (!actionLog.length) {
            ul.innerHTML = `<li class="demo-log-empty">${t('emptyLog')}</li>`;
        } else {
            ul.innerHTML = actionLog.slice().reverse().slice(0, 5).map(a => `
                <li class="demo-log-item">
                    <span class="tag ${a.side}">${sideLabel(a.side)}</span>
                    <span class="body">${a.qty} × <strong>${a.ticker}</strong> @ ${a.price.toFixed(2)}</span>
                    <span class="date">${dateLabel(a.dateKey)}</span>
                </li>
            `).join('');
        }
    }

    function populateLogSymbolSelect() {
        const L = lang();
        const previous = $('log-symbol').value;
        $('log-symbol').innerHTML = holdings.map(h => {
            const nm = L === 'zh' ? h.nameZh : h.nameEn;
            return `<option value="${h.ticker}">${h.ticker} · ${nm}</option>`;
        }).join('');
        if (previous) $('log-symbol').value = previous;
    }

    function announceTrade() {
        if (!lastTrade) return;
        const {kind, ticker, qty, available} = lastTrade;
        const zh = lang() === 'zh';
        let message;
        if (kind === 'cash') {
            message = zh ? '模拟现金不足，请减少数量。' : 'Not enough demo cash. Try a smaller quantity.';
        } else if (kind === 'shares') {
            message = zh ? `可卖出 ${available} 股 ${ticker}。` : `You can sell up to ${available} shares of ${ticker}.`;
        } else {
            message = zh ? `${ticker} 当前持仓：${qty}。` : `New holding: ${qty.toLocaleString('en-US')} ${ticker}.`;
        }
        const status = $('demo-trade-status');
        status.hidden = false;
        status.textContent = message;
    }

    function attachLogForm() {
        $('demo-log-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const ticker = $('log-symbol').value;
            const side   = $('log-side').value;
            const qty = $('log-qty').valueAsNumber;
            const h = holdings.find(row => row.ticker === ticker);
            if (!h || !Number.isSafeInteger(qty) || qty <= 0) return;

            const amountCny = qty * h.price * FX[h.ccy];
            if (side === 'buy' && amountCny > cashCny + 0.000001) {
                lastTrade = {kind: 'cash'};
            } else if (side === 'sell' && qty > h.qty) {
                lastTrade = {kind: 'shares', ticker, available: h.qty};
            } else {
                const change = side === 'buy' ? qty : -qty;
                if (side === 'buy') h.cost = (h.qty * h.cost + amountCny / FX[h.ccy]) / (h.qty + qty);
                h.qty += change;
                cashCny -= change * h.price * FX[h.ccy];
                if (h.ccy in dayTradeCash) dayTradeCash[h.ccy] -= change * h.price;
                actionLog.push({ dateKey: 'now', side, ticker, qty, price: h.price });
                lastTrade = {kind: 'success', ticker, qty: h.qty};
                renderLog();
                renderRows(holdings.indexOf(h));
                renderTotals();
            }
            announceTrade();
        });
    }

    // ── Full re-render on language change ────────────────────────
    function rerenderAll() {
        renderTotals();
        renderRows();
        renderCalendar();
        renderLog();
        populateLogSymbolSelect();
        announceTrade();
        $('demo-meta').textContent = t('priceUpdated');
    }

    // ── Init ──────────────────────────────────────────────────────
    function init() {
        const root = $('invest-demo');
        if (!root) return;

        initAllocation();
        rerenderAll();
        attachLogForm();

        document.querySelectorAll('.demo-ccy').forEach(b =>
            b.addEventListener('click', () => setCcy(b.dataset.ccy)));
        $('demo-refresh-btn').addEventListener('click', () => { tickPrices(); tickPrices(); });

        // Auto price tick only when demo is in viewport
        const io = new IntersectionObserver(entries => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    if (!refreshTimer) refreshTimer = setInterval(tickPrices, 4000);
                } else {
                    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
                }
            }
        }, { threshold: 0.15 });
        io.observe(root);

        document.addEventListener('portfolio:language', rerenderAll);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
