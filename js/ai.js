document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const suggestions = document.querySelectorAll('.suggestion');

    const GEMINI_API_KEY = 'AIzaSyCHK4oM3AmWEyNuZP9xo8JBvwjDFe0GeaE';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const addMessage = (text, isUser = false, isTyping = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const innerContent = isTyping ? `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        ` : text;

        msgDiv.innerHTML = `
            <div class="avatar">${isUser ? '👤' : '<img src="../assets/aipage.png" alt="AI">'}</div>
            <div class="text">${innerContent}</div>
        `;
        
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        gsap.from(msgDiv, {
            y: 30,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        return msgDiv;
    };

    // Personalized Welcome Message
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = user.name ? user.name.split(' ')[0] : 'there';
    setTimeout(() => {
        addMessage(`Hi ${firstName}, how are you doing today? How may I help you find your dream home?`);
    }, 500);

    const handleSend = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        userInput.value = '';

        // Typing Indicator
        const typingDiv = addMessage("", false, true);
        const typingTextContainer = typingDiv.querySelector('.text');

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY 
                },
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
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                typingTextContainer.innerText = aiResponse;
            } else {
                throw new Error("Invalid API Response");
            }
        } catch (e) {
            console.error("AI Error", e);
            typingTextContainer.innerText = "Sorry, I'm having trouble connecting to Gemini right now. Please try again later!";
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
