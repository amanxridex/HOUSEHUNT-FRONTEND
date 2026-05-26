document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://backend.househunt.live';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    const userId = currentUser ? (currentUser.uid || currentUser.id) : null;
    
    // Fix for mobile keyboard covering the input
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            document.body.style.height = window.visualViewport.height + 'px';
            window.scrollTo(0, 0);
        });
        // Set initial height
        document.body.style.height = window.visualViewport.height + 'px';
    }
    
    if (!currentUser || !userId) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const activeChatId = urlParams.get('chat_id');

    const chatListView = document.getElementById('chatListView');
    const chatRoomView = document.getElementById('chatRoomView');
    const bottomNav = document.getElementById('bottomNav');
    
    // View Management
    if (activeChatId) {
        chatListView.style.display = 'none';
        bottomNav.style.display = 'none';
        chatRoomView.style.display = 'flex';
        loadChatRoom(activeChatId);
    } else {
        chatRoomView.style.display = 'none';
        chatListView.style.display = 'flex';
        bottomNav.style.display = 'flex';
        loadChatList();
    }

    // --- LIST VIEW LOGIC ---
    async function loadChatList() {
        const container = document.getElementById('chatListContainer');
        const loading = document.getElementById('loadingChats');
        
        try {
            const res = await fetch(`${BACKEND_URL}/api/chats/${userId}`);
            const data = await res.json();
            
            loading.style.display = 'none';
            
            if (!res.ok || data.error) {
                container.innerHTML = `<div style="text-align: center; padding: 50px 20px; color: red;">API Error: ${data.error || 'Failed to load chats'}</div>`;
                return;
            }
            
            const chats = data;
            
            if (!Array.isArray(chats) || chats.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 50px 20px; color: #999;">No messages yet. Start chatting from a property page!</div>';
                return;
            }
            
            container.innerHTML = '';
            chats.forEach(chat => {
                // Determine the other person in the chat
                const isBuyer = chat.buyer_id === userId;
                const otherPerson = isBuyer ? chat.seller : chat.buyer;
                const property = chat.properties;
                
                const div = document.createElement('div');
                div.className = 'chat-item';
                div.style.padding = '15px 20px';
                div.style.borderBottom = '1px solid #f0f0f0';
                div.style.display = 'flex';
                div.style.gap = '15px';
                div.style.alignItems = 'center';
                div.style.cursor = 'pointer';
                div.onclick = () => {
                    window.location.href = `messages.html?chat_id=${chat.id}`;
                };
                
                const otherName = otherPerson?.full_name || otherPerson?.name || otherPerson?.display_name || 'User';
                const otherAvatar = otherPerson?.avatar_url || otherPerson?.photo || '../assets/profile.png';
                
                div.innerHTML = `
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: #ddd; overflow: hidden; flex-shrink: 0;">
                        <img src="${otherAvatar}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/profile.png'">
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${otherName}</h3>
                            <span style="font-size: 11px; color: #888;">${new Date(chat.updated_at).toLocaleDateString()}</span>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Re: ${property?.title || 'Property'}</p>
                    </div>
                `;
                container.appendChild(div);
            });
        } catch (e) {
            console.error(e);
            loading.innerHTML = 'Error loading chats.';
        }
    }

    // --- CHAT ROOM LOGIC ---
    let messagePollInterval;
    
    async function loadChatRoom(chatId) {
        const messagesContainer = document.getElementById('messagesContainer');
        const sendBtn = document.getElementById('sendBtn');
        const input = document.getElementById('messageInput');
        
        let otherPerson = null;
        let property = null;
        
        // Fetch chat details
        try {
            const res = await fetch(`${BACKEND_URL}/api/chats/${userId}`);
            if (res.ok) {
                const chats = await res.json();
                const currentChat = chats.find(c => c.id === chatId);
                if (currentChat) {
                    const isBuyer = currentChat.buyer_id === userId;
                    otherPerson = isBuyer ? currentChat.seller : currentChat.buyer;
                    property = currentChat.properties;
                }
            }
        } catch (e) {
            console.error("Could not fetch chat details:", e);
        }
        
        const otherName = otherPerson?.full_name || otherPerson?.name || otherPerson?.display_name || 'User';
        const otherAvatar = otherPerson?.avatar_url || otherPerson?.photo || '../assets/profile.png';
        const propTitle = property?.title || 'Property';

        // Setup beautiful header
        const headerTop = document.querySelector('.header-top');
        headerTop.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                <button onclick="window.location.href='messages.html'" style="background: #f5f5f5; border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
                    <i data-lucide="arrow-left" style="width: 20px; height: 20px; color: #111;"></i>
                </button>
                <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                    <div style="width: 42px; height: 42px; border-radius: 50%; background: #eee; overflow: hidden; flex-shrink: 0;">
                        <img src="${otherAvatar}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/profile.png'">
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${otherName}</h1>
                        <p style="margin: 0; font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Re: ${propTitle}</p>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.search-bar').style.display = 'none';
        lucide.createIcons();
        
        let existingMessageIds = new Set();
        
        async function fetchMessages() {
            try {
                const res = await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages`);
                const messages = await res.json();
                
                if (messages.length === 0 && existingMessageIds.size === 0) {
                    messagesContainer.innerHTML = '<div style="text-align: center; color: #999; margin-top: 20px; font-size: 13px;">No messages yet. Send the first message!</div>';
                    return;
                }
                
                // Clear "No messages" text if it's there
                if (messagesContainer.innerHTML.includes('No messages yet')) {
                    messagesContainer.innerHTML = '';
                }
                
                let isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 50;
                let addedNew = false;
                
                messages.forEach(msg => {
                    if (existingMessageIds.has(msg.id)) return;
                    
                    existingMessageIds.add(msg.id);
                    addedNew = true;
                    
                    const isMe = msg.sender_id === userId;
                    const bubble = document.createElement('div');
                    bubble.style.maxWidth = '75%';
                    bubble.style.padding = '12px 16px';
                    bubble.style.borderRadius = isMe ? '20px 20px 0 20px' : '20px 20px 20px 0';
                    bubble.style.background = isMe ? '#2D68FF' : 'white';
                    bubble.style.color = isMe ? 'white' : '#111';
                    bubble.style.alignSelf = isMe ? 'flex-end' : 'flex-start';
                    bubble.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                    bubble.style.fontSize = '14px';
                    bubble.style.lineHeight = '1.4';
                    bubble.style.opacity = '0';
                    bubble.style.transform = 'translateY(10px)';
                    bubble.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    
                    bubble.textContent = msg.content;
                    messagesContainer.appendChild(bubble);
                    
                    // Trigger animation
                    requestAnimationFrame(() => {
                        bubble.style.opacity = '1';
                        bubble.style.transform = 'translateY(0)';
                    });
                });
                
                if (addedNew && isAtBottom) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            } catch (e) {
                console.error(e);
            }
        }
        
        await fetchMessages();
        
        // Poll for new messages every 3 seconds (REALTIME FEEL)
        messagePollInterval = setInterval(fetchMessages, 3000);
        
        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;
            
            input.value = '';
            
            // Optimistic UI update
            const tempId = 'temp-' + Date.now();
            existingMessageIds.add(tempId);
            
            if (messagesContainer.innerHTML.includes('No messages yet')) {
                messagesContainer.innerHTML = '';
            }
            
            const bubble = document.createElement('div');
            bubble.style.maxWidth = '75%';
            bubble.style.padding = '12px 16px';
            bubble.style.borderRadius = '20px 20px 0 20px';
            bubble.style.background = '#2D68FF';
            bubble.style.color = 'white';
            bubble.style.alignSelf = 'flex-end';
            bubble.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
            bubble.style.fontSize = '14px';
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateY(10px) scale(0.95)';
            bubble.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            bubble.textContent = text;
            messagesContainer.appendChild(bubble);
            
            requestAnimationFrame(() => {
                bubble.style.opacity = '0.7';
                bubble.style.transform = 'translateY(0) scale(1)';
            });
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            try {
                await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender_id: userId,
                        content: text
                    })
                });
                bubble.style.opacity = '1';
                fetchMessages();
            } catch (e) {
                console.error(e);
                bubble.style.background = '#FF3B30';
            }
        }
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
