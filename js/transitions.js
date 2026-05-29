// Page Transitions and Smooth Loading
document.addEventListener('DOMContentLoaded', () => {
    // Global Interactive Click Effect
    const style = document.createElement('style');
    style.textContent = `
        /* App-like click animations for interactive elements */
        button, a, .property-card, .menu-item, .category-item, .tab, .card, .nav-item, .filter-btn, .sort-btn, .see-all {
            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease !important;
            -webkit-tap-highlight-color: transparent;
        }
        button:active, a:active, .property-card:active, .menu-item:active, .category-item:active, .tab:active, .card:active, .nav-item:active, .filter-btn:active, .sort-btn:active, .see-all:active {
            transform: scale(0.96) !important;
            opacity: 0.85;
        }
    `;
    document.head.appendChild(style);

    // Initial Fade In
    gsap.from('body', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    });

    // Handle bfcache restore (Fixes blank screen on swipe back)
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            gsap.set('body', { opacity: 1, clearProps: 'all' });
        }
    });

    // Handle Link Clicks for Fade Out
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !link.target) {
                e.preventDefault();
                gsap.to('body', {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        window.location.href = href;
                    }
                });
            }
        });
    });
    // Global Security: Block Right Click, Selection, and Dragging
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('dragstart', e => {
        if (e.target.nodeName === 'IMG' || e.target.nodeName === 'VIDEO') {
            e.preventDefault();
        }
    });

    document.addEventListener('keydown', e => {
        if (
            (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'p')) ||
            (e.metaKey && (e.key === 's' || e.key === 'u' || e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'p')) ||
            e.key === 'F12'
        ) {
            e.preventDefault();
            return false;
        }
    });
});

// Show Skeleton Logic (to be used by other scripts)
window.showSkeletons = (containerId, count = 3) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="skeleton-card skeleton"></div>
            <div class="skeleton-text skeleton"></div>
            <div class="skeleton-text skeleton" style="width: 60%"></div>
        `;
    }
    container.innerHTML = html;
};
