// Minimal text splitter. Keeps the accessible name on the parent and hides
// the fragments from assistive tech. Always call revert() in cleanup.
export function splitText(el, mode = 'chars') {
  const original = el.innerHTML;
  const label = el.textContent;
  el.setAttribute('aria-label', label);
  const wrap = (txt, cls) => {
    const s = document.createElement('span');
    s.className = cls;
    s.setAttribute('aria-hidden', 'true');
    s.textContent = txt;
    return s;
  };
  const words = [];
  const chars = [];
  const walk = (node, parent) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return parent.appendChild(document.createTextNode(' '));
          const w = document.createElement('span');
          w.className = 'sw';
          w.setAttribute('aria-hidden', 'true');
          if (mode === 'chars') {
            [...part].forEach((c) => {
              const inner = wrap(c, 'sc');
              chars.push(inner);
              w.appendChild(inner);
            });
          } else w.textContent = part;
          words.push(w);
          parent.appendChild(w);
        });
      } else if (child.nodeType === 1) {
        const clone = child.cloneNode(false);
        parent.appendChild(clone);
        walk(child, clone);
      }
    });
  };
  const frag = document.createElement('div');
  walk(el, frag);
  el.replaceChildren(...frag.childNodes);
  return {
    words,
    chars,
    revert() {
      el.innerHTML = original;
      el.removeAttribute('aria-label');
    },
  };
}
