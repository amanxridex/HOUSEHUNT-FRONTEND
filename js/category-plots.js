document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://backend.househunt.live';
    let PROPERTIES = [];

    const quickChips = document.getElementById('quickChips');
    const featuredPlots = document.getElementById('featuredPlots');
    const filterContent = document.getElementById('filterContent');
    const standardList = document.getElementById('standardList');

    const urlParams = new URLSearchParams(window.location.search);
    let currentMode = urlParams.get('mode') === 'Rent' ? 'Rent' : 'Buy';

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

    const CHIPS_BUY = ['Investment opportunity 🔥', 'Ready to build', 'High appreciation', 'Near highway'];

    const PLOT_FILTERS = `
        <div class="filter-group">
            <div class="filter-title">💰 Price & Investment</div>
            <div class="option-grid">
                <div class="option selected" data-value="all">Any</div>
                <div class="option" data-value="Under 50L">Under 50L</div>
                <div class="option" data-value="50L-1Cr">50L-1Cr</div>
                <div class="option" data-value="1Cr+">1Cr+</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">📑 Legal & Ownership</div>
            <div class="option-grid">
                <div class="option" data-value="Freehold">Freehold</div>
                <div class="option" data-value="Title Clear">Title Clear</div>
                <div class="option" data-value="Approved">Authority Approved</div>
            </div>
        </div>
    `;

    const renderData = () => {
        const filtered = PROPERTIES.filter(p => p.property_type === 'Plot' && p.intent === currentMode);
        renderFeatured(filtered.slice(0, 4));
        renderList(filtered.slice(4));
    };

    const renderFeatured = (props) => {
        if (!featuredPlots) return;
        featuredPlots.innerHTML = props.length > 0 ? props.map(p => `
            <div class="plot-card" onclick="viewDetails('${p.id}')">
                <img src="${(p.images && p.images[0]) || p.image || '../assets/mainappicon.png'}" onerror="this.src='../assets/mainappicon.png'">
                <div class="plot-info">
                    <div class="price">${p.price}</div>
                    <div class="area">${p.details?.area || ''}</div>
                    <div style="font-size: 10px; color: #666; margin-top: 4px;">${p.location_text || p.location}</div>
                </div>
            </div>
        `).join('') : '<p style="padding: 20px; color: #666;">No featured plots found.</p>';
    };

    const renderList = (props) => {
        if (!standardList) return;
        standardList.innerHTML = props.length > 0 ? props.map(p => `
            <div class="standard-card" onclick="viewDetails('${p.id}')">
                <img src="${(p.images && p.images[0]) || p.image || '../assets/mainappicon.png'}" onerror="this.src='../assets/mainappicon.png'">
                <div class="standard-info">
                    <h3>Premium Plot - ${p.details?.area || ''}</h3>
                    <div class="price">${p.price}</div>
                    <div style="font-size: 12px; color: #666;">${p.location_text || p.location}</div>
                </div>
            </div>
        `).join('') : (PROPERTIES.length > 0 ? '' : '<p style="text-align: center; padding: 40px; color: #666;">No plots found.</p>');
    };

    window.viewDetails = (id) => {
        window.location.href = `property-view.html?id=${id}`;
    };

    const toggleSheet = (show) => {
        const sheet = document.getElementById('filterSheet');
        const overlay = document.getElementById('sheetOverlay');
        if (!sheet || !overlay) return;
        sheet.classList.toggle('open', show);
        overlay.style.display = show ? 'block' : 'none';
        setTimeout(() => overlay.style.opacity = show ? '1' : '0', 10);
    };

    document.getElementById('openMoreFilters').onclick = () => toggleSheet(true);
    document.getElementById('closeFilter').onclick = () => toggleSheet(false);
    document.getElementById('sheetOverlay').onclick = () => toggleSheet(false);
    document.getElementById('applyFilters').onclick = () => toggleSheet(false);

    const renderFilters = () => {
        if (filterContent) filterContent.innerHTML = PLOT_FILTERS;
        if (quickChips) quickChips.innerHTML = CHIPS_BUY.map(c => `<div class="chip">${c}</div>`).join('');
        
        document.querySelectorAll('.option').forEach(opt => {
            opt.onclick = () => {
                opt.parentElement.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            };
        });
    };

    renderFilters();
    loadProperties();
});
