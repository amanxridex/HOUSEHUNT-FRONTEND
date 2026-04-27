const PROPERTIES = window.propertyData;
const filterContent = document.getElementById('filterContent');
const quickChips = document.getElementById('quickChips');

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

    <div class="filter-group">
        <div class="filter-title">📍 Visibility & Suitability</div>
        <div class="option-grid">
            <div class="option" data-value="Main Road Facing">Main Road Facing</div>
            <div class="option" data-value="High Footfall">High Footfall</div>
            <div class="option" data-value="Good for Food">Suitable for Food</div>
            <div class="option" data-value="Retail Hub">Near Retail Hub</div>
        </div>
    </div>

    <div class="filter-group">
        <div class="filter-title">🏗 Furnishing & Setup</div>
        <div class="option-grid">
            <div class="option" data-value="Bare shell">Bare shell</div>
            <div class="option" data-value="Semi-furnished">Semi-furnished</div>
            <div class="option" data-value="Fully furnished">Fully furnished</div>
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

    <div class="filter-group">
        <div class="filter-title">📐 Size & Infrastructure</div>
        <div class="option-grid">
            <div class="option" data-value="Ready to use">Ready to use</div>
            <div class="option" data-value="Under construction">Under Const.</div>
            <div class="option" data-value="Main Road Facing">Main Road Facing</div>
        </div>
    </div>
`;

const CHIPS_RENT = ['High footfall 🔥', 'Main road', 'Fully furnished', 'Ready to move', 'Prime location'];
const CHIPS_BUY = ['High ROI 🔥', 'Pre-leased 💰', 'Prime zone', 'Corner unit', 'Near metro'];

document.addEventListener('DOMContentLoaded', () => {
    const mostViewedList = document.getElementById('mostViewedList');
    const bentoGrid = document.getElementById('bentoGrid');
    const standardList = document.getElementById('standardList');
    const resultsCount = document.getElementById('resultsCount');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const filterSheet = document.getElementById('filterSheet');
    const sheetOverlay = document.getElementById('sheetOverlay');
    
    let currentMode = 'Buy';
    let activeFilters = { budget: 'all', type: 'all', area: 'all' };

    const renderData = () => {
        const filtered = PROPERTIES.filter(p => {
            const isCommercial = p.type === 'Commercial Office' || p.type === 'Commercial';
            const matchesMode = p.intent === currentMode;
            return isCommercial && matchesMode;
        });

        resultsCount.innerText = `Showing ${filtered.length} commercial spaces in NCR`;
        
        renderCarousel(filtered.slice(0, 5));
        renderBento(filtered.slice(5, 11));
        renderStandard(filtered.slice(11));
    };

    const renderCarousel = (props) => {
        mostViewedList.innerHTML = props.map(p => `
            <div class="carousel-card" onclick="viewDetails(${p.id})">
                <img src="${p.image}" alt="${p.type}">
                <div class="carousel-overlay">
                    <div class="badge-row">
                        ${p.tag === 'Verified' ? '<span class="pro-badge metro">Near Metro</span>' : ''}
                        <span class="pro-badge footfall">High Footfall 🔥</span>
                    </div>
                    <div style="font-size: 18px; font-weight: 900;">${p.price}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${p.location}</div>
                </div>
            </div>
        `).join('');
    };

    const renderBento = (props) => {
        bentoGrid.innerHTML = props.map((p, i) => {
            const size = i % 5 === 0 ? 'large' : (i % 5 === 3 ? 'wide' : '');
            return `
                <div class="bento-card ${size}" onclick="viewDetails(${p.id})">
                    <img src="${p.image}">
                    <div class="bento-info">
                        <div style="font-weight: 800;">${p.price}</div>
                        <div style="font-size: 10px;">${p.location}</div>
                    </div>
                </div>
            `;
        }).join('');
    };

    const renderStandard = (props) => {
        standardList.innerHTML = props.map(p => `
            <div class="standard-card" onclick="viewDetails(${p.id})">
                <img src="${p.image}">
                <div class="standard-info">
                    <div class="badge-row">
                        <span style="font-size: 10px; color: #666; font-weight: 800; background: #eee; padding: 2px 6px; border-radius: 4px;">Office Space</span>
                    </div>
                    <h3>Premium Commercial Space</h3>
                    <div class="price">${p.price}</div>
                    <div style="font-size: 12px; color: #666;">${p.location}</div>
                </div>
                <i data-lucide="chevron-right" style="color: #ccc; width: 20px;"></i>
            </div>
        `).join('');
        if (window.lucide) window.lucide.createIcons();
    };

    window.viewDetails = (id) => {
        const p = PROPERTIES.find(prop => prop.id === id);
        localStorage.setItem('selectedProperty', JSON.stringify(p));
        window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
    };

    const renderFilterSheet = () => {
        filterContent.innerHTML = currentMode === 'Buy' ? BUY_FILTERS : RENT_FILTERS;
        quickChips.innerHTML = (currentMode === 'Buy' ? CHIPS_BUY : CHIPS_RENT)
            .map(c => `<div class="chip">${c}</div>`).join('');
        
        // Setup option clicks
        const options = filterContent.querySelectorAll('.option');
        options.forEach(opt => {
            opt.onclick = () => {
                opt.parentElement.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            };
        });
    };

    // Mode Toggle
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

    // Initial Render
    renderFilterSheet();
    renderData();
});
