(() => {
    const diagram = document.getElementById('arch-svg');
    const panel = document.getElementById('arch-panel');
    if (!diagram || !panel) return;

    panel.setAttribute('aria-live', 'polite');
    const nodes = diagram.querySelectorAll('.arch-node');
    nodes.forEach(node => {
        node.setAttribute('tabindex', '0');
        node.setAttribute('role', 'button');
        node.setAttribute('aria-controls', panel.id);
        node.setAttribute('aria-pressed', 'false');
        node.setAttribute('aria-label', node.querySelector('text').textContent.trim());
        node.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        node.addEventListener('click', () => {
            nodes.forEach(item => item.setAttribute('aria-pressed', String(item === node)));
        });
    });
})();
