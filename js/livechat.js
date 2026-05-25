document.addEventListener('DOMContentLoaded', () => {
    const offlineState = document.getElementById('offline-state');
    const onlineState = document.getElementById('online-state');
    const chatStatusText = document.getElementById('chat-status-text');
    const chatForm = document.getElementById('chat-form');

    // Check IST Time
    function checkAvailability() {
        // Get current time in IST
        const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
        const formatter = new Intl.DateTimeFormat([], options);
        const parts = formatter.formatToParts(new Date());
        
        let hour = 0;
        let minute = 0;
        
        for (const part of parts) {
            if (part.type === 'hour') hour = parseInt(part.value, 10);
            if (part.type === 'minute') minute = parseInt(part.value, 10);
        }

        // Live chat is between 11:00 AM (11:00) and 6:00 PM (18:00)
        // Adjust logic if you strictly mean 11:00 to 18:00 inclusive of minutes before 18:00
        const isAvailable = hour >= 11 && hour < 18;

        if (isAvailable) {
            offlineState.style.display = 'none';
            onlineState.style.display = 'block';
            chatStatusText.textContent = '🟢 Online • Replies instantly';
            chatStatusText.style.color = '#10b981'; // Green
        } else {
            onlineState.style.display = 'none';
            offlineState.style.display = 'block';
            chatStatusText.textContent = '🔴 Offline • 11 AM - 6 PM IST';
            chatStatusText.style.color = '#ef4444'; // Red
        }
    }

    checkAvailability();

    // Handle Form Submission
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const issueSelect = document.getElementById('issue-select');
            const issueText = issueSelect.value;
            
            if (!issueText) return;

            const submitBtn = chatForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Creating...';
            lucide.createIcons();

            // Generate Ticket ID
            const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
            
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id || null;
            const BACKEND_URL = 'https://backend.househunt.live';
            
            try {
                await fetch(`${BACKEND_URL}/api/tickets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticket_id: ticketId, user_id: userId, issue_text: issueText })
                });
            } catch (err) {
                console.error("Failed to save ticket to backend", err);
            }
            
            // Save to localStorage
            localStorage.setItem('househunt_active_ticket', JSON.stringify({
                id: ticketId,
                status: 'Open',
                timestamp: Date.now()
            }));

            // Optional: simulate sending to backend
            alert(`Ticket Created: ${ticketId}\nA support agent will connect with you shortly.`);
            
            // Redirect back to help page
            window.location.href = 'help.html';
        });
    }
});
