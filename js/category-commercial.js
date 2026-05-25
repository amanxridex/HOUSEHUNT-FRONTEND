document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://backend.househunt.live';
    let PROPERTIES = [];

    const filterContent = document.getElementById('filterContent');
    const quickChips = document.getElementById('quickChips');
    const mostViewedList = document.getElementById('mostViewedList');
    const bentoGrid = document.getElementById('bentoGrid');
    const standardList = document.getElementById('standardList');
    const resultsCount = document.getElementById('resultsCount');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const filterSheet = document.getElementById('filterSheet');
    const sheetOverlay = document.getElementById('sheetOverlay');
    
    const urlParams = new URLSearchParams(window.location.search);
    let currentMode = urlParams.get('mode') === 'Rent' ? 'Rent' : 'Buy';

    // Sync UI buttons with currentMode
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
    });

    async function loadProperties() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/properties`);
            const data = await response.json();
            PROPERTIES = data.length > 0 ? data : (window.propertyData || []);
            renderData();
        } catch (e) {
            console.warn("Backend unavailable, using mock data.", e);
            PROPERTIES = window.propertyData || [];
            renderData();
        }
    }

    const RENT_FILTERS = `
        <div class="filter-group">
            <div class="filter-title">💰 Budget (Monthly Rent)</div>
            <div class="option-grid">
                <div class="option selected" data-value="all">Any</div>
                <div class="option" data-value="Under 50k">Under 50k</div>
                <div class="option" data-value="50k-1L">50k - 1L</div>
                <div class="option" data-value="1L+">1L+</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">🏢 Property Type</div>
            <div class="option-grid">
                <div class="option" data-value="Office">Office</div>
                <div class="option" data-value="Shop">Shop</div>
                <div class="option" data-value="Showroom">Showroom</div>
                <div class="option" data-value="Warehouse">Warehouse</div>
                <div class="option" data-value="Co-working">Co-working</div>
            </div>
        </div>
    `;

    const BUY_FILTERS = `
        <div class="filter-group">
            <div class="filter-title">💰 Pricing (Total)</div>
            <div class="option-grid">
                <div class="option selected" data-value="all">Any</div>
                <div class="option" data-value="Under 1Cr">Under 1Cr</div>
                <div class="option" data-value="1Cr-5Cr">1Cr - 5Cr</div>
                <div class="option" data-value="5Cr+">5Cr+</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">📈 Investment Filters</div>
            <div class="option-grid">
                <div class="option" data-value="High ROI">High ROI potential</div>
                <div class="option" data-value="Already Rented">Pre-leased Property</div>
                <div class="option" data-value="RERA Approved">RERA Approved</div>
                <div class="option" data-value="Title Clear">Title Clear</div>
            </div>
        </div>
    `;

    const CHIPS_RENT = ['High footfall 🔥', 'Main road', 'Fully furnished', 'Ready to move', 'Prime location'];
    const CHIPS_BUY = ['High ROI 🔥', 'Pre-leased 💰', 'Prime zone', 'Corner unit', 'Near metro'];

    const renderData = () => {
        const filtered = PROPERTIES.filter(p => p.property_type === 'Commercial' && p.intent === currentMode);
        resultsCount.innerText = `Showing ${filtered.length} commercial spaces in NCR`;
        
        renderCarousel(filtered.slice(0, 5));
        renderBento(filtered.slice(5, 11));
        renderStandard(filtered.slice(11));
    };

    const renderCarousel = (props) => {
        if (!mostViewedList) return;
        mostViewedList.innerHTML = props.length > 0 ? props.map(p => `
            <div class="carousel-card" onclick="viewDetails('${p.id}')">
                <img src="${(p.images && p.images[0]) || p.image || '../assets/mainappicon.png'}" alt="${p.property_type}" onerror="this.src='../assets/mainappicon.png'">
                <div class="carousel-overlay">
                    <div class="badge-row">
                        <span class="pro-badge footfall">High Footfall 🔥</span>
                    </div>
                    <div style="font-size: 18px; font-weight: 900;">₹${p.price}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${p.location_text || p.location}</div>
                </div>
            </div>
        `).join('') : '<p style="padding: 20px; color: #666;">No featured spaces found.</p>';
    };

    const renderBento = (props) => {
        if (!bentoGrid) return;
        bentoGrid.innerHTML = props.map((p, i) => {
            const size = i % 5 === 0 ? 'large' : (i % 5 === 3 ? 'wide' : '');
            return `
                <div class="bento-card ${size}" onclick="viewDetails('${p.id}')">
                    <img src="${(p.images && p.images[0]) || p.image || '../assets/mainappicon.png'}" onerror="this.src='../assets/mainappicon.png'">
                    <div class="bento-info">
                        <div style="font-weight: 800;">₹${p.price}</div>
                        <div style="font-size: 10px;">${p.location_text || p.location}</div>
                    </div>
                </div>
            `;
        }).join('');
    };

    const renderStandard = (props) => {
        if (!standardList) return;
        standardList.innerHTML = props.length > 0 ? props.map(p => `
            <div class="standard-card" onclick="viewDetails('${p.id}')">
                <img src="${(p.images && p.images[0]) || p.image || '../assets/mainappicon.png'}" onerror="this.src='../assets/mainappicon.png'">
                <div class="standard-info">
                    <div class="badge-row">
                        <span style="font-size: 10px; color: #666; font-weight: 800; background: #eee; padding: 2px 6px; border-radius: 4px;">${p.details?.suitable || 'Commercial Space'}</span>
                    </div>
                    <h3>${p.title || 'Premium Commercial Space'}</h3>
                    <div class="price">₹${p.price}</div>
                    <div style="font-size: 12px; color: #666;">${p.location_text || p.location}</div>
                </div>
                <i data-lucide="chevron-right" style="color: #ccc; width: 20px;"></i>
            </div>
        `).join('') : (PROPERTIES.length > 0 ? '' : '<p style="text-align: center; padding: 40px; color: #666;">No commercial spaces found.</p>');
        if (window.lucide) window.lucide.createIcons();
    };

    window.viewDetails = (id) => {
        window.location.href = `property-view.html?id=${id}`;
    };

    const renderFilterSheet = () => {
        filterContent.innerHTML = currentMode === 'Buy' ? BUY_FILTERS : RENT_FILTERS;
        quickChips.innerHTML = (currentMode === 'Buy' ? CHIPS_BUY : CHIPS_RENT)
            .map(c => `<div class="chip">${c}</div>`).join('');
        
        const options = filterContent.querySelectorAll('.option');
        options.forEach(opt => {
            opt.onclick = () => {
                opt.parentElement.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            };
        });
    };

    modeBtns.forEach(btn => {
        btn.onclick = () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            renderFilterSheet();
            renderData();
        };
    });

    const toggleSheet = (show) => {
        filterSheet.classList.toggle('open', show);
        sheetOverlay.style.display = show ? 'block' : 'none';
        setTimeout(() => sheetOverlay.style.opacity = show ? '1' : '0', 10);
    };

    document.getElementById('openMoreFilters').onclick = () => toggleSheet(true);
    document.getElementById('closeFilter').onclick = () => toggleSheet(false);
    sheetOverlay.onclick = () => toggleSheet(false);
    document.getElementById('applyFilters').onclick = () => toggleSheet(false);

    const pills = ['budgetPill', 'typePill', 'areaPill'];
    pills.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => toggleSheet(true);
    });

    renderFilterSheet();
    loadProperties();
});
