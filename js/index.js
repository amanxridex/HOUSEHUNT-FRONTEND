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

    // Make categories clickable
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.querySelector('p').textContent;
            window.location.href = `html/explore.html?type=${type}`;
        });
    });

    // Make tabs clickable
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const intent = tab.textContent.includes('Rent') ? 'Rent' : 'Buy';
            window.location.href = `html/explore.html?intent=${intent}`;
        });
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
});
