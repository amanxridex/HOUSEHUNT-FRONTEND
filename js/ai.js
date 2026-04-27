document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const suggestions = document.querySelectorAll('.suggestion');

    const GEMINI_API_KEY = 'AIzaSyCHK4oM3AmWEyNuZP9xo8JBvwjDFe0GeaE';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const addMessage = (text, isUser = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        msgDiv.innerHTML = `
            <div class="avatar">${isUser ? '👤' : '🤖'}</div>
            <div class="text">${text}</div>
        `;
        
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        gsap.from(msgDiv, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out"
        });
        return msgDiv;
    };

    const handleSend = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        userInput.value = '';

        // Typing Indicator
        const typingDiv = addMessage("Typing...", false);
        const typingText = typingDiv.querySelector('.text');

        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are HuntAI, a premium real estate assistant for HouseHunt India. 
                            Your goal is to help users find properties (Apartments, Villas, Plots) in India (especially Noida, Delhi, Gurgaon).
                            Be professional, helpful, and concise. 
                            The user says: ${text}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            typingText.innerText = aiResponse;
        } catch (e) {
            console.error("AI Error", e);
            typingText.innerText = "Sorry, I'm having trouble connecting right now. Please try again later!";
        }
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
