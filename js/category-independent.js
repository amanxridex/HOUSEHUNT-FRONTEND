document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://backend.househunt.live';
    let PROPERTIES = [];

    const filterContent = document.getElementById('filterContent');
    const quickChips = document.getElementById('quickChips');
    const propertyList = document.getElementById('propertyList');
    const resultsCount = document.getElementById('resultsCount');
    const searchInput = document.getElementById('propertySearch');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const openFilter = document.getElementById('openFilter');
    const closeFilter = document.getElementById('closeFilter');
    const filterSheet = document.getElementById('filterSheet');
    const sheetOverlay = document.getElementById('sheetOverlay');
    const applyFilters = document.getElementById('applyFilters');
    
    const urlParams = new URLSearchParams(window.location.search);
    let currentMode = urlParams.get('mode') === 'Rent' ? 'Rent' : 'Buy';

    // Sync UI buttons with currentMode
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
    });

    function formatPrice(p) {
        if (typeof p.price !== 'number') return p.price || 'Price on Request';
        if (p.intent === 'Rent') return `₹ ${p.price.toLocaleString()}/mo`;
        const inCr = p.price / 10000000;
        if (inCr >= 1) return `₹ ${inCr.toFixed(2)} Cr`;
        return `₹ ${(p.price / 100000).toFixed(2)} L`;
    }

    async function loadProperties() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/properties`);
            const data = await response.json();
            if (data && data.length > 0) {
                PROPERTIES = data.map(p => ({ 
                    ...p, 
                    price: formatPrice(p),
                    location_text: p.city || (p.location_text ? p.location_text.split(',').slice(-2).join(',').trim() : (p.location || 'Location Not Specified'))
                }));
            } else {
                PROPERTIES = window.propertyData || [];
            }
            filterAndRender();
        } catch (e) {
            console.warn("Backend unavailable, using mock data.", e);
            PROPERTIES = window.propertyData || [];
            filterAndRender();
        }
    }

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
    `;

    const QUICK_CHIPS_RENT = ['Ready to move', 'Fully furnished', 'Near metro', 'No Brokerage'];
    const QUICK_CHIPS_BUY = ['Best deal 🔥', 'Newly launched', 'Premium', 'High ROI'];

    const renderFilterSheet = () => {
        filterContent.innerHTML = currentMode === 'Buy' ? BUY_FILTERS : RENT_FILTERS;
        quickChips.innerHTML = (currentMode === 'Buy' ? QUICK_CHIPS_BUY : QUICK_CHIPS_RENT)
            .map(c => `<div class="chip">${c}</div>`).join('');
        
        if (window.lucide) window.lucide.createIcons();
    };

    const filterAndRender = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = PROPERTIES.filter(p => {
            const isIndependent = p.property_type === 'Independent House';
            const matchesMode = p.intent === currentMode;
            const loc = p.location_text || p.location || '';
            const matchesSearch = loc.toLowerCase().includes(searchTerm);
            return isIndependent && matchesMode && matchesSearch;
        });

        renderNearest(filtered.slice(0, 3));
        resultsCount.innerText = `${filtered.length} Independent Houses Found`;
        renderBento(filtered.slice(3, 9));
        renderStandard(filtered.slice(9));
    };

    const renderNearest = (props) => {
        const nearestList = document.getElementById('nearestList');
        const nearestSection = document.getElementById('nearestSection');
        if (!nearestList) return;
        nearestList.innerHTML = '';
        if (props.length === 0) { nearestSection.style.display = 'none'; return; }
        nearestSection.style.display = 'block';
        props.forEach(p => {
            const card = document.createElement('div');
            card.className = 'nearest-card';
            card.innerHTML = `
                <img src="${(p.images && p.images[0]) || p.image || '../assets/mainappicon.png'}" onerror="this.src='../assets/mainappicon.png'">
                <div class="nearest-info">
                    <div class="price">${p.price}</div>
                    <div style="font-size: 12px; color: #666;">${p.location_text || p.location}</div>
                </div>
            `;
            card.onclick = () => viewDetails(p.id);
            nearestList.appendChild(card);
        });
    };

    const renderBento = (props) => {
        if (!propertyList) return;
        propertyList.innerHTML = '';
        props.forEach((p, i) => {
            const card = document.createElement('div');
            let size = i % 5 === 0 ? 'large' : (i % 5 === 3 ? 'wide' : '');
            card.className = `bento-card ${size}`;
            card.innerHTML = `
                <img src="${(p.images && p.images[0]) || p.image || '../assets/mainappicon.png'}" onerror="this.src='../assets/mainappicon.png'">
                <div class="bento-overlay">
                    <div class="price">${p.price}</div>
                    <div class="loc">${p.location_text || p.location}</div>
                </div>
            `;
            card.onclick = () => viewDetails(p.id);
            propertyList.appendChild(card);
        });
    };

    const renderStandard = (props) => {
        const standardList = document.getElementById('standardList');
        const standardSection = document.getElementById('standardSection');
        if (!standardList) return;
        standardList.innerHTML = '';
        if (props.length === 0) { standardSection.style.display = 'none'; return; }
        standardSection.style.display = 'block';
        props.forEach(p => {
            const card = document.createElement('div');
            card.className = 'standard-card';
            card.innerHTML = `
                <img src="${(p.images && p.images[0]) || p.image || '../assets/mainappicon.png'}" onerror="this.src='../assets/mainappicon.png'">
                <div class="standard-info">
                    <h3>${p.details?.beds || ''} House</h3>
                    <div class="price">${p.price}</div>
                    <div class="loc">${p.location_text || p.location}</div>
                </div>
                <i data-lucide="chevron-right" style="color:#ccc;width:20px;"></i>
            `;
            card.onclick = () => viewDetails(p.id);
            standardList.appendChild(card);
        });
        if (window.lucide) window.lucide.createIcons();
    };

    window.viewDetails = (id) => {
        window.location.href = `property-view.html?id=${id}`;
    };

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

    if (openFilter) openFilter.onclick = () => toggleSheet(true);
    if (closeFilter) closeFilter.onclick = () => toggleSheet(false);
    if (sheetOverlay) sheetOverlay.onclick = () => toggleSheet(false);
    if (applyFilters) applyFilters.onclick = () => { toggleSheet(false); filterAndRender(); };
    if (searchInput) searchInput.oninput = filterAndRender;

    renderFilterSheet();
    loadProperties();
});
