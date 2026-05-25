document.addEventListener('DOMContentLoaded', async () => {
    // Attempt to track visitor silently
    fetch('https://backend.househunt.live/api/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_url: window.location.pathname })
    }).catch(e => console.error('Tracker error:', e));

    // Hide Splash Screen
    const splash = document.getElementById('appSplashScreen');
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            splash.style.visibility = 'hidden';
            setTimeout(() => splash.remove(), 600);
        }, 800); // Small delay to ensure skeletons are ready
    }

    const BACKEND_URL = 'https://backend.househunt.live';
    const featuredContainer = document.getElementById('featured-listings-container');
    
    let data = window.propertyData; // Fallback to mock data

    // Show Skeletons
    if (window.showSkeletons) {
        window.showSkeletons('featured-listings-container', 1);
        window.showSkeletons('near-you-container', 3);
        window.showSkeletons('top-listings-container', 3);
        window.showSkeletons('plots-container', 3);
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/properties`);
        const liveData = await response.json();
        
        // Clear Skeletons
        document.getElementById('featured-listings-container').innerHTML = '';
        document.getElementById('near-you-container').innerHTML = '';
        document.getElementById('top-listings-container').innerHTML = '';
        document.getElementById('plots-container').innerHTML = '';

        if (liveData && liveData.length > 0) {
            data = liveData.map(p => ({
                id: p.id,
                type: p.type,
                price: p.price,
                location: p.location,
                image: p.images ? p.images[0] : 'assets/mainappicon.png',
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
        const locEl = document.getElementById('headerUserLocation');

        if (nameEl) {
            nameEl.innerText = user.name;
            nameEl.classList.remove('skeleton');
            nameEl.style.height = 'auto';
            nameEl.style.width = 'auto';
        }
        if (picEl && user.photo) {
            picEl.src = user.photo;
            picEl.classList.remove('skeleton');
        }
        if (locEl) {
            // Geolocation Logic
            const updateLocationUI = (city) => {
                locEl.innerHTML = `<i data-lucide="map-pin" style="width: 12px; height: 12px; margin-right: 4px; vertical-align: middle;"></i>${city}`;
                locEl.classList.remove('skeleton');
                locEl.style.height = 'auto';
                locEl.style.width = 'auto';
                if (window.lucide) window.lucide.createIcons();
            };

            const cachedCity = localStorage.getItem('userCity');
            if (cachedCity) updateLocationUI(cachedCity);

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const geoData = await geoRes.json();
                        const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state || "India";
                        
                        localStorage.setItem('userCity', city);
                        updateLocationUI(city);
                    } catch (err) {
                        console.error("Geocoding failed", err);
                        if (!cachedCity) updateLocationUI("India");
                    }
                }, (err) => {
                    console.warn("Location denied/failed", err);
                    if (!cachedCity) updateLocationUI("India");
                });
            } else {
                if (!cachedCity) updateLocationUI("India");
            }
        }
        const profileLink = document.getElementById('userProfile');
        if (profileLink) profileLink.onclick = () => window.location.href = 'html/profile.html';

        // Sync User to Supabase (Auto-Register)
        try {
            await fetch(`${BACKEND_URL}/api/user/profile/${user.uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: user.name,
                    email: user.email
                })
            });
        } catch (e) { console.error("Sync error", e); }

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
                            body: JSON.stringify({ 
                                phone,
                                name: user.name,
                                email: user.email
                            })
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

    let allData = [];
    let currentIntent = 'Rent'; // Default

    // Helper to render a section
    const renderSection = (containerId, items) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        items.forEach(prop => {
            const card = document.createElement('a');
            card.href = `html/property-view.html?id=${prop.id}`;
            card.style.textDecoration = 'none';
            
            card.innerHTML = `
                <div class="property-card">
                    <img src="${prop.image || prop.images?.[0]}" alt="${prop.type}" class="property-img" onerror="this.src='assets/mainappicon.png'; this.onerror=null;">
                    <div class="tag">${prop.tag || prop.intent}</div>
                    <div class="property-details">
                        <div class="prop-price">₹${prop.price}</div>
                        <div class="prop-title">${prop.beds ? prop.beds + ' BHK ' : ''}${prop.type}</div>
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
        container.innerHTML = '';
        dotsContainer.innerHTML = '';

        items.forEach((prop, index) => {
            const slide = document.createElement('div');
            slide.className = 'hero-slide';
            slide.onclick = () => window.location.href = `html/property-view.html?id=${prop.id}`;
            slide.innerHTML = `
                <div class="hero-slide-content">
                    <img src="${prop.image || prop.images?.[0]}" alt="${prop.type}" onerror="this.src='assets/mainappicon.png'; this.onerror=null;">
                    <div class="hero-overlay">
                        <div class="price">₹${prop.price}</div>
                        <h3>${prop.beds ? prop.beds + ' BHK ' : ''}${prop.type}</h3>
                    </div>
                </div>
            `;
            container.appendChild(slide);

            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });

        let currentSlide = 0;
        const totalSlides = items.length;
        const dots = dotsContainer.querySelectorAll('.dot');
        if (window.heroInterval) clearInterval(window.heroInterval);
        
        window.heroInterval = setInterval(() => {
            if (totalSlides === 0) return;
            currentSlide = (currentSlide + 1) % totalSlides;
            container.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentSlide));
        }, 3000);
    };

    const renderAllSections = (filteredData) => {
        // Populate Featured
        renderFeaturedSlider(filteredData.slice(0, 5));

        // Populate Near You (Next 5)
        renderSection('near-you-container', filteredData.slice(5, 10));

        // Populate Top Listings (Next 5)
        renderSection('top-listings-container', filteredData.slice(10, 15));

        // Populate Plots (Only plots)
        const plots = filteredData.filter(p => p.type.toLowerCase().includes('plot')).slice(0, 5);
        renderSection('plots-container', plots);
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/properties`);
        const liveData = await response.json();
        
        if (liveData && liveData.length > 0) {
            allData = liveData;
        } else {
            allData = window.propertyData;
        }
        
        renderAllSections(allData.filter(p => p.intent === currentIntent));
    } catch (e) {
        console.error("Fetch error", e);
        allData = window.propertyData || [];
        renderAllSections(allData.filter(p => p.intent === currentIntent));
    }

    // Make categories clickable
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.querySelector('p').textContent.toLowerCase();
            let page = 'explore.html';
            if (type.includes('independent')) page = 'category-independent.html';
            else if (type.includes('commercial')) page = 'category-commercial.html';
            else if (type.includes('apartment')) page = 'category-apartments.html';
            else if (type.includes('villa')) page = 'category-villas.html';
            else if (type.includes('plot')) page = 'category-plots.html';
            window.location.href = `html/${page}?mode=${currentIntent}`;
        });
    });

    // --- RENT / SALE TOGGLE LOGIC ---
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update UI
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Set Intent
            currentIntent = tab.textContent.includes('Rent') ? 'Rent' : 'Buy';
            
            // Re-render
            const filtered = allData.filter(p => p.intent === currentIntent);
            renderAllSections(filtered);
        });
    });

    // --- CITY SWITCHER LOGIC ---
    const popularCities = [
        { name: "Delhi", icon: "🏙️" },
        { name: "Mumbai", icon: "🏢" },
        { name: "Noida", icon: "🏡" },
        { name: "Bangalore", icon: "💻" },
        { name: "Lucknow", icon: "🏛️" },
        { name: "Pune", icon: "🎓" },
        { name: "Gurgaon", icon: "🏢" },
        { name: "Hyderabad", icon: "🕌" },
        { name: "Kolkata", icon: "🎨" }
    ];

    const citySheet = document.getElementById('citySheet');
    const cityOverlay = document.getElementById('cityOverlay');
    const cityGrid = document.getElementById('popularCitiesGrid');

    const toggleCitySheet = () => {
        citySheet.classList.toggle('active');
        cityOverlay.classList.toggle('active');
    };

    // Make Location Header Clickable
    const locTrigger = document.getElementById('headerUserLocation');
    if (locTrigger) {
        locTrigger.style.cursor = 'pointer';
        locTrigger.onclick = (e) => {
            e.stopPropagation();
            toggleCitySheet();
        };
    }

    if (document.getElementById('closeCitySheet')) document.getElementById('closeCitySheet').onclick = toggleCitySheet;
    if (cityOverlay) cityOverlay.onclick = toggleCitySheet;

    // Populate Popular Cities
    const renderCities = (filter = "") => {
        if (!cityGrid) return;
        cityGrid.innerHTML = "";
        popularCities.filter(c => c.name.toLowerCase().includes(filter.toLowerCase())).forEach(city => {
            const div = document.createElement('div');
            div.className = `city-option ${localStorage.getItem('userCity') === city.name ? 'active' : ''}`;
            div.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 5px;">${city.icon}</div>
                <span>${city.name}</span>
            `;
            div.onclick = () => {
                localStorage.setItem('userCity', city.name);
                // Update header immediately
                const locEl = document.getElementById('headerUserLocation');
                if (locEl) {
                    locEl.innerHTML = `<i data-lucide="map-pin" style="width: 12px; height: 12px; margin-right: 4px; vertical-align: middle;"></i>${city.name}`;
                    if (window.lucide) window.lucide.createIcons();
                }
                toggleCitySheet();
                // Reload data for the new city
                loadProperties();
            };
            cityGrid.appendChild(div);
        });
    };

    renderCities();

    // Search Logic
    const citySearch = document.getElementById('citySearchInput');
    if (citySearch) {
        citySearch.oninput = (e) => renderCities(e.target.value);
    }

    // Auto-detect button in sheet
    const autoDetectBtn = document.getElementById('autoDetectCity');
    if (autoDetectBtn) {
        autoDetectBtn.onclick = () => {
            localStorage.removeItem('userCity'); // Force re-detection
            location.reload(); 
        };
    }

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
