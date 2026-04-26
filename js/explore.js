document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('explore-results');
    const data = window.propertyData;

    if (!resultsContainer || !data) return;

    // Add count
    const countHeader = document.createElement('div');
    countHeader.className = 'results-count';
    countHeader.textContent = `Showing ${data.length} properties in NCR`;
    resultsContainer.appendChild(countHeader);

    // Render cards
    data.forEach(prop => {
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
