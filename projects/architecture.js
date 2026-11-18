/* Project pages supply their diagram's content and the flows each node uses. */
window.mountProjectArchitecture = function (nodes) {
    const diagram = document.getElementById('arch-svg');
    const content = document.querySelector('#arch-panel .arch-panel-content');
    if (!diagram || !content) return;

    const buttons = Array.from(diagram.querySelectorAll('.arch-node'));
    const lines = Array.from(diagram.querySelectorAll('.arch-line'));
    const picker = document.createElement('select');
    picker.className = 'arch-node-select';
    picker.setAttribute('aria-controls', 'arch-panel');
    const placeholder = new Option('', '');
    placeholder.disabled = true;
    picker.add(placeholder);
    for (const button of buttons) picker.add(new Option('', button.dataset.node));
    picker.value = '';
    diagram.before(picker);
    let selected = null;

    function language() {
        return document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function select(key) {
        const data = nodes[key];
        if (!data) return;
        selected = key;
        picker.value = key;
        const lang = language();
        const why = element('div', '', 'why-row');
        why.append(
            element('strong', lang === 'zh' ? '为什么这样选' : 'Why this choice'),
            element('p', data.why[lang])
        );
        content.replaceChildren(
            element('h3', data.title[lang], 'arch-panel-title'),
            element('p', data.body[lang]),
            why
        );
        content.dataset.nodeDetail = key;
        diagram.classList.add('has-active');
        buttons.forEach(button => {
            const active = key === button.dataset.node;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        lines.forEach(line => {
            line.classList.toggle('arch-active-flow', data.flows.some(flow => line.classList.contains(flow)));
        });
    }

    function labelNodes() {
        const lang = language();
        const prompt = lang === 'zh' ? '选择组件' : 'Choose a component';
        placeholder.textContent = prompt;
        picker.setAttribute('aria-label', prompt);
        buttons.forEach((button, index) => {
            const title = nodes[button.dataset.node].title[lang];
            button.setAttribute('aria-label', title);
            picker.options[index + 1].textContent = title;
        });
    }

    picker.addEventListener('change', () => select(picker.value));
    content.setAttribute('aria-live', 'polite');
    buttons.forEach(button => {
        button.setAttribute('tabindex', '0');
        button.setAttribute('role', 'button');
        button.setAttribute('aria-controls', 'arch-panel');
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => select(button.dataset.node));
        button.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            select(button.dataset.node);
        });
    });
    labelNodes();
    document.addEventListener('portfolio:language', () => {
        labelNodes();
        if (selected) select(selected);
    });
};
