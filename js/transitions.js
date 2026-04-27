// Page Transitions and Smooth Loading
document.addEventListener('DOMContentLoaded', () => {
    // Initial Fade In
    gsap.from('body', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
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
