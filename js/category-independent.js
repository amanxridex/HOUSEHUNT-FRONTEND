const PROPERTIES = window.propertyData;
const filterContent = document.getElementById('filterContent');
const quickChips = document.getElementById('quickChips');

const RENT_FILTERS = `
    <div class="filter-group">
        <div class="filter-section-title">💰 Budget & Rent</div>
        <label class="filter-label">Monthly Rent</label>
        <div class="filter-options grid" id="rentBudget">
            <div class="option selected" data-value="all">All</div>
            <div class="option" data-value="Under 20k">Under 20k</div>
            <div class="option" data-value="20k - 50k">20k - 50k</div>
            <div class="option" data-value="50k+">50k+</div>
        </div>
    </div>

    <div class="filter-group">
        <div class="filter-section-title">🏡 Property Basics</div>
        <label class="filter-label">BHK</label>
        <div class="filter-options" id="bhkFilter">
            <div class="option selected" data-value="all">All</div>
            <div class="option" data-value="1 BHK">1 BHK</div>
            <div class="option" data-value="2 BHK">2 BHK</div>
            <div class="option" data-value="3 BHK">3 BHK</div>
            <div class="option" data-value="4+ BHK">4+ BHK</div>
        </div>
        <label class="filter-label" style="margin-top: 15px;">Furnishing</label>
        <div class="filter-options" id="furnishFilter">
            <div class="option selected" data-value="all">Any</div>
            <div class="option" data-value="Unfurnished">Unfurnished</div>
            <div class="option" data-value="Semi">Semi</div>
            <div class="option" data-value="Fully">Fully</div>
        </div>
    </div>

    <div class="filter-group">
        <div class="filter-section-title">👥 Tenant & Convenience</div>
        <label class="filter-label">Tenant Preference</label>
        <div class="filter-options" id="tenantFilter">
            <div class="option selected" data-value="all">Any</div>
            <div class="option" data-value="Family">Family</div>
            <div class="option" data-value="Bachelor">Bachelor</div>
        </div>
        <label class="filter-label" style="margin-top: 15px;">Convenience</label>
        <div class="filter-options" id="convFilter">
            <div class="option" data-value="Parking">Parking</div>
            <div class="option" data-value="Power Backup">Power Backup</div>
            <div class="option" data-value="Lift">Lift</div>
        </div>
    </div>
`;

const BUY_FILTERS = `
    <div class="filter-group">
        <div class="filter-section-title">💰 Pricing & Deals</div>
        <label class="filter-label">Price Range</label>
        <div class="filter-options grid" id="buyBudget">
            <div class="option selected" data-value="all">Any Price</div>
            <div class="option" data-value="Under 50L">Under 50L</div>
            <div class="option" data-value="50L - 1Cr">50L - 1Cr</div>
            <div class="option" data-value="1Cr+">1Cr+</div>
        </div>
    </div>

    <div class="filter-group">
        <div class="filter-section-title">🏡 Property Basics</div>
        <label class="filter-label">BHK</label>
        <div class="filter-options" id="bhkFilter">
            <div class="option selected" data-value="all">All</div>
            <div class="option" data-value="1 BHK">1 BHK</div>
            <div class="option" data-value="2 BHK">2 BHK</div>
            <div class="option" data-value="3 BHK">3 BHK</div>
            <div class="option" data-value="4+ BHK">4+ BHK</div>
        </div>
    </div>

    <div class="filter-group">
        <div class="filter-section-title">📑 Legal & Ownership</div>
        <div class="filter-options" id="legalFilter">
            <div class="option" data-value="RERA Approved">RERA Approved</div>
            <div class="option" data-value="Loan Available">Loan Available</div>
            <div class="option" data-value="Freehold">Freehold</div>
        </div>
    </div>

    <div class="filter-group">
        <div class="filter-section-title">📈 Investment & Status</div>
        <div class="filter-options grid" id="statusFilter">
            <div class="option selected" data-value="all">Any Status</div>
            <div class="option" data-value="Ready to move">Ready Move</div>
            <div class="option" data-value="Under construction">Under Const.</div>
        </div>
    </div>
`;

const QUICK_CHIPS_RENT = ['Ready to move', 'Fully furnished', 'Near metro', 'No Brokerage'];
const QUICK_CHIPS_BUY = ['Best deal 🔥', 'Newly launched', 'Premium', 'High ROI'];

document.addEventListener('DOMContentLoaded', () => {
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
        furnish: 'all',
        legal: [],
        status: 'all'
    };

    const renderFilterSheet = () => {
        filterContent.innerHTML = currentMode === 'Buy' ? BUY_FILTERS : RENT_FILTERS;
        quickChips.innerHTML = (currentMode === 'Buy' ? QUICK_CHIPS_BUY : QUICK_CHIPS_RENT)
            .map(c => `<div class="chip">${c}</div>`).join('');
        
        // Re-setup option clicks for dynamic content
        setupOptions('bhkFilter', 'bhk');
        setupOptions(currentMode === 'Buy' ? 'buyBudget' : 'rentBudget', 'budget');
        setupOptions('furnishFilter', 'furnish');
        setupOptions('statusFilter', 'status');
        
        // Multi-select for legal/convenience
        const multiOptions = document.querySelectorAll('#legalFilter .option, #convFilter .option');
        multiOptions.forEach(opt => {
            opt.onclick = () => {
                opt.classList.toggle('selected');
            };
        });

        if (window.lucide) window.lucide.createIcons();
    };

    const setupOptions = (containerId, filterKey) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const options = container.querySelectorAll('.option');
        options.forEach(opt => {
            opt.onclick = () => {
                container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                activeFilters[filterKey] = opt.dataset.value;
            };
        });
    };

    const filterAndRender = () => {
        const searchTerm = searchInput.value.toLowerCase();
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
                const priceStr = p.price.replace(/[^\d.]/g, '');
                const val = parseFloat(priceStr);
                const isCr = p.price.includes('Cr');
                const isK = p.price.includes(','); // Rent values like 20,000

                if (currentMode === 'Buy') {
                    if (activeFilters.budget === 'Under 50L') matchesBudget = !isCr && val < 50;
                    else if (activeFilters.budget === '50L - 1Cr') matchesBudget = !isCr && val >= 50;
                    else if (activeFilters.budget === '1Cr+') matchesBudget = isCr;
                } else {
                    // Rent
                    const rentVal = parseInt(p.price.replace(/[^\d]/g, ''));
                    if (activeFilters.budget === 'Under 20k') matchesBudget = rentVal < 20000;
                    else if (activeFilters.budget === '20k - 50k') matchesBudget = rentVal >= 20000 && rentVal <= 50000;
                    else if (activeFilters.budget === '50k+') matchesBudget = rentVal > 50000;
                }
            }

            return isIndependent && matchesMode && matchesSearch && matchesBHK && matchesBudget;
        });

        renderNearest(filtered.slice(0, 3));
        resultsCount.innerText = `${filtered.length} Independent Houses Found`;
        renderBento(filtered.slice(3, 9));
        renderStandard(filtered.slice(9));
    };

    // UI Rendering helpers
    const renderNearest = (props) => {
        const nearestList = document.getElementById('nearestList');
        const nearestSection = document.getElementById('nearestSection');
        nearestList.innerHTML = '';
        if (props.length === 0) { nearestSection.style.display = 'none'; return; }
        nearestSection.style.display = 'block';
        props.forEach(p => {
            const card = document.createElement('div');
            card.className = 'nearest-card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.type}" onerror="this.src='../assets/househuntlogo.png'">
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

    const renderBento = (props) => {
        const bentoGrid = document.getElementById('propertyList');
        bentoGrid.innerHTML = '';
        props.forEach((p, i) => {
            const card = document.createElement('div');
            let size = i % 5 === 0 ? 'large' : (i % 5 === 3 ? 'wide' : '');
            card.className = `bento-card ${size}`;
            card.innerHTML = `<img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'"><div class="bento-overlay"><div class="price">${p.price}</div><div class="loc">${p.location}</div></div>`;
            card.onclick = () => {
                localStorage.setItem('selectedProperty', JSON.stringify(p));
                window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
            };
            bentoGrid.appendChild(card);
        });
    };

    const renderStandard = (props) => {
        const standardList = document.getElementById('standardList');
        const standardSection = document.getElementById('standardSection');
        standardList.innerHTML = '';
        if (props.length === 0) { standardSection.style.display = 'none'; return; }
        standardSection.style.display = 'block';
        props.forEach(p => {
            const card = document.createElement('div');
            card.className = 'standard-card';
            card.innerHTML = `<img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'"><div class="standard-info"><h3>${p.beds || ''} House</h3><div class="price">${p.price}</div><div class="loc">${p.location}</div></div><i data-lucide="chevron-right" style="color:#ccc;width:20px;"></i>`;
            card.onclick = () => {
                localStorage.setItem('selectedProperty', JSON.stringify(p));
                window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
            };
            standardList.appendChild(card);
        });
        if (window.lucide) window.lucide.createIcons();
    };

    // Event Listeners
    modeBtns.forEach(btn => {
        btn.onclick = () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            renderFilterSheet();
            filterAndRender();
        };
    });

    const toggleSheet = (show) => {
        filterSheet.classList.toggle('open', show);
        sheetOverlay.style.display = show ? 'block' : 'none';
        setTimeout(() => sheetOverlay.style.opacity = show ? '1' : '0', 10);
    };

    openFilter.onclick = () => toggleSheet(true);
    closeFilter.onclick = () => toggleSheet(false);
    sheetOverlay.onclick = () => toggleSheet(false);

    applyFilters.onclick = () => { toggleSheet(false); filterAndRender(); };
    searchInput.oninput = filterAndRender;

    // Initial Load
    renderFilterSheet();
    filterAndRender();
});
