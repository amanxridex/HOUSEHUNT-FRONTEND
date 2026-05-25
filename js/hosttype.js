document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // State management
    const state = {
        role: 'owner',
        intent: 'rent',
        type: 'apartment'
    };

    // DOM elements
    const optionGroups = document.querySelectorAll('.options-grid');
    const continueBtn = document.getElementById('continueBtn');
    const summaryRole = document.getElementById('summary-role');
    const summaryIntent = document.getElementById('summary-intent');
    const summaryType = document.getElementById('summary-type');

    // Update summary bar
    function updateSummary() {
        const roleCard = document.querySelector('[data-question="role"] .option-card.active');
        const intentCard = document.querySelector('[data-question="intent"] .option-card.active');
        const typeCard = document.querySelector('[data-question="type"] .option-card.active');

        if (roleCard) {
            summaryRole.textContent = roleCard.querySelector('.card-label').textContent;
            state.role = roleCard.dataset.value;
        }
        if (intentCard) {
            summaryIntent.textContent = intentCard.querySelector('.card-label').textContent;
            state.intent = intentCard.dataset.value;
        }
        if (typeCard) {
            summaryType.textContent = typeCard.querySelector('.card-label').textContent;
            state.type = typeCard.dataset.value;
        }

        // Animate summary items
        document.querySelectorAll('.summary-item').forEach((item, index) => {
            item.classList.remove('active');
            void item.offsetWidth; // Trigger reflow
            setTimeout(() => item.classList.add('active'), index * 100);
        });
    }

    // Create ripple effect
    function createRipple(e, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // Handle option selection
    optionGroups.forEach(group => {
        const options = group.querySelectorAll('.option-card');

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                // Don't re-select if already active
                if (option.classList.contains('active')) return;

                // Remove active from siblings
                options.forEach(opt => {
                    opt.classList.remove('active', 'just-selected');
                });

                // Add active to clicked
                option.classList.add('active', 'just-selected');

                // Remove animation class after animation completes
                setTimeout(() => {
                    option.classList.remove('just-selected');
                }, 600);

                // Create ripple
                createRipple(e, option);

                // Update summary
                updateSummary();

                // Haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            });
        });
    });

    // Continue button handler
    continueBtn.addEventListener('click', async (e) => {
        // Create ripple on button
        createRipple(e, continueBtn);

        // Animate button
        continueBtn.style.transform = 'scale(0.97)';
        setTimeout(() => {
            continueBtn.style.transform = '';
        }, 150);

        // Prepare data for next step
        const formData = {
            ...state,
            timestamp: new Date().toISOString()
        };

        console.log('Proceeding with:', formData);

        // Store in sessionStorage for next step
        sessionStorage.setItem('househunt_basic_details', JSON.stringify(formData));

        // Draft handling via Backend
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.uid) {
            alert('Please login first to save your draft.');
            window.location.href = 'login.html';
            return;
        }

        let draftId = sessionStorage.getItem('househunt_draft_id');
        const BACKEND_URL = 'https://backend.househunt.live';
        
        const draftPayload = {
            owner_id: user.uid,
            property_type: state.type,
            intent: state.intent,
            details: { basic_details: formData }
        };
        if (draftId) draftPayload.id = draftId;

        try {
            const res = await fetch(`${BACKEND_URL}/api/properties/draft`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftPayload)
            });
            if (!res.ok) throw new Error('Failed to save draft');
            const data = await res.json();
            
            sessionStorage.setItem('househunt_draft_id', data.id);
            window.location.href = 'contact.html';
        } catch (error) {
            console.error('Error saving draft:', error);
            // Fallback to next step anyway if backend fails
            window.location.href = 'contact.html';
        }
    });

    // Toast notification
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i data-lucide="check-circle-2"></i>
            <span>${message}</span>
        `;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%) translateY(20px)',
            background: 'var(--text-main)',
            color: 'var(--white)',
            padding: '14px 24px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '700',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: '1000',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none'
        });

document.body.appendChild(toast);

if (typeof lucide !== 'undefined') {
    lucide.createIcons({ nodes: [toast] });
}

requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
});

setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
}, 2500);
    }

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.classList.contains('option-card')) {
        document.activeElement.click();
    }
});

// Make cards focusable
document.querySelectorAll('.option-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', card.classList.contains('active'));
});

// Initialize summary
updateSummary();

// Check for saved data
const saved = sessionStorage.getItem('househunt_basic_details');
if (saved) {
    try {
        const data = JSON.parse(saved);
        console.log('Previous selection found:', data);
    } catch (e) {
        console.log('No previous data');
    }
}
});