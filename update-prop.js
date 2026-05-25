const fs = require('fs');

// 1. Modify HTML
let html = fs.readFileSync('html/property-view.html', 'utf8');

const loadingHtml = `
    <div id="propertyLoadingScreen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #fff; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
        <div class="loader" style="width: 48px; height: 48px; border: 5px solid #eee; border-bottom-color: var(--primary-color); border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite;"></div>
        <h2 style="margin-top: 20px; color: var(--text-color); font-size: 1.2rem;">Fetching property details...</h2>
        <p id="loadingQuote" style="margin-top: 10px; color: #64748b; font-style: italic; font-size: 0.9rem; max-width: 300px;"></p>
        <style>
            @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </div>
    <div class="app-container" style="display: none;" id="mainContent">
`;

html = html.replace('<div class="app-container">', loadingHtml);

const detailsHtml = `
                <!-- Description -->
                <div class="description">
                    <h3>About this property</h3>
                    <p id="propDesc">Loading description...</p>
                </div>

                <div class="divider"></div>

                <!-- All Property Details -->
                <div class="all-details-section">
                    <h3>Property Details</h3>
                    <div class="details-grid" id="fullDetailsGrid">
                        <!-- Populated by JS -->
                    </div>
                </div>

                <style>
                    .all-details-section { padding: 0 0 20px 0; }
                    .all-details-section h3 { margin-bottom: 15px; font-size: 1.1rem; color: var(--text-color); font-weight: 600; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .detail-row { display: flex; flex-direction: column; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .detail-label { font-size: 0.75rem; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                    .detail-value { font-size: 0.95rem; color: var(--text-color); font-weight: 500; word-break: break-word; }
                </style>
`;

html = html.replace(/<!-- Description -->[\s\S]*?<\/div>/, detailsHtml);
fs.writeFileSync('html/property-view.html', html);

// 2. Modify JS
let js = fs.readFileSync('js/property-view.js', 'utf8');

const jsUpdates = `
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
        const response = await fetch(\`\${BACKEND_URL}/api/properties\`);
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
        document.querySelector('.price').textContent = \`₹ \${p.price}\`;
        document.querySelector('.type-tag').textContent = \`For \${p.intent}\`;
        document.querySelector('.title').textContent = p.title || \`\${p.property_type} in \${p.city}\`;
        document.querySelector('.location').innerHTML = \`<i data-lucide="map-pin"></i> \${p.location_text || p.location || p.city}\`;
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
                row.innerHTML = \`<span class="detail-label">\${field.label}</span><span class="detail-value">\${displayVal}</span>\`;
                fullDetailsGrid.appendChild(row);
            });
        }
`;

js = js.replace(/try \{[\s\S]*?statsGrid\.innerHTML = '';/, jsUpdates.trim() + '\n\n        const details = p.details || {};');
fs.writeFileSync('js/property-view.js', js);
