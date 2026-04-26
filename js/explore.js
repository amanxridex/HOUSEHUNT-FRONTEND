document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('explore-results');
    const data = window.propertyData;

    if (!resultsContainer || !data) return;

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const typeFilter = urlParams.get('type');
    const intentFilter = urlParams.get('intent');

    let filteredData = data;
    let filterTitle = 'NCR';

    if (typeFilter) {
        // Normalize type (e.g., 'Independent' -> 'Independent House')
        filteredData = data.filter(p => p.type.toLowerCase().includes(typeFilter.toLowerCase()));
        filterTitle = typeFilter;
    } else if (intentFilter) {
        filteredData = data.filter(p => p.intent.toLowerCase() === intentFilter.toLowerCase());
        filterTitle = intentFilter === 'Rent' ? 'Rental Properties' : 'Properties for Sale';
    }

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
            <img src="${prop.image}" alt="${prop.type}">
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
});
