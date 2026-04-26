document.addEventListener('DOMContentLoaded', () => {
    const featuredContainer = document.getElementById('featured-listings-container');
    const data = window.propertyData;

    if (!featuredContainer || !data) return;

    // Show first 5 properties as featured
    const featured = data.slice(0, 5);

    featured.forEach(prop => {
        const card = document.createElement('a');
        card.href = 'html/property-view.html';
        card.style.textDecoration = 'none';
        
        card.innerHTML = `
            <div class="property-card">
                <img src="${prop.image}" alt="${prop.type}" class="property-img">
                <div class="tag">${prop.tag}</div>
                <div class="map-overlay"><i data-lucide="map"></i> Map</div>
                <div class="property-details">
                    <div class="prop-price">${prop.price}</div>
                    <div class="prop-title">${prop.beds ? prop.beds + ' ' : ''}${prop.type}</div>
                    <div class="prop-loc">${prop.location}</div>
                </div>
            </div>
        `;
        
        featuredContainer.appendChild(card);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
});
