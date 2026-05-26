document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://backend.househunt.live';
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    if (!propertyId) {
        console.error('No property ID provided');
        return;
    }

    const quotes = [
        "Home is where your story begins.",
        "The ache for home lives in all of us.",
        "There is nothing like staying at home for real comfort.",
        "A house is made of bricks and beams. A home is made of hopes and dreams.",
        "Finding the perfect property takes time, but it's worth it."
    ];
    
    const loadingQuote = document.getElementById('loadingQuote');
    if (loadingQuote) {
        loadingQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/properties`);
        const allProperties = await response.json();
        const p = allProperties.find(item => item.id == propertyId);

        if (!p) {
            console.error('Property not found');
            return;
        }

        // Hide loading screen and show content
        const loadingScreen = document.getElementById('propertyLoadingScreen');
        const mainContent = document.getElementById('mainContent');
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (mainContent) mainContent.style.display = 'flex';

        // --- Basic Info ---
        document.querySelector('.price').textContent = `${p.price}`;
        document.querySelector('.type-tag').textContent = `For ${p.intent}`;
        document.querySelector('.title').textContent = p.title || `${p.property_type} in ${p.city}`;
        document.querySelector('.location').innerHTML = `<i data-lucide="map-pin"></i> ${p.location_text || p.location || p.city}`;
        document.querySelector('.main-img').src = (p.images && p.images[0]) || p.image || '../assets/mainappicon.png';
        
        const descEl = document.getElementById('propDesc');
        if (descEl) descEl.textContent = p.description || 'No description available.';

        // --- Dynamic Stats Grid (Top) ---
        const statsGrid = document.querySelector('.stats-grid');
        statsGrid.innerHTML = ''; 

        const details = p.details || {};
        
        // Define mappings for important fields at the top
        const statMappings = [
            { key: 'area', label: 'Sqft', icon: 'maximize' },
            { key: 'carpetArea', label: 'Sqft', icon: 'maximize' },
            { key: 'bhk', label: '', icon: 'bed' },
            { key: 'beds', label: 'Beds', icon: 'bed' },
            { key: 'bedrooms', label: 'Beds', icon: 'bed' },
            { key: 'bath', label: 'Bath', icon: 'bath' },
            { key: 'bathrooms', label: 'Bath', icon: 'bath' },
            { key: 'floor', label: 'Floor', icon: 'layers', prefix: 'Floor ' },
            { key: 'floorNumber', label: 'Floor', icon: 'layers', prefix: 'Floor ' },
            { key: 'facing', label: 'Facing', icon: 'navigation' },
            { key: 'furnishing', label: '', icon: 'armchair' },
            { key: 'plot_area', label: 'Plot Area', icon: 'map' },
            { key: 'plotArea', label: 'Plot Area', icon: 'map' }
        ];

        let topStatsAdded = 0;
        statMappings.forEach(m => {
            if (details[m.key] && topStatsAdded < 4) {
                let value = details[m.key];
                if (m.prefix) value = m.prefix + value;
                if (m.label) value = value + ' ' + m.label;
                addStat(statsGrid, m.icon, value);
                topStatsAdded++;
            }
        });

        // --- Full Details Grid ---
        const fullDetailsGrid = document.getElementById('fullDetailsGrid');
        if (fullDetailsGrid) {
            fullDetailsGrid.innerHTML = '';
            
            const labelMap = {
                bhk: 'BHK Type', area: 'Area (Sqft)', carpet_area: 'Carpet Area (Sqft)', built_up: 'Built-up Area (Sqft)',
                plot_area: 'Plot Area', total_floors: 'Total Floors', floor: 'Floor Number', facing: 'Facing',
                furnishing: 'Furnishing', rent: 'Monthly Rent', negotiable: 'Negotiable', deposit: 'Security Deposit',
                maintenance: 'Maintenance', maint: 'Maintenance', brokerage: 'Brokerage', parking_fee: 'Parking Charges',
                electricity: 'Electricity', water: 'Water', avail_date: 'Available From', lease_duration: 'Lease (Months)',
                lease: 'Lease (Years)', notice_period: 'Notice Period (Days)', status: 'Status', tenant_pref: 'Preferred Tenant',
                gender: 'Gender Pref', occupancy: 'Occupancy Limit', food: 'Food Preference', pets: 'Pets Allowed',
                gated: 'Gated Society', beds: 'Bedrooms', bath: 'Bathrooms', pool: 'Private Pool', garden: 'Private Garden',
                servant: 'Servant Room', clubhouse: 'Clubhouse Access', gym: 'Home Gym', theatre: 'Home Theatre',
                gst: 'GST Applicable', escalation: 'Rent Escalation %', power: 'Power Load (kW)', washrooms: 'Washrooms',
                fire: 'Fire Safety Compliant', suitable: 'Suitable For', occupancy_status: 'Occupancy Status', roi: 'Expected ROI %',
                price_unit: 'Price per Sq.Ft/Yd', plot_type: 'Plot Type', title_clear: 'Title Clear', registry: 'Registry Available',
                authority: 'Approved By', road: 'Road Width (Ft)', boundary: 'Boundary Wall', sqft_price: 'Price per Sq. Ft.',
                ownership: 'Ownership Type', age: 'Property Age', possession: 'Possession', rera: 'RERA Registered',
                loan_approved: 'Bank Loan Approved', under_loan: 'Currently Under Loan', society: 'Society Name'
            };

            const dynamicFields = [
                { label: 'Property Type', val: p.property_type },
                { label: 'Intent', val: p.intent }
            ];

            Object.entries(details).forEach(([key, val]) => {
                if (key === 'desc' || Array.isArray(val)) return;
                
                if (labelMap[key]) {
                     dynamicFields.push({ label: labelMap[key], val: val });
                } else if (typeof val !== 'object' && typeof val !== 'boolean') {
                     dynamicFields.push({ label: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), val: val });
                }
            });

            dynamicFields.forEach(field => {
                let displayVal = field.val;
                if (displayVal === undefined || displayVal === null || displayVal === '') return;
                
                if (displayVal === true || displayVal === 'true') displayVal = 'Yes';
                if (displayVal === false || displayVal === 'false') displayVal = 'No';

                const row = document.createElement('div');
                row.className = 'detail-row';
                row.innerHTML = `<span class="detail-label">${field.label}</span><span class="detail-value">${displayVal}</span>`;
                fullDetailsGrid.appendChild(row);
            });
        }

        // --- Dynamic Amenities ---
        const amenityGrid = document.querySelector('.amenity-grid');
        amenityGrid.innerHTML = '';
        
        // Collect everything else into a list of "Extra Features"
        const skipKeys = ['area', 'bhk', 'beds', 'bath', 'floor', 'facing', 'furnishing', 'plot_area', 'carpet_area', 'total_floors', 'built_up', 'rent', 'deposit', 'price', 'desc'];
        
        Object.entries(details).forEach(([key, val]) => {
            if (skipKeys.includes(key)) return;
            
            if (Array.isArray(val)) {
                val.forEach(item => addAmenity(amenityGrid, item));
            } else if (typeof val === 'boolean' && val === true) {
                // Convert key like 'gated_society' to 'Gated Society'
                const label = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                addAmenity(amenityGrid, label);
            } else if (typeof val === 'string' && val.length > 0 && val !== 'all') {
                addAmenity(amenityGrid, val);
            }
        });

        if (amenityGrid.innerHTML === '') {
            document.querySelector('.amenities').style.display = 'none';
        }

        // --- Seller Info ---
        if (p.owner_id) {
            try {
                const profileRes = await fetch(`${BACKEND_URL}/api/profiles/${p.owner_id}`);
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    if (profileData && profileData.full_name) {
                        const sellerNameEl = document.querySelector('.seller-info h4');
                        if (sellerNameEl) sellerNameEl.textContent = profileData.full_name;
                        
                        if (profileData.role) {
                            const role = profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1);
                            const roleEl = document.querySelector('.seller-info p');
                            if (roleEl) roleEl.textContent = role;
                        }
                    }
                }
            } catch(e) {
                console.error("Failed to fetch seller profile");
            }
        } else if (p.owner_name) {
            const sellerNameEl = document.querySelector('.seller-info h4');
            if (sellerNameEl) sellerNameEl.textContent = p.owner_name;
        }

        // --- Wishlist Button Logic ---
        const wishlistBtn = document.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            const favorites = JSON.parse(localStorage.getItem('househunt_favorites') || '[]');
            if (favorites.includes(propertyId)) {
                wishlistBtn.classList.add('active');
            }

            wishlistBtn.addEventListener('click', () => {
                const currentFavs = JSON.parse(localStorage.getItem('househunt_favorites') || '[]');
                if (currentFavs.includes(propertyId)) {
                    // Remove
                    const newFavs = currentFavs.filter(id => id !== propertyId);
                    localStorage.setItem('househunt_favorites', JSON.stringify(newFavs));
                    wishlistBtn.classList.remove('active');
                } else {
                    // Add
                    currentFavs.push(propertyId);
                    localStorage.setItem('househunt_favorites', JSON.stringify(currentFavs));
                    wishlistBtn.classList.add('active');
                }
            });
        }

        // --- Chat Now Logic ---
        const chatBtn = document.querySelector('.chat-btn');
        if (chatBtn && p.owner_id) {
            chatBtn.addEventListener('click', async () => {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (!currentUser || !currentUser.id) {
                    alert("Please log in to chat with the owner.");
                    window.location.href = '../login.html';
                    return;
                }
                
                // Don't chat with yourself
                if (currentUser.id === p.owner_id) {
                    alert("This is your own property!");
                    return;
                }
                
                // Change button text to show loading
                const originalText = chatBtn.innerHTML;
                chatBtn.innerHTML = '<i class="lucide-loader"></i> Starting...';
                
                try {
                    const chatRes = await fetch(`${BACKEND_URL}/api/chats`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            property_id: p.id,
                            buyer_id: currentUser.id,
                            seller_id: p.owner_id
                        })
                    });
                    
                    if (chatRes.ok) {
                        const chatData = await chatRes.json();
                        // Redirect to messages page and open this chat
                        window.location.href = `messages.html?chat_id=${chatData.id}`;
                    } else {
                        alert("Could not start chat. Please try again.");
                        chatBtn.innerHTML = originalText;
                    }
                } catch(e) {
                    console.error("Chat initiation error:", e);
                    alert("Network error starting chat.");
                    chatBtn.innerHTML = originalText;
                }
            });
        }

        if (window.lucide) window.lucide.createIcons();

    } catch (err) {
        console.error('Error loading property:', err);
    }

    function addStat(container, icon, text) {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.innerHTML = `<i data-lucide="${icon}"></i><span>${text}</span>`;
        container.appendChild(div);
    }

    function addAmenity(container, label) {
        const div = document.createElement('div');
        div.className = 'amenity-item';
        // Simple heuristic for icons
        let icon = 'check-circle';
        if (label.toLowerCase().includes('parking')) icon = 'parking-circle';
        if (label.toLowerCase().includes('power')) icon = 'zap';
        if (label.toLowerCase().includes('security')) icon = 'shield-check';
        if (label.toLowerCase().includes('water')) icon = 'droplet';
        
        div.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;
        container.appendChild(div);
    }
});
