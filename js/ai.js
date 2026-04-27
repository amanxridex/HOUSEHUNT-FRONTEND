document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const suggestions = document.querySelectorAll('.suggestion');

    const addMessage = (text, isUser = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        msgDiv.innerHTML = `
            <div class="avatar">${isUser ? '👤' : '🤖'}</div>
            <div class="text">${text}</div>
        `;
        
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Animate entrance
        gsap.from(msgDiv, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out"
        });
    };

    const handleSend = () => {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        userInput.value = '';

        // Mock AI Thinking
        setTimeout(() => {
            const response = getAIResponse(text);
            addMessage(response);
        }, 1000);
    };

    const getAIResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes('noida')) return "Noida is currently seeing a massive boom in Sectors 150 and 144. Would you like me to show you some verified 3BHK listings there?";
        if (q.includes('plot')) return "Plots are a great investment! In the Yamuna Expressway area, prices have appreciated by 20% this year. I can filter some upcoming plot deals for you.";
        if (q.includes('rent')) return "For rentals, Indirapuram and Noida Sector 62 are the most popular for families. What is your budget range?";
        if (q.includes('3bhk')) return "A 3BHK in a premium society usually starts from ₹85 Lakhs in Greater Noida West and goes up to ₹2.5 Cr in South Delhi. Which area should I focus on?";
        
        return "That's an interesting question! As your HouseHunt assistant, I'm here to help you find the perfect property. Could you tell me more about your preferred location and budget?";
    };

    sendBtn.onclick = handleSend;
    userInput.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

    suggestions.forEach(s => {
        s.onclick = () => {
            userInput.value = s.innerText;
            handleSend();
        };
    });
});
