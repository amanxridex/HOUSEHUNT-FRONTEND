document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://househunt-backend-h19r.onrender.com';
    const featuredContainer = document.getElementById('featured-listings-container');
    
    let data = window.propertyData; // Fallback to mock data

    try {
        const response = await fetch(`${BACKEND_URL}/api/properties`);
        const liveData = await response.json();
        if (liveData && liveData.length > 0) {
            data = liveData.map(p => ({
                id: p.id,
                type: p.type,
                price: p.price,
                location: p.location,
                image: p.images ? p.images[0] : 'assets/househuntlogo.png',
                beds: p.beds || '',
                tag: p.status === 'approved' ? 'Verified' : 'New'
            }));
        }
    } catch (e) {
        console.warn("Backend unavailable, using mock data.", e);
    }

    // User Auth Check & Phone Enforcement
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const nameEl = document.getElementById('headerUserName');
        const picEl = document.getElementById('headerProfilePic');
        if (nameEl) nameEl.innerText = user.name;
        if (picEl && user.photo) picEl.src = user.photo;
        const profileLink = document.getElementById('userProfile');
        if (profileLink) profileLink.onclick = () => window.location.href = 'html/profile.html';

        // Check Phone in DB
        try {
            const res = await fetch(`${BACKEND_URL}/api/user/profile/${user.uid}`);
            const profile = await res.json();
            
            if (!profile || !profile.phone) {
                const modal = document.getElementById('phoneModal');
                if (modal) {
                    modal.style.display = 'flex';
                    const updateBtn = document.getElementById('updatePhoneBtn');
                    const phoneInput = document.getElementById('userPhoneInput');
                    
                    updateBtn.onclick = async () => {
                        const phone = phoneInput.value.trim();
                        if (phone.length < 10) return alert("Please enter a valid mobile number");
                        
                        updateBtn.disabled = true;
                        updateBtn.innerText = "Updating...";
                        
                        const patchRes = await fetch(`${BACKEND_URL}/api/user/profile/${user.uid}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone })
                        });
                        
                        if (patchRes.ok) {
                            modal.style.display = 'none';
                        } else {
                            alert("Failed to update. Try again.");
                            updateBtn.disabled = false;
                            updateBtn.innerText = "Update & Continue";
                        }
                    };
                }
            }
        } catch (e) {
            console.error("Profile check failed", e);
        }
    }

    if (!data) return;

    // Helper to render a section
    const renderSection = (containerId, items) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        items.forEach(prop => {
            const card = document.createElement('a');
            card.href = 'html/property-view.html';
            card.style.textDecoration = 'none';
            
            card.innerHTML = `
                <div class="property-card">
                    <img src="${prop.image}" alt="${prop.type}" class="property-img" onerror="this.src='assets/househuntlogo.png'; this.onerror=null;">
                    <div class="tag">${prop.tag}</div>
                    <div class="property-details">
                        <div class="prop-price">${prop.price}</div>
                        <div class="prop-title">${prop.beds ? prop.beds + ' ' : ''}${prop.type}</div>
                        <div class="prop-loc">${prop.location}</div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // Helper to render featured slider
    const renderFeaturedSlider = (items) => {
        const container = document.getElementById('featured-listings-container');
        const dotsContainer = document.getElementById('slider-dots');
        if (!container) return;

        items.forEach((prop, index) => {
            const slide = document.createElement('div');
            slide.className = 'hero-slide';
            slide.innerHTML = `
                <div class="hero-slide-content">
                    <img src="${prop.image}" alt="${prop.type}" onerror="this.src='assets/househuntlogo.png'; this.onerror=null;">
                    <div class="hero-overlay">
                        <div class="price">${prop.price}</div>
                        <h3>${prop.beds ? prop.beds + ' ' : ''}${prop.type}</h3>
                    </div>
                </div>
            `;
            container.appendChild(slide);

            // Add dots
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });

        // Auto slide logic
        let currentSlide = 0;
        const totalSlides = items.length;
        const dots = dotsContainer.querySelectorAll('.dot');

        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            container.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update dots
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentSlide);
            });
        }, 3000);
    };

    // Populate Featured
    renderFeaturedSlider(data.slice(0, 5));

    // Populate Near You (Next 5)
    renderSection('near-you-container', data.slice(5, 10));

    // Populate Top Listings (Next 5)
    renderSection('top-listings-container', data.slice(10, 15));

    // Populate Plots (Only plots)
    const plots = data.filter(p => p.type.toLowerCase().includes('plot')).slice(0, 5);
    renderSection('plots-container', plots);

    // Make categories clickable
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.querySelector('p').textContent;
            window.location.href = `html/explore.html?type=${type}`;
        });
    });

    // Make tabs clickable
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const intent = tab.textContent.includes('Rent') ? 'Rent' : 'Buy';
            window.location.href = `html/explore.html?intent=${intent}`;
        });
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Filter Bottom Sheet Logic
    const filterBtn = document.querySelector('.filter-btn');
    const filterSheet = document.getElementById('filterSheet');
    const filterOverlay = document.getElementById('filterOverlay');
    const closeSheet = document.getElementById('closeSheet');
    const applyFilter = document.getElementById('applyFilter');

    const toggleSheet = () => {
        filterSheet.classList.toggle('active');
        filterOverlay.classList.toggle('active');
    };

    if (filterBtn) filterBtn.addEventListener('click', toggleSheet);
    if (closeSheet) closeSheet.addEventListener('click', toggleSheet);
    if (filterOverlay) filterOverlay.addEventListener('click', toggleSheet);
    if (applyFilter) applyFilter.addEventListener('click', toggleSheet);

    // Pill Toggle Logic
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pill.parentElement.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });
});
