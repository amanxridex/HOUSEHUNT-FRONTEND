document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('explore-results');
    const data = window.propertyData;

    if (!resultsContainer || !data) return;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlTypeFilter = urlParams.get('type');
    const urlIntentFilter = urlParams.get('intent');

    // DOM Elements
    const searchInput = document.querySelector('.search-box input');
    const filterChips = document.querySelectorAll('.f-chip');
    const filterBtn = document.querySelector('.filter-btn');
    
    // Filter Modal DOM Elements
    const filterModal = document.getElementById('filterModal');
    const closeFilterBtn = document.getElementById('closeFilterBtn');
    const sortRadios = document.querySelectorAll('input[name="sortPrice"]');
    const locationSelect = document.getElementById('locationFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    
    // State
    let searchTerm = '';
    let activeChip = 'All'; // 'All', 'Rent', 'Sale', 'Commercial'
    let activeSort = null;
    let activeLocation = 'all';
    
    // Initial State from URL
    if (urlTypeFilter) {
        if (['Commercial Office', 'Shop', 'Showroom', 'Warehouse', 'Co-working'].some(t => t.toLowerCase().includes(urlTypeFilter.toLowerCase()))) {
            activeChip = 'Commercial';
        }
    } else if (urlIntentFilter) {
        if (urlIntentFilter.toLowerCase() === 'rent') activeChip = 'Rent';
        if (urlIntentFilter.toLowerCase() === 'buy' || urlIntentFilter.toLowerCase() === 'sale') activeChip = 'Sale';
    }

    // Update chips UI based on initial state
    filterChips.forEach(chip => {
        if (chip.textContent === activeChip) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    // Filter Modal Interactions
    if (filterBtn && filterModal) {
        filterBtn.addEventListener('click', () => {
            filterModal.classList.add('active');
        });
    }

    if (closeFilterBtn && filterModal) {
        closeFilterBtn.addEventListener('click', () => {
            filterModal.classList.remove('active');
        });
    }

    if (filterModal) {
        filterModal.addEventListener('click', (e) => {
            if (e.target === filterModal) {
                filterModal.classList.remove('active');
            }
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const selectedSort = document.querySelector('input[name="sortPrice"]:checked');
            activeSort = selectedSort ? selectedSort.value : null;
            activeLocation = locationSelect ? locationSelect.value : 'all';
            
            filterModal.classList.remove('active');
            renderProperties();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (sortRadios) sortRadios.forEach(r => r.checked = false);
            if (locationSelect) locationSelect.value = 'all';
            activeSort = null;
            activeLocation = 'all';
            
            filterModal.classList.remove('active');
            renderProperties();
        });
    }

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            renderProperties();
        });
    }

    // Chips click
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeChip = chip.textContent;
            renderProperties();
        });
    });

    // Utility to parse price for sorting
    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        let str = priceStr.toString().replace(/,/g, '');
        let num = parseFloat(str.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return 0;
        
        if (str.includes('Cr')) return num * 10000000;
        if (str.includes('L')) return num * 100000;
        return num;
    }

    function renderProperties() {
        let filteredData = [...data];
        let filterTitle = 'Properties';

        // 1. Apply Chip Filter
        if (activeChip === 'Rent') {
            filteredData = filteredData.filter(p => p.intent === 'Rent');
            filterTitle = 'Rental Properties';
        } else if (activeChip === 'Sale') {
            filteredData = filteredData.filter(p => p.intent === 'Buy');
            filterTitle = 'Properties for Sale';
        } else if (activeChip === 'Commercial') {
            const commercialTypes = ['Commercial Office', 'Shop', 'Showroom', 'Warehouse', 'Co-working'];
            filteredData = filteredData.filter(p => commercialTypes.includes(p.type));
            filterTitle = 'Commercial Properties';
        }
        
        // 2. Apply URL type filter if still relevant and activeChip is All
        if (activeChip === 'All' && urlTypeFilter) {
            filteredData = filteredData.filter(p => p.type.toLowerCase().includes(urlTypeFilter.toLowerCase()));
            filterTitle = urlTypeFilter;
        }

        // 3. Apply Search Filter
        if (searchTerm) {
            filteredData = filteredData.filter(p => {
                return (p.location && p.location.toLowerCase().includes(searchTerm)) ||
                       (p.type && p.type.toLowerCase().includes(searchTerm)) ||
                       (p.intent && p.intent.toLowerCase().includes(searchTerm));
            });
        }

        // 4. Apply Modal Location Filter
        if (activeLocation && activeLocation !== 'all') {
            filteredData = filteredData.filter(p => p.location && p.location.toLowerCase().includes(activeLocation.toLowerCase()));
        }

        // 5. Apply Modal Sorting
        if (activeSort === 'lowToHigh') {
            filteredData.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        } else if (activeSort === 'highToLow') {
            filteredData.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        }

        // Clear container
        resultsContainer.innerHTML = '';

        // Add count
        const countHeader = document.createElement('div');
        countHeader.className = 'results-count';
        countHeader.textContent = `Showing ${filteredData.length} ${filterTitle} in NCR`;
        resultsContainer.appendChild(countHeader);

        // Render cards
        filteredData.forEach(prop => {
            const item = document.createElement('a');
            item.href = 'property-view.html';
            item.className = 'list-item';
            
            item.innerHTML = `
                <img src="${prop.image}" alt="${prop.type}" onerror="this.src='../assets/househuntlogo.png'; this.onerror=null;">
                <div class="item-info">
                    <div class="item-price">${prop.price}</div>
                    <h3>${prop.beds ? prop.beds + ' ' : ''}${prop.type}</h3>
                    <p class="item-loc">${prop.location}</p>
                    <div class="item-stats">
                        <span>${prop.intent}</span> • <span>${prop.area}</span>
                    </div>
                </div>
                <button class="fav-btn"><i data-lucide="heart"></i></button>
            `;
            
            resultsContainer.appendChild(item);
        });

        // Re-initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Initial render
    renderProperties();
});
