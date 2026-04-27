document.addEventListener('DOMContentLoaded', () => {
    const PROPERTIES = window.propertyData;
    if (!PROPERTIES) return;

    const filterContent = document.getElementById('filterContent');
    const quickChips = document.getElementById('quickChips');
    const carouselList = document.getElementById('carouselList');
    const bentoGrid = document.getElementById('bentoGrid');
    const standardList = document.getElementById('standardList');
    const resultsCount = document.getElementById('resultsCount');

    let currentMode = 'Buy';

    const RENT_FILTERS = `
        <div class="filter-group">
            <div class="filter-title">💰 Budget (Rent)</div>
            <div class="option-grid">
                <div class="option selected" data-value="all">Any</div>
                <div class="option" data-value="Under 20k">Under 20k</div>
                <div class="option" data-value="20k-50k">20k-50k</div>
                <div class="option" data-value="50k+">50k+</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">🏡 BHK & Furnishing</div>
            <div class="option-grid">
                <div class="option" data-value="1 BHK">1 BHK</div>
                <div class="option" data-value="2 BHK">2 BHK</div>
                <div class="option" data-value="3 BHK">3 BHK</div>
                <div class="option" data-value="4+ BHK">4+ BHK</div>
                <div class="option" data-value="Fully">Fully Furnished</div>
                <div class="option" data-value="Semi">Semi-Furnished</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">🏢 Society Amenities</div>
            <div class="option-grid">
                <div class="option" data-value="Gated Society">Gated Society</div>
                <div class="option" data-value="Lift">Lift / Elevator</div>
                <div class="option" data-value="Gym">Gym / Pool</div>
                <div class="option" data-value="Backup">Power Backup</div>
            </div>
        </div>
    `;

    const BUY_FILTERS = `
        <div class="filter-group">
            <div class="filter-title">💰 Price Range</div>
            <div class="option-grid">
                <div class="option selected" data-value="all">Any</div>
                <div class="option" data-value="Under 50L">Under 50L</div>
                <div class="option" data-value="50L-1Cr">50L-1Cr</div>
                <div class="option" data-value="1Cr+">1Cr+</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">📑 Legal & Status</div>
            <div class="option-grid">
                <div class="option" data-value="RERA">RERA Approved</div>
                <div class="option" data-value="Loan">Loan Available</div>
                <div class="option" data-value="Ready">Ready to Move</div>
                <div class="option" data-value="Under Construction">Under Const.</div>
            </div>
        </div>
    `;

    const CHIPS_RENT = ['Fully furnished', 'Near metro', 'Ready to move', 'Gated society'];
    const CHIPS_BUY = ['Best deal 🔥', 'Newly constructed', 'Premium society', 'Park facing'];

    const renderData = () => {
        const filtered = PROPERTIES.filter(p => p.type === 'Apartment' && p.intent === currentMode);
        resultsCount.innerText = `Showing ${filtered.length} Apartments in NCR`;
        
        renderCarousel(filtered.slice(0, 5));
        renderBento(filtered.slice(5, 11));
        renderStandard(filtered.slice(11));
    };

    const renderCarousel = (props) => {
        if (!carouselList) return;
        carouselList.innerHTML = props.map(p => `
            <div class="carousel-card" onclick="viewDetails(${p.id})">
                <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="carousel-overlay">
                    <div style="font-size: 18px; font-weight: 900;">${p.price}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${p.location}</div>
                </div>
            </div>
        `).join('');
    };

    const renderBento = (props) => {
        if (!bentoGrid) return;
        bentoGrid.innerHTML = props.map((p, i) => {
            const size = i % 5 === 0 ? 'large' : (i % 5 === 3 ? 'wide' : '');
            return `
                <div class="bento-card ${size}" onclick="viewDetails(${p.id})">
                    <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                    <div class="bento-info">
                        <div style="font-weight: 800; font-size: 14px;">${p.price}</div>
                        <div style="font-size: 10px;">${p.location}</div>
                    </div>
                </div>
            `;
        }).join('');
    };

    const renderStandard = (props) => {
        if (!standardList) return;
        standardList.innerHTML = props.map(p => `
            <div class="standard-card" onclick="viewDetails(${p.id})">
                <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="standard-info">
                    <h3>${p.beds || ''} Apartment in ${p.location.split(',')[0]}</h3>
                    <div class="price">${p.price}</div>
                    <div style="font-size: 11px; color: #666;">${p.location}</div>
                </div>
                <i data-lucide="chevron-right" style="color:#ccc;width:20px;"></i>
            </div>
        `).join('');
        if (window.lucide) window.lucide.createIcons();
    };

    window.viewDetails = (id) => {
        const p = PROPERTIES.find(prop => prop.id === id);
        localStorage.setItem('selectedProperty', JSON.stringify(p));
        window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
    };

    const toggleSheet = (show) => {
        const sheet = document.getElementById('filterSheet');
        const overlay = document.getElementById('sheetOverlay');
        if (!sheet || !overlay) return;
        sheet.classList.toggle('open', show);
        overlay.style.display = show ? 'block' : 'none';
        setTimeout(() => overlay.style.opacity = show ? '1' : '0', 10);
    };

    const renderFilters = () => {
        filterContent.innerHTML = currentMode === 'Buy' ? BUY_FILTERS : RENT_FILTERS;
        quickChips.innerHTML = (currentMode === 'Buy' ? CHIPS_BUY : CHIPS_RENT).map(c => `<div class="chip">${c}</div>`).join('');
        
        document.querySelectorAll('.option').forEach(opt => {
            opt.onclick = () => {
                opt.parentElement.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            };
        });
    };

    // UI Events
    document.getElementById('openMoreFilters').onclick = () => toggleSheet(true);
    document.getElementById('closeFilter').onclick = () => toggleSheet(false);
    document.getElementById('sheetOverlay').onclick = () => toggleSheet(false);
    document.getElementById('applyFilters').onclick = () => toggleSheet(false);

    // Pill clicks
    ['budgetPill', 'bhkPill', 'areaPill'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => toggleSheet(true);
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            renderFilters();
            renderData();
        };
    });

    renderFilters();
    renderData();
});
