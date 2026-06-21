/**
 * Snippet DevTools para diagnosticar artefatos visuais no topo da página.
 *
 * Como usar:
 *   1. Abra o site em http://localhost:3000
 *   2. Abra DevTools (F12) → aba Console
 *   3. Cole o conteúdo de __SNIPPET__ abaixo
 *   4. Veja a tabela com todos os elementos visíveis no topo
 *      (top < 200px do viewport) e suas propriedades
 */

const __SNIPPET__ = `
(function() {
  const all = document.querySelectorAll('body *');
  const out = [];
  for (const el of all) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.top > 200) continue;
    const s = window.getComputedStyle(el);
    out.push({
      tag: el.tagName,
      id: el.id || '',
      cls: (el.className?.toString() || '').slice(0, 70),
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      pos: s.position,
      z: s.zIndex,
      bg: s.backgroundColor,
      backdrop: s.backdropFilter || 'none',
      borderRadius: s.borderRadius,
      boxShadow: s.boxShadow !== 'none' ? s.boxShadow.slice(0, 40) : 'none',
      outline: s.outline !== 'none' ? s.outline.slice(0, 40) : 'none',
    });
  }
  console.table(out);
  // Bonus: destacar visualmente cada elemento com outline
  for (const el of all) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.top > 200) continue;
    el.style.outline = '2px dashed magenta';
    el.style.outlineOffset = '-2px';
  }
  console.log('Elementos destacados com outline magenta.');
})();
`

console.log(__SNIPPET__)
