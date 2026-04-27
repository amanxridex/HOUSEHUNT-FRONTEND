document.addEventListener('DOMContentLoaded', () => {
    const PROPERTIES = window.propertyData;
    if (!PROPERTIES) {
        console.error("Property data not found!");
        return;
    }

    const filterContent = document.getElementById('filterContent');
    const quickChips = document.getElementById('quickChips');
    const stackContainer = document.getElementById('stackContainer');
    const standardList = document.getElementById('standardList');
    
    let currentMode = 'Buy';

    const RENT_FILTERS = `
        <div class="filter-group">
            <div class="filter-title">💰 Budget</div>
            <div class="option-grid">
                <div class="option selected" data-value="all">Any</div>
                <div class="option" data-value="Under 20k">Under 20k</div>
                <div class="option" data-value="20k-50k">20k-50k</div>
                <div class="option" data-value="50k+">50k+</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">🏡 Apartment Basics</div>
            <div class="option-grid">
                <div class="option" data-value="1 BHK">1 BHK</div>
                <div class="option" data-value="2 BHK">2 BHK</div>
                <div class="option" data-value="3 BHK">3 BHK</div>
                <div class="option" data-value="4+ BHK">4+ BHK</div>
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-title">🏢 Society & Amenities</div>
            <div class="option-grid">
                <div class="option" data-value="Gated Society">Gated Society</div>
                <div class="option" data-value="Lift">Lift / Elevator</div>
                <div class="option" data-value="Power Backup">Power Backup</div>
                <div class="option" data-value="Gym">Gym / Pool</div>
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
            </div>
        </div>
    `;

    const CHIPS_RENT = ['Fully furnished', 'Near metro', 'Ready to move', 'Gated society'];
    const CHIPS_BUY = ['Best deal 🔥', 'Newly constructed', 'Premium society', 'Park facing'];

    const renderData = () => {
        const filtered = PROPERTIES.filter(p => p.type === 'Apartment' && p.intent === currentMode);
        renderStack(filtered.slice(0, 5));
        renderList(filtered.slice(5));
    };

    const renderStack = (props) => {
        if (!stackContainer) return;
        stackContainer.innerHTML = props.map((p, i) => `
            <div class="stacked-card" style="z-index: ${10 - i}; transform: translateY(${i * 10}px) scale(${1 - i * 0.05}); opacity: ${1 - i * 0.2};" onclick="viewDetails(${p.id})">
                <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="info">
                    <div style="font-size: 18px; font-weight: 900;">${p.price}</div>
                    <div style="font-size: 12px;">${p.location}</div>
                </div>
            </div>
        `).join('');
    };

    // Auto-switch interval
    setInterval(() => {
        if (!stackContainer || stackContainer.children.length < 2) return;
        const first = stackContainer.firstElementChild;
        first.style.transform = `translateX(400px) rotate(20deg)`;
        first.style.opacity = '0';
        
        setTimeout(() => {
            stackContainer.appendChild(first);
            updateStackStyles();
        }, 500);
    }, 3000);

    const updateStackStyles = () => {
        const cards = stackContainer.querySelectorAll('.stacked-card');
        cards.forEach((c, i) => {
            c.style.zIndex = 10 - i;
            c.style.transform = `translateY(${i * 10}px) scale(${1 - i * 0.05})`;
            c.style.opacity = 1 - i * 0.2;
            c.style.transition = 'all 0.5s ease';
        });
    };

    const renderList = (props) => {
        if (!standardList) return;
        standardList.innerHTML = props.map(p => `
            <div class="standard-card" onclick="viewDetails(${p.id})">
                <img src="${p.image}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="standard-info">
                    <h3>${p.beds || 'Premium'} Apartment</h3>
                    <div class="price">${p.price}</div>
                    <div class="loc">${p.location}</div>
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

    // UI Listeners
    const toggleSheet = (show) => {
        document.getElementById('filterSheet').classList.toggle('open', show);
        document.getElementById('sheetOverlay').style.display = show ? 'block' : 'none';
        setTimeout(() => document.getElementById('sheetOverlay').style.opacity = show ? '1' : '0', 10);
    };

    document.getElementById('openMoreFilters').onclick = () => toggleSheet(true);
    document.getElementById('closeFilter').onclick = () => toggleSheet(false);
    document.getElementById('sheetOverlay').onclick = () => toggleSheet(false);
    document.getElementById('applyFilters').onclick = () => toggleSheet(false);

    // Pill click listeners
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
