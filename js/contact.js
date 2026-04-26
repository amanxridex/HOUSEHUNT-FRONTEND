document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const continueBtn = document.getElementById('continueBtn');
    const inputs = document.querySelectorAll('input');

    // Handle button click
    continueBtn.addEventListener('click', () => {
        let isValid = true;
        const formData = {};

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#FF5C5C';
            } else {
                input.style.borderColor = 'transparent';
                formData[input.id] = input.value;
            }
        });

        if (isValid) {
            console.log('Contact info saved:', formData);
            sessionStorage.setItem('househunt_contact_details', JSON.stringify(formData));
            
            // For now, let's just go back home or show success
            showToast('Contact info saved successfully!');
            
            const basicDetails = JSON.parse(sessionStorage.getItem('househunt_basic_details') || '{}');
            const intent = basicDetails.intent || 'rent';
            window.location.href = `property-details-${intent}.html`;
        }
    });

    // Toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i data-lucide="check-circle-2"></i><span>${message}</span>`;
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%) translateY(20px)',
            background: '#1A1D1E',
            color: '#FFFFFF',
            padding: '14px 24px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: '1000',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        });

        document.body.appendChild(toast);
        lucide.createIcons({ nodes: [toast] });

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
});
