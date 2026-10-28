/* Shared interactions used by the remaining pages. */
function wrapWords(el, cls, inner) {
  const out = [];
  const walk = (node) => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const word = document.createElement('span');
          word.className = cls;
          if (inner) { const text = document.createElement('span'); text.textContent = part; word.appendChild(text); out.push(text); }
          else { word.textContent = part; out.push(word); }
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    });
  };
  walk(el);
  return out;
}
document.querySelectorAll('.split').forEach(el => wrapWords(el, 'w', true));
const revealEls = document.querySelectorAll('.reveal, .split');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
  }), { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));
} else revealEls.forEach(el => el.classList.add('in'));
