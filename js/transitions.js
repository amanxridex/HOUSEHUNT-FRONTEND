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
