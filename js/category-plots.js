const PROPERTIES = window.propertyData;
const quickChips = document.getElementById('quickChips');
const featuredPlots = document.getElementById('featuredPlots');
const filterContent = document.getElementById('filterContent');

const CHIPS_BUY = ['Investment opportunity 🔥', 'Ready to build', 'High appreciation', 'Near highway'];

const PLOT_FILTERS = `
    <div class="filter-group">
        <div class="filter-title">💰 Price & Investment</div>
        <div class="option-grid">
            <div class="option selected" data-value="all">Any</div>
            <div class="option" data-value="Under 50L">Under 50L</div>
            <div class="option" data-value="50L-1Cr">50L-1Cr</div>
            <div class="option" data-value="1Cr+">1Cr+</div>
            <div class="option" data-value="High Appreciation">High Growth Zone</div>
        </div>
    </div>
    <div class="filter-group">
        <div class="filter-title">📑 Legal & Ownership</div>
        <div class="option-grid">
            <div class="option" data-value="Freehold">Freehold</div>
            <div class="option" data-value="Title Clear">Title Clear</div>
            <div class="option" data-value="Approved">Authority Approved</div>
            <div class="option" data-value="Loan">Loan Available</div>
        </div>
    </div>
    <div class="filter-group">
        <div class="filter-title">📍 Location & Value</div>
        <div class="option-grid">
            <div class="option" data-value="Corner Plot">Corner Plot</div>
            <div class="option" data-value="Main Road">Main Road Access</div>
            <div class="option" data-value="Gated">Gated Layout</div>
            <div class="option" data-value="Near Highway">Near Highway</div>
        </div>
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {
    const renderData = () => {
        const filtered = PROPERTIES.filter(p => p.type === 'Plot' && p.intent === 'Buy');
        renderFeatured(filtered.slice(0, 4));
        renderList(filtered.slice(4));
    };

    const renderFeatured = (props) => {
        featuredPlots.innerHTML = props.map(p => `
            <div class="plot-card" onclick="viewDetails(${p.id})">
                <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="plot-info">
                    <div class="price">${p.price}</div>
                    <div class="area">${p.area}</div>
                    <div style="font-size: 10px; color: #666; margin-top: 4px;">${p.location}</div>
                </div>
            </div>
        `).join('');
    };

    const renderList = (props) => {
        const list = document.getElementById('standardList');
        list.innerHTML = props.map(p => `
            <div class="standard-card" onclick="viewDetails(${p.id})">
                <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="standard-info">
                    <h3>Premium Plot - ${p.area}</h3>
                    <div class="price">${p.price}</div>
                    <div style="font-size: 12px; color: #666;">${p.location}</div>
                </div>
            </div>
        `).join('');
    };

    window.viewDetails = (id) => {
        const p = PROPERTIES.find(prop => prop.id === id);
        localStorage.setItem('selectedProperty', JSON.stringify(p));
        window.location.href = 'property-details-sell.html';
    };

    const renderFilters = () => {
        filterContent.innerHTML = PLOT_FILTERS;
        quickChips.innerHTML = CHIPS_BUY.map(c => `<div class="chip">${c}</div>`).join('');
        
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

    renderFilters();
    renderData();
});
