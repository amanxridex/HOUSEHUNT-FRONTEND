document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const ticketStatus = document.getElementById('ticketStatus');
    
    const BACKEND_URL = 'https://backend.househunt.live';
    
    // Check for active ticket
    const activeTicketRaw = localStorage.getItem('househunt_active_ticket');
    if (!activeTicketRaw) {
        window.location.href = 'help.html';
        return;
    }
    
    const activeTicket = JSON.parse(activeTicketRaw);
    const ticketId = activeTicket.id; // e.g. TKT-7691
    let dbTicketId = null; // UUID from backend

    // First we need the UUID of the ticket. 
    // Wait, the API we built uses the UUID (`id`), not `ticket_id` string.
    // Let's fetch all user tickets to find the UUID, or just hit an endpoint if it existed.
    // Actually, in livechat.js we just saved the string ticketId.
    // We can fetch all tickets and find ours, this is a bit hacky but works for the demo since there's no user auth forced for tickets.
    async function initChat() {
        try {
            // In a real app, there'd be an endpoint to get ticket by `ticket_id`
            // Here we just fetch all admin tickets.
            const res = await fetch(`${BACKEND_URL}/api/admin/tickets`, {
                headers: { 'x-admin-token': 'Aarambhindia-Secret' }
            });
            const allTickets = await res.json();
            const myTicket = allTickets.find(t => t.ticket_id === ticketId);
            
            if (myTicket) {
                dbTicketId = myTicket.id;
                if (myTicket.status === 'resolved') {
                    ticketStatus.textContent = '● Ticket Resolved';
                    ticketStatus.style.color = '#94a3b8';
                    chatInput.placeholder = 'Ticket resolved...';
                    chatInput.disabled = true;
                    sendBtn.disabled = true;
                } else {
                    ticketStatus.textContent = '● Agent Online';
                    chatInput.disabled = false;
                    sendBtn.disabled = false;
                }
                
                fetchMessages();
                setInterval(fetchMessages, 2000);
            } else {
                chatMessages.innerHTML = `<div class="sys-msg">Ticket not found in system.</div>`;
            }
        } catch(err) {
            console.error(err);
            chatMessages.innerHTML = `<div class="sys-msg">Failed to connect to chat.</div>`;
        }
    }

    async function fetchMessages() {
        if (!dbTicketId) return;
        try {
            const statusRes = await fetch(`${BACKEND_URL}/api/tickets/status/${ticketId}`);
            const statusData = await statusRes.json();
            
            if (statusData && statusData.status === 'resolved' && ticketStatus.textContent !== '● Ticket Resolved') {
                ticketStatus.textContent = '● Ticket Resolved';
                ticketStatus.style.color = '#94a3b8';
                
                const chatInputArea = document.getElementById('chatInputArea');
                const feedbackArea = document.getElementById('feedbackArea');
                if (chatInputArea) chatInputArea.style.display = 'none';
                if (feedbackArea) feedbackArea.style.display = 'flex';
            }

            const res = await fetch(`${BACKEND_URL}/api/tickets/${dbTicketId}/messages`);
            const msgs = await res.json();
            
            let html = `<div class="sys-msg">Ticket ${ticketId} Created</div>`;
            
            msgs.forEach(m => {
                if (m.sender_role === 'user') {
                    html += `<div class="msg-bubble msg-user">${m.message}</div>`;
                } else {
                    html += `<div class="msg-bubble msg-admin">${m.message}</div>`;
                }
            });
            
            chatMessages.innerHTML = html;
        } catch(err) {
            console.error("Poll error", err);
        }
    }

    async function sendMessage() {
        if (!dbTicketId) return;
        const text = chatInput.value.trim();
        if (!text) return;
        
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        
        try {
            await fetch(`${BACKEND_URL}/api/tickets/${dbTicketId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender_role: 'user', message: text })
            });
            await fetchMessages();
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch(err) {
            console.error(err);
        } finally {
            if (ticketStatus.textContent !== '● Ticket Resolved') {
                chatInput.disabled = false;
                sendBtn.disabled = false;
                chatInput.focus();
            }
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    initChat();

    // --- Feedback Logic ---
    let selectedRating = 0;
    const stars = document.querySelectorAll('.star-icon');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    const feedbackArea = document.getElementById('feedbackArea');

    if (stars && submitFeedbackBtn && feedbackArea) {
        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-rating'));
                
                // Highlight stars
                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-rating')) <= selectedRating) {
                        s.style.color = '#eab308'; // Yellow
                        s.style.fill = '#eab308';
                    } else {
                        s.style.color = '#ccc';
                        s.style.fill = 'transparent';
                    }
                });
                
                submitFeedbackBtn.disabled = false;
            });
        });

        submitFeedbackBtn.addEventListener('click', async () => {
            if (selectedRating === 0 || !dbTicketId) return;
            
            submitFeedbackBtn.disabled = true;
            submitFeedbackBtn.textContent = 'Submitting...';
            
            try {
                await fetch(`${BACKEND_URL}/api/tickets/${dbTicketId}/rating`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating: selectedRating })
                });
                
                feedbackArea.innerHTML = `
                    <div style="text-align: center;">
                        <i data-lucide="check-circle" style="color: #10b981; width: 32px; height: 32px; margin-bottom: 10px;"></i>
                        <p style="margin:0; font-weight: 600; color: #10b981;">Thank you for your feedback!</p>
                    </div>
                `;
                lucide.createIcons();
            } catch(err) {
                console.error("Failed to submit rating", err);
                submitFeedbackBtn.disabled = false;
                submitFeedbackBtn.textContent = 'Submit Feedback';
            }
        });
    }

});
