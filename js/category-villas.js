document.addEventListener('DOMContentLoaded', () => {
    const PROPERTIES = window.propertyData;
    if (!PROPERTIES) return;

    const filterContent = document.getElementById('filterContent');
    const quickChips = document.getElementById('quickChips');
    const villaSlider = document.getElementById('villaSlider');
    const standardList = document.getElementById('standardList');

    let currentMode = 'Buy';

    const RENT_FILTERS = `
        <div class="filter-group">
            <div class="filter-title">💰 Budget</div>
            <div class="option-grid">
                <div class="option selected" data-value="all">Any</div>
                <div class="option" data-value="Under 1L">Under 1L</div>
                <div class="option" data-value="1L-3L">1L-3L</div>
                <div class="option" data-value="3L+">3L+</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">🌿 Outdoor & Luxury</div>
            <div class="option-grid">
                <div class="option" data-value="Private Garden">Private Garden</div>
                <div class="option" data-value="Private Pool">Private Pool</div>
                <div class="option" data-value="Terrace">Terrace</div>
            </div>
        </div>
    `;

    const BUY_FILTERS = `
        <div class="filter-group">
            <div class="filter-title">💰 Price Range</div>
            <div class="option-grid">
                <div class="option selected" data-value="all">Any</div>
                <div class="option" data-value="Under 5Cr">Under 5Cr</div>
                <div class="option" data-value="5Cr-10Cr">5Cr-10Cr</div>
                <div class="option" data-value="10Cr+">10Cr+</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">🌿 Premium Features</div>
            <div class="option-grid">
                <div class="option" data-value="Pool">Private Pool</div>
                <div class="option" data-value="Garden">Garden</div>
                <div class="option" data-value="Smart Home">Smart Home</div>
            </div>
        </div>
    `;

    const CHIPS_RENT = ['Luxury villa', 'Fully furnished', 'Gated community', 'Premium locality'];
    const CHIPS_BUY = ['Luxury', 'High-end interiors', 'Gated community', 'Investment property'];

    const renderData = () => {
        const filtered = PROPERTIES.filter(p => p.type === 'Villa' && p.intent === currentMode);
        renderSlider(filtered.slice(0, 5));
        renderList(filtered.slice(5));
    };

    const renderSlider = (props) => {
        if (!villaSlider) return;
        villaSlider.innerHTML = props.map(p => `
            <div class="slider-card" onclick="viewDetails(${p.id})">
                <span class="luxury-badge">Luxury</span>
                <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="slider-info">
                    <div style="font-size: 22px; font-weight: 900;">${p.price}</div>
                    <div style="font-size: 14px; opacity: 0.9;">${p.location}</div>
                </div>
            </div>
        `).join('');
    };

    const renderList = (props) => {
        if (!standardList) return;
        standardList.innerHTML = props.map(p => `
            <div class="standard-card" onclick="viewDetails(${p.id})">
                <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="standard-info">
                    <h3>Premium Villa in ${p.location.split(',')[0]}</h3>
                    <div class="price">${p.price}</div>
                    <div style="font-size: 12px; color: #666;">${p.area} • ${p.beds}</div>
                </div>
            </div>
        `).join('');
    };

    window.viewDetails = (id) => {
        const p = PROPERTIES.find(prop => prop.id === id);
        localStorage.setItem('selectedProperty', JSON.stringify(p));
        window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
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

    const toggleSheet = (show) => {
        document.getElementById('filterSheet').classList.toggle('open', show);
        document.getElementById('sheetOverlay').style.display = show ? 'block' : 'none';
        setTimeout(() => document.getElementById('sheetOverlay').style.opacity = show ? '1' : '0', 10);
    };

    document.getElementById('openMoreFilters').onclick = () => toggleSheet(true);
    document.getElementById('closeFilter').onclick = () => toggleSheet(false);
    document.getElementById('sheetOverlay').onclick = () => toggleSheet(false);
    document.getElementById('applyFilters').onclick = () => toggleSheet(false);

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
