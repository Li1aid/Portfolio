(() => {
    const cards = Array.from(document.querySelectorAll('.shelf-item'));
    const feature = document.querySelector('.shelf-feature');
    const name = document.querySelector('#shelf-name');
    const summary = document.querySelector('#shelf-summary');
    const action = document.querySelector('.shelf-enter');
    const langButton = document.querySelector('#shelf-lang');
    const arrows = Array.from(document.querySelectorAll('[data-move]'));
    const reel = window.portfolioDemoReel(feature.querySelector('[data-reel]'));
    let language = 'en';
    try { language = localStorage.getItem('preferredLang') === 'zh' ? 'zh' : 'en'; } catch { /* use default */ }
    let selected;
    function renderDetails() {
        const card = cards[selected];
        const title = card.querySelector('.shelf-title').dataset[language];
        name.textContent = title;
        name.classList.toggle('long-title', title.length > 16);
        summary.textContent = card.getAttribute('data-summary-' + language);
        action.href = card.getAttribute('href');
    }
    function select(index, updateHistory = false) {
        selected = (index + cards.length) % cards.length;
        cards.forEach((card,i) => {
            if (i === selected) card.setAttribute('aria-current','true');
            else card.removeAttribute('aria-current');
        });
        const slug = cards[selected].dataset.project;
        if (feature.querySelector('[data-reel]').dataset.reel !== slug) reel.select(slug);
        if (updateHistory && location.hash.slice(1) !== slug) history.pushState(null,'','#' + slug);
        renderDetails();
    }
    function readHash() {
        const index = cards.findIndex(card => card.dataset.project === location.hash.slice(1));
        select(index < 0 ? 0 : index);
    }
    function translate() {
        const zh = language === 'zh';
        document.documentElement.lang = zh ? 'zh-CN' : 'en';
        document.querySelectorAll('[data-en][data-zh]').forEach(el => { el.textContent = el.dataset[language]; });
        langButton.textContent = zh ? 'EN' : '中文';
        langButton.setAttribute('aria-label', zh ? 'Switch to English' : '切换到中文');
        arrows[0].setAttribute('aria-label', zh ? '上一个项目' : 'Previous project');
        arrows[1].setAttribute('aria-label', zh ? '下一个项目' : 'Next project');
        document.querySelector('.shelf-collection').setAttribute('aria-label', zh ? '全部项目' : 'All projects');
        reel.setLanguage(language);
        renderDetails();
    }
    cards.forEach((card,index) => card.addEventListener('click', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
        e.preventDefault();
        select(index,true);
        feature.scrollIntoView({block:'start',behavior:'instant'});
        name.focus({preventScroll:true});
    }));
    name.tabIndex = -1;
    arrows.forEach(button => button.addEventListener('click', () => select(selected + Number(button.dataset.move),true)));
    window.addEventListener('popstate',readHash);
    window.addEventListener('hashchange',readHash);
    langButton.addEventListener('click', () => {
        language = language === 'en' ? 'zh' : 'en';
        try { localStorage.setItem('preferredLang',language); } catch { /* this tab still switches */ }
        translate();
    });
    readHash();
    translate();
})();
