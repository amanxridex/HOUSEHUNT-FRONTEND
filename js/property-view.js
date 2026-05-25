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
        if (mainContent) mainContent.style.display = 'block';

        // --- Basic Info ---
        document.querySelector('.price').textContent = `₹ ${p.price}`;
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
            
            // Define all possible fields we want to show, if missing we show N/A
            const allPossibleFields = [
                { id: 'property_type', label: 'Property Type', val: p.property_type },
                { id: 'intent', label: 'Intent', val: p.intent },
                { id: 'furnishing', label: 'Furnishing', val: details.furnishing },
                { id: 'bedrooms', label: 'Bedrooms', val: details.bedrooms || details.beds },
                { id: 'bathrooms', label: 'Bathrooms', val: details.bathrooms || details.bath },
                { id: 'balconies', label: 'Balconies', val: details.balconies },
                { id: 'floorNumber', label: 'Floor Number', val: details.floorNumber || details.floor },
                { id: 'totalFloors', label: 'Total Floors', val: details.totalFloors },
                { id: 'carpetArea', label: 'Carpet Area (sq.ft)', val: details.carpetArea || details.area },
                { id: 'builtUpArea', label: 'Built Up Area (sq.ft)', val: details.builtUpArea },
                { id: 'plotArea', label: 'Plot Area (sq.yd)', val: details.plotArea || details.plot_area },
                { id: 'length', label: 'Length (ft)', val: details.length },
                { id: 'width', label: 'Width (ft)', val: details.width },
                { id: 'boundaryWall', label: 'Boundary Wall', val: details.boundaryWall },
                { id: 'facing', label: 'Facing', val: details.facing },
                { id: 'possessionStatus', label: 'Possession Status', val: details.possessionStatus },
                { id: 'washrooms', label: 'Washrooms', val: details.washrooms },
                { id: 'pantry', label: 'Pantry', val: details.pantry }
            ];

            allPossibleFields.forEach(field => {
                // If it's a plot, skip apartment stuff. But user said "show all of them with details if not avaulble then show N/A"
                // To avoid showing 20 fields of N/A that don't apply to this property type, we should ideally filter, 
                // but user explicitly said: "jitni fields hai show all of them with details if not avaulble then show N/A"
                
                let displayVal = field.val;
                if (displayVal === undefined || displayVal === null || displayVal === '') {
                    displayVal = 'N/A';
                }
                
                // Format boolean values
                if (displayVal === true || displayVal === 'true') displayVal = 'Yes';
                if (displayVal === false || displayVal === 'false') displayVal = 'No';

                const row = document.createElement('div');
                row.className = 'detail-row';
                row.innerHTML = `<span class="detail-label">${field.label}</span><span class="detail-value">${displayVal}</span>`;
                fullDetailsGrid.appendChild(row);
            });
        }

        const details = p.details || {};
        
        // Define mappings for important fields
        const statMappings = [
            { key: 'area', label: 'Sqft', icon: 'maximize' },
            { key: 'bhk', label: '', icon: 'bed' },
            { key: 'beds', label: 'Beds', icon: 'bed' },
            { key: 'bath', label: 'Bath', icon: 'bath' },
            { key: 'floor', label: 'Floor', icon: 'layers', prefix: 'Floor ' },
            { key: 'facing', label: 'Facing', icon: 'navigation' },
            { key: 'furnishing', label: '', icon: 'armchair' },
            { key: 'plot_area', label: 'Plot Area', icon: 'map' }
        ];

        statMappings.forEach(m => {
            if (details[m.key]) {
                let value = details[m.key];
                if (m.prefix) value = m.prefix + value;
                if (m.label) value = value + ' ' + m.label;
                addStat(statsGrid, m.icon, value);
            }
        });

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
        if (p.owner_name) {
            document.querySelector('.seller-info h4').textContent = p.owner_name;
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
