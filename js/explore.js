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
    
    // State
    let searchTerm = '';
    let activeChip = 'All'; // 'All', 'Rent', 'Sale', 'Commercial'
    
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

    // Filter button click
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            alert('Advanced filters coming soon!');
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

    function renderProperties() {
        let filteredData = data;
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
