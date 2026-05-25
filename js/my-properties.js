document.addEventListener('DOMContentLoaded', async () => {
    if (typeof lucide !== 'undefined') { lucide.createIcons(); }

    const container = document.getElementById('properties-container');
    const tabs = document.querySelectorAll('#property-tabs .tab');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    let allProperties = [];
    let drafts = [];
    let currentTab = 'active'; // active | pending | drafts

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="log-in" style="width: 48px; height: 48px; color: #ccc;"></i>
                <h3>Not Logged In</h3>
                <p>Please log in to view your properties.</p>
                <button onclick="window.location.href='login.html'" style="margin-top: 15px; padding: 10px 20px; background: #111; color: white; border: none; border-radius: 8px;">Login</button>
            </div>
        `;
        if (typeof lucide !== 'undefined') { lucide.createIcons(); }
        return;
    }

    // Backend will return drafts now
    const loadDrafts = () => {
        drafts = allProperties.filter(p => p.status === 'draft');
    };

    // Fetch properties from backend
    const fetchProperties = async () => {
        try {
            const BACKEND_URL = 'https://backend.househunt.live';
            const res = await fetch(`${BACKEND_URL}/api/user/properties/${user.uid}`);
            if (!res.ok) throw new Error('Failed to fetch properties');
            allProperties = await res.json();
        } catch (err) {
            console.error('Error fetching properties:', err);
            // Don't fail completely, we can still show drafts
        }
    };

    const renderProperties = () => {
        container.innerHTML = ''; // clear

        let displayList = [];

        if (currentTab === 'drafts') {
            displayList = drafts.map(d => ({ ...d, isDraft: true }));
        } else if (currentTab === 'active') {
            displayList = allProperties.filter(p => p.status === 'approved' || p.status === 'active');
        } else if (currentTab === 'pending') {
            displayList = allProperties.filter(p => p.status === 'pending' || p.status === 'rejected');
        }

        if (displayList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="home" style="width: 48px; height: 48px; color: #ccc;"></i>
                    <h3>No ${currentTab} properties</h3>
                    <p>You don't have any properties in this category.</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') { lucide.createIcons(); }
            return;
        }

        displayList.forEach(prop => {
            const card = document.createElement('div');
            
            if (prop.isDraft) {
                card.className = 'property-card pending';
                const propertyType = (prop.type || 'Property').charAt(0).toUpperCase() + (prop.type || 'Property').slice(1);
                
                card.innerHTML = `
                    <div class="card-img-container">
                        <div style="width: 100%; height: 100%; background: #eee; display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="edit-3" style="color: #999;"></i>
                        </div>
                        <div class="status-badge warn">Draft</div>
                    </div>
                    <div class="card-info">
                        <h3>Draft: ${propertyType}</h3>
                        <p class="loc"><i data-lucide="clock"></i> Last updated: ${new Date(prop.lastUpdated || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="resumeDraft('${prop.id}')">Resume</button>
                        <button class="edit-btn" onclick="deleteDraft('${prop.id}')" style="background: #ef4444; color: white; margin-left: 10px;">Delete</button>
                    </div>
                `;
            } else {
                card.className = \`property-card \${prop.status === 'pending' ? 'pending' : ''}\`;
                const isPending = prop.status === 'pending';
                const isRejected = prop.status === 'rejected';
                
                let badgeHtml = \`<div class="status-badge active">Live</div>\`;
                if (isPending) badgeHtml = \`<div class="status-badge warn">Pending Review</div>\`;
                if (isRejected) badgeHtml = \`<div class="status-badge" style="background: #fee2e2; color: #ef4444;">Rejected</div>\`;

                const imageUrl = prop.images && prop.images.length > 0 ? prop.images[0] : '../assets/househuntlogo.png';
                const formattedPrice = prop.price ? '₹ ' + (prop.price >= 10000000 ? (prop.price/10000000).toFixed(2) + ' Cr' : (prop.price/100000).toFixed(2) + ' L') : 'Price on request';

                card.innerHTML = `
                    <div class="card-img-container">
                        <img src="${imageUrl}" alt="Property" onerror="this.src='../assets/househuntlogo.png'; this.onerror=null;">
                        ${badgeHtml}
                    </div>
                    <div class="card-info">
                        <div class="price">${formattedPrice}</div>
                        <h3>${prop.title || prop.property_type}</h3>
                        <p class="loc"><i data-lucide="map-pin"></i> ${prop.location_text || prop.city || 'Location N/A'}</p>
                        ${!isPending && !isRejected ? `
                        <div class="stats">
                            <span><i data-lucide="eye"></i> 0 Views</span>
                            <span><i data-lucide="message-circle"></i> 0 Leads</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn">View Details</button>
                    </div>
                `;
            }
            container.appendChild(card);
        });

        if (typeof lucide !== 'undefined') { lucide.createIcons(); }
    };

    window.resumeDraft = (draftId) => {
        const draft = drafts.find(d => d.id === draftId);
        if (draft) {
            const details = draft.details || {};
            sessionStorage.setItem('househunt_basic_details', JSON.stringify(details.basic_details || {}));
            sessionStorage.setItem('househunt_contact_details', JSON.stringify(details.contact_details || {}));
            sessionStorage.setItem('househunt_draft_id', draftId);
            
            window.location.href = 'hosttype.html';
        }
    };

    window.deleteDraft = async (draftId) => {
        if (!confirm('Are you sure you want to delete this draft?')) return;
        const BACKEND_URL = 'https://backend.househunt.live';
        try {
            // Need a DELETE route, or we just rely on fetch returning error but optimistically removing it
            // We can implement a DELETE route later if needed, but for now we'll just ignore it or we can do a hack update to status='deleted'.
            // Actually, wait, let's just use Supabase direct or add a DELETE route. I'll add a simple DELETE route to server.js in a moment.
            await fetch(`${BACKEND_URL}/api/properties/draft/${draftId}`, { method: 'DELETE' });
            allProperties = allProperties.filter(p => p.id !== draftId);
            loadDrafts();
            renderProperties();
            document.querySelector('[data-tab="drafts"]').textContent = \`Drafts (\${drafts.length})\`;
        } catch(e) { console.error('Failed to delete', e); }
    };

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            renderProperties();
        });
    });

    // Initialize
    await fetchProperties();
    loadDrafts();
    
    // Update active tab count if possible
    const activeCount = allProperties.filter(p => p.status === 'approved' || p.status === 'active').length;
    document.querySelector('[data-tab="active"]').textContent = \`Active (\${activeCount})\`;
    
    const pendingCount = allProperties.filter(p => p.status === 'pending').length;
    document.querySelector('[data-tab="pending"]').textContent = \`Pending (\${pendingCount})\`;
    
    const draftCount = drafts.length;
    document.querySelector('[data-tab="drafts"]').textContent = \`Drafts (\${draftCount})\`;

    renderProperties();
});
