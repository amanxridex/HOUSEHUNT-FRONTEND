document.addEventListener('DOMContentLoaded', () => {
    const PROPERTIES = window.propertyData;
    const propertyList = document.getElementById('propertyList');
    const resultsCount = document.getElementById('resultsCount');
    const searchInput = document.getElementById('propertySearch');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const openFilter = document.getElementById('openFilter');
    const closeFilter = document.getElementById('closeFilter');
    const filterSheet = document.getElementById('filterSheet');
    const sheetOverlay = document.getElementById('sheetOverlay');
    const applyFilters = document.getElementById('applyFilters');
    
    let currentMode = 'Buy'; 
    let activeFilters = {
        bhk: 'all',
        budget: 'all',
        verified: 'all'
    };

    const filterAndRender = () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        // Filter logic
        const filtered = PROPERTIES.filter(p => {
            const isIndependent = p.type === 'Independent House';
            const matchesMode = p.intent === currentMode;
            const matchesSearch = p.location.toLowerCase().includes(searchTerm);
            
            let matchesBHK = true;
            if (activeFilters.bhk !== 'all') {
                if (activeFilters.bhk === '4+ BHK') {
                    matchesBHK = parseInt(p.beds) >= 4;
                } else {
                    matchesBHK = p.beds === activeFilters.bhk;
                }
            }

            let matchesBudget = true;
            if (activeFilters.budget !== 'all') {
                const priceValue = parseFloat(p.price.replace(/[^\d.]/g, ''));
                const isCr = p.price.includes('Cr');
                if (activeFilters.budget === 'Under 1Cr') {
                    matchesBudget = !isCr || priceValue < 1;
                } else if (activeFilters.budget === '1Cr - 3Cr') {
                    matchesBudget = isCr && priceValue >= 1 && priceValue <= 3;
                } else if (activeFilters.budget === '3Cr+') {
                    matchesBudget = isCr && priceValue > 3;
                }
            }

            let matchesVerify = true;
            if (activeFilters.verified === 'Verified') {
                matchesVerify = p.tag === 'Verified';
            }

            return isIndependent && matchesMode && matchesSearch && matchesBHK && matchesBudget && matchesVerify;
        });

        // Dynamic Nearest (Top 3 of the current filtered list)
        renderNearest(filtered.slice(0, 3));

        resultsCount.innerText = `${filtered.length} Independent Houses Found`;
        
        // Bento Grid (Next 6 properties)
        renderBento(filtered.slice(3, 9));

        // Standard List (Remaining properties)
        renderStandard(filtered.slice(9));
    };

    const renderStandard = (properties) => {
        const standardList = document.getElementById('standardList');
        const standardSection = document.getElementById('standardSection');
        standardList.innerHTML = '';

        if (properties.length === 0) {
            standardSection.style.display = 'none';
            return;
        }
        standardSection.style.display = 'block';

        properties.forEach(p => {
            const card = document.createElement('div');
            card.className = 'standard-card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.title}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="standard-info">
                    <h3>${p.beds || ''} Independent House</h3>
                    <div class="price">${p.price}</div>
                    <div class="loc">${p.location}</div>
                </div>
                <i data-lucide="chevron-right" style="color: #ccc; width: 20px;"></i>
            `;
            card.onclick = () => {
                localStorage.setItem('selectedProperty', JSON.stringify(p));
                window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
            };
            standardList.appendChild(card);
        });
        if (window.lucide) window.lucide.createIcons();
    };

    const renderNearest = (properties) => {
        const nearestList = document.getElementById('nearestList');
        const nearestSection = document.getElementById('nearestSection');
        nearestList.innerHTML = '';
        
        if (properties.length === 0) {
            nearestSection.style.display = 'none';
            return;
        }
        nearestSection.style.display = 'block';

        properties.forEach(p => {
            const card = document.createElement('div');
            card.className = 'nearest-card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.title}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="nearest-info">
                    <div class="price">${p.price}</div>
                    <div style="font-size: 12px; color: #666;">${p.location}</div>
                </div>
            `;
            card.onclick = () => {
                localStorage.setItem('selectedProperty', JSON.stringify(p));
                window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
            };
            nearestList.appendChild(card);
        });
    };

    const renderBento = (properties) => {
        propertyList.innerHTML = '';
        if (properties.length === 0) {
            propertyList.innerHTML = '<p style="grid-column: span 2; text-align: center; padding: 40px; color: #666;">No properties found in this mode.</p>';
            return;
        }

        properties.forEach((p, index) => {
            const card = document.createElement('div');
            // Assign large/wide classes randomly or based on index for bento look
            let sizeClass = '';
            if (index % 5 === 0) sizeClass = 'large';
            else if (index % 5 === 3) sizeClass = 'wide';
            
            card.className = `bento-card ${sizeClass}`;
            card.innerHTML = `
                <img src="${p.image}" alt="${p.title}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="bento-overlay">
                    <div class="price">${p.price}</div>
                    <div class="loc">${p.location}</div>
                </div>
            `;
            card.onclick = () => {
                localStorage.setItem('selectedProperty', JSON.stringify(p));
                window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
            };
            propertyList.appendChild(card);
        });
    };

    // Mode Toggle Logic
    modeBtns.forEach(btn => {
        btn.onclick = () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            filterAndRender();
        };
    });

    // Bottom Sheet Logic
    const toggleSheet = (show) => {
        filterSheet.classList.toggle('open', show);
        sheetOverlay.style.display = show ? 'block' : 'none';
        setTimeout(() => sheetOverlay.style.opacity = show ? '1' : '0', 10);
    };

    openFilter.onclick = () => toggleSheet(true);
    closeFilter.onclick = () => toggleSheet(false);
    sheetOverlay.onclick = () => toggleSheet(false);

    // Option Selection
    const setupOptions = (containerId, filterKey) => {
        const options = document.querySelectorAll(`#${containerId} .option`);
        options.forEach(opt => {
            opt.onclick = () => {
                document.querySelectorAll(`#${containerId} .option`).forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                activeFilters[filterKey] = opt.dataset.value;
            };
        });
    };

    setupOptions('bhkOptions', 'bhk');
    setupOptions('budgetOptions', 'budget');
    setupOptions('verifyOptions', 'verified');

    applyFilters.onclick = () => {
        toggleSheet(false);
        filterAndRender();
    };

    searchInput.oninput = filterAndRender;
    filterAndRender();
});
