document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const continueBtn = document.getElementById('continueBtn');
    const inputs = document.querySelectorAll('input');

    // Handle button click
    continueBtn.addEventListener('click', async () => {
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
            
            let draftId = sessionStorage.getItem('househunt_draft_id');
            if (draftId) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const BACKEND_URL = 'https://backend.househunt.live';
                
                // Fetch the existing draft details first (we'll just send an update for details)
                // In a perfect world we'd merge, but backend just updates.
                // Wait, if we just send `details` we might overwrite basic_details.
                // Let's send the merged details.
                const basicDetails = JSON.parse(sessionStorage.getItem('househunt_basic_details') || '{}');
                
                try {
                    await fetch(`${BACKEND_URL}/api/properties/draft`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: draftId,
                            owner_id: user.uid,
                            details: {
                                basic_details: basicDetails,
                                contact_details: formData
                            }
                        })
                    });
                } catch (error) {
                    console.error('Error updating draft:', error);
                }
            }
            
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
