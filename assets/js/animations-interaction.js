/**
 * ═══════════════════════════════════════════════════════════════
 * ANIMATIONS INTERACTIVES - WallpGen
 * Micro-interactions légères sans modifier la logique existante
 * ═══════════════════════════════════════════════════════════════
 */

// Ripple effect au clic sur les boutons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const ripple = document.createElement('span');
  ripple.style.position = 'absolute';
  ripple.style.pointerEvents = 'none';
  ripple.style.borderRadius = '50%';
  ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)';
  ripple.style.animation = 'rippleAnimation 0.6s ease-out';

  if (!btn.style.position || btn.style.position === 'static') {
    btn.style.position = 'relative';
  }

  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const size = Math.max(rect.width, rect.height);

  ripple.style.width = size + 'px';
  ripple.style.height = size + 'px';
  ripple.style.left = x - size / 2 + 'px';
  ripple.style.top = y - size / 2 + 'px';

  btn.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
});

// Ajouter l'animation CSS dynamiquement
if (!document.querySelector('style[data-animations]')) {
  const style = document.createElement('style');
  style.setAttribute('data-animations', 'ripple');
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

    @keyframes pressDown {
      0% { transform: scale(1); }
      50% { transform: scale(0.98); }
      100% { transform: scale(1); }
    }

    @keyframes successPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    @keyframes slideInNotify {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutNotify {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Animation de retour haptique sur les changements
const animateButtonPress = (element) => {
  element.style.animation = 'pressDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  setTimeout(() => {
    element.style.animation = '';
  }, 300);
};

// Ajouter du feedback aux clics de patterns
const styleGrid = document.getElementById('styleGrid');
if (styleGrid) {
  styleGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.style-btn');
    if (btn) {
      // Retirer l'animation précédente
      const previousActive = styleGrid.querySelector('.style-btn.active');
      if (previousActive && previousActive !== btn) {
        previousActive.style.animation = 'none';
      }
      // Ajouter pulse d'activation
      btn.style.animation = 'successPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => {
        btn.style.animation = '';
      }, 400);
    }
  });
}

// Ajouter du feedback aux palettes
const paletteRow = document.getElementById('paletteRow');
if (paletteRow) {
  paletteRow.addEventListener('click', (e) => {
    const swatch = e.target.closest('.palette-swatch');
    if (swatch) {
      swatch.style.animation = 'successPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => {
        swatch.style.animation = '';
      }, 400);
    }
  });
}

// Animation lors du shuffle
const btnShuffle = document.getElementById('btnShuffle');
if (btnShuffle) {
  btnShuffle.addEventListener('click', function() {
    this.style.animation = 'smoothRotate 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => {
      this.style.animation = '';
    }, 800);
  });
}

// Feedback d'export avec stagger
document.getElementById('btnDesktop')?.addEventListener('click', function() {
  this.style.animation = 'pressDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
  setTimeout(() => this.style.animation = '', 400);
});

document.getElementById('btnMobile')?.addEventListener('click', function() {
  this.style.animation = 'pressDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
  setTimeout(() => this.style.animation = '', 400);
});

// Animations de toggle mode
const btnDark = document.getElementById('btnDark');
const btnLight = document.getElementById('btnLight');

if (btnDark) {
  btnDark.addEventListener('click', function() {
    this.style.animation = 'slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => this.style.animation = '', 400);
  });
}

if (btnLight) {
  btnLight.addEventListener('click', function() {
    this.style.animation = 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => this.style.animation = '', 400);
  });
}

// Parallax léger au scroll
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      const previewArea = document.querySelector('.preview-area');
      
      if (previewArea) {
        previewArea.style.transform = `translateY(${scrolled * 0.3}px)`;
      }

      ticking = false;
    });
    ticking = true;
  }
});

// Animation d'entrée staggered avec Intersection Observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = `${entry.target.getAttribute('data-animation') || 'fadeInUp'} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both`;
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observer les éléments avec attribut data-observe
document.querySelectorAll('[data-observe]').forEach(el => {
  observer.observe(el);
});

// Enhanced nav interactions
const navTabs = document.querySelectorAll('.nav-tab');
navTabs.forEach((tab) => {
  tab.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-2px)';
  });
  tab.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// Language menu stagger animation
const languageBtn = document.getElementById('languageBtn');
if (languageBtn) {
  languageBtn.addEventListener('click', () => {
    const menu = document.getElementById('languageMenu');
    if (menu && menu.style.display !== 'none') {
      const options = menu.querySelectorAll('.language-option');
      options.forEach((opt, idx) => {
        opt.style.animation = `fadeInUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 50}ms both`;
      });
    }
  });
}

// Ajouter bounce au redimensionnement des canvas
const previewDesktop = document.getElementById('previewDesktop');
const previewMobile = document.getElementById('previewMobile');

if (previewDesktop) {
  const resizeObserver = new ResizeObserver(() => {
    previewDesktop.style.animation = 'elasticBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => previewDesktop.style.animation = '', 400);
  });
  
  resizeObserver.observe(previewDesktop);
}

if (previewMobile) {
  const resizeObserver = new ResizeObserver(() => {
    previewMobile.style.animation = 'elasticBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => previewMobile.style.animation = '', 400);
  });
  
  resizeObserver.observe(previewMobile);
}

// Smooth theme transition
const originalGetComputedStyle = window.getComputedStyle;
const themeButtons = document.querySelectorAll('#themeDark, #themeLight');

themeButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    document.documentElement.style.opacity = '0.95';
    setTimeout(() => {
      document.documentElement.style.opacity = '1';
    }, 50);
    
    this.style.animation = 'gentleShake 0.3s ease';
    setTimeout(() => this.style.animation = '', 300);
  });
});

// Animer les changements d'aperçu
const renderPreviewWithAnimation = () => {
  const containers = [
    document.querySelector('.preview-container'),
    document.querySelector('.controls-panel')
  ];
  
  containers.forEach(container => {
    if (container) {
      container.style.animation = 'none';
      setTimeout(() => {
        container.style.animation = 'subtlePulse 0.3s ease-in-out';
        setTimeout(() => {
          container.style.animation = '';
        }, 300);
      }, 10);
    }
  });
};

// Injecter la méthode dans le rendu
if (window.__renderPreview) {
  const original = window.__renderPreview;
  window.__renderPreview = function() {
    original.call(this);
    renderPreviewWithAnimation();
  };
}

console.log('✨ Animations sophistiquées chargées avec succès !');