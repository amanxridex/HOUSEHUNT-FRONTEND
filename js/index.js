document.addEventListener('DOMContentLoaded', () => {
    const featuredContainer = document.getElementById('featured-listings-container');
    const data = window.propertyData;

    if (!data) return;

    // Helper to render a section
    const renderSection = (containerId, items) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        items.forEach(prop => {
            const card = document.createElement('a');
            card.href = 'html/property-view.html';
            card.style.textDecoration = 'none';
            
            card.innerHTML = `
                <div class="property-card">
                    <img src="${prop.image}" alt="${prop.type}" class="property-img" onerror="this.src='assets/househuntlogo.png'; this.onerror=null;">
                    <div class="tag">${prop.tag}</div>
                    <div class="property-details">
                        <div class="prop-price">${prop.price}</div>
                        <div class="prop-title">${prop.beds ? prop.beds + ' ' : ''}${prop.type}</div>
                        <div class="prop-loc">${prop.location}</div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    };

    // Populate Featured (Top 5)
    renderSection('featured-listings-container', data.slice(0, 5));

    // Populate Near You (Next 5)
    renderSection('near-you-container', data.slice(5, 10));

    // Populate Top Listings (Next 5)
    renderSection('top-listings-container', data.slice(10, 15));

    // Populate Plots (Only plots)
    const plots = data.filter(p => p.type.toLowerCase().includes('plot')).slice(0, 5);
    renderSection('plots-container', plots);

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
