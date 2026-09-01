// ── Ripple effect pool (réduire DOM manipulation) ──
let ripplePool = [];
const MAX_RIPPLES = 3;

function getRippleElement() {
  if (ripplePool.length > 0) {
    return ripplePool.pop();
  }
  const ripple = document.createElement('span');
  ripple.style.position = 'absolute';
  ripple.style.pointerEvents = 'none';
  ripple.style.borderRadius = '50%';
  ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)';
  return ripple;
}

function releaseRipple(ripple) {
  if (ripplePool.length < MAX_RIPPLES) {
    ripple.remove();
    ripplePool.push(ripple);
  } else {
    ripple.remove();
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const ripple = getRippleElement();
  if (!btn.style.position || btn.style.position === 'static') {
    btn.style.position = 'relative';
  }

  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const size = Math.max(rect.width, rect.height) * 1.5;

  ripple.style.width = size + 'px';
  ripple.style.height = size + 'px';
  ripple.style.left = x - size / 2 + 'px';
  ripple.style.top = y - size / 2 + 'px';
  ripple.style.animation = 'none';
  
  btn.appendChild(ripple);
  
  // Forcer reflow
  ripple.offsetHeight;
  ripple.style.animation = 'rippleAnimation 0.5s ease-out forwards';

  setTimeout(() => releaseRipple(ripple), 500);
}, { passive: true });

// ── Inject ripple animation keyframes ──
if (!document.querySelector('style[data-ripple]')) {
  const style = document.createElement('style');
  style.setAttribute('data-ripple', 'true');
  style.textContent = `
    @keyframes rippleAnimation {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// ── Shuffle button animation ──
const btnShuffle = document.getElementById('btnShuffle');
if (btnShuffle) {
  btnShuffle.addEventListener('click', function() {
    const svg = this.querySelector('svg');
    if (svg && !svg.classList.contains('rotating')) {
      svg.classList.add('rotating');
      setTimeout(() => svg.classList.remove('rotating'), 600);
    }
  }, { passive: true });
}