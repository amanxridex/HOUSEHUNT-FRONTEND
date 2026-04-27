document.addEventListener('DOMContentLoaded', () => {
    const PROPERTIES = window.propertyData;
    const propertyList = document.getElementById('propertyList');
    const resultsCount = document.getElementById('resultsCount');
    const searchInput = document.getElementById('propertySearch');
    const modeBtns = document.querySelectorAll('.mode-btn');
    
    let currentMode = 'Buy'; // Capitalized to match data.js

    const filterAndRender = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const nearestList = document.getElementById('nearestList');
        
        // Filter by type (Independent House) AND mode (Buy/Rent) AND search
        const filtered = PROPERTIES.filter(p => {
            const isIndependent = p.type === 'Independent House';
            const matchesMode = p.intent === currentMode;
            const matchesSearch = p.location.toLowerCase().includes(searchTerm);
            return isIndependent && matchesMode && matchesSearch;
        });

        // Dynamic Nearest (Top 3 of the current filtered list)
        renderNearest(filtered.slice(0, 3));

        resultsCount.innerText = `${filtered.length} Independent Houses Found`;
        renderBento(filtered.slice(3)); // Remaining go to bento
    };

    const renderNearest = (properties) => {
        const nearestList = document.getElementById('nearestList');
        const nearestSection = document.getElementById('nearestSection');
        nearestList.innerHTML = '';
        
        if (properties.length === 0) {
            nearestSection.style.display = 'none';
            return;
        }
        nearestSection.style.display = 'block';

        properties.forEach(p => {
            const card = document.createElement('div');
            card.className = 'nearest-card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.title}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="nearest-info">
                    <div class="price">${p.price}</div>
                    <div style="font-size: 12px; color: #666;">${p.location}</div>
                </div>
            `;
            card.onclick = () => {
                localStorage.setItem('selectedProperty', JSON.stringify(p));
                window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
            };
            nearestList.appendChild(card);
        });
    };

    const renderBento = (properties) => {
        propertyList.innerHTML = '';
        if (properties.length === 0) {
            propertyList.innerHTML = '<p style="grid-column: span 2; text-align: center; padding: 40px; color: #666;">No properties found in this mode.</p>';
            return;
        }

        properties.forEach((p, index) => {
            const card = document.createElement('div');
            // Assign large/wide classes randomly or based on index for bento look
            let sizeClass = '';
            if (index % 5 === 0) sizeClass = 'large';
            else if (index % 5 === 3) sizeClass = 'wide';
            
            card.className = `bento-card ${sizeClass}`;
            card.innerHTML = `
                <img src="${p.image}" alt="${p.title}" onerror="this.src='../assets/househuntlogo.png'">
                <div class="bento-overlay">
                    <div class="price">${p.price}</div>
                    <div class="loc">${p.location}</div>
                </div>
            `;
            card.onclick = () => {
                localStorage.setItem('selectedProperty', JSON.stringify(p));
                window.location.href = p.intent === 'Rent' ? 'property-details-rent.html' : 'property-details-sell.html';
            };
            propertyList.appendChild(card);
        });
    };

    // Mode Toggle Logic
    modeBtns.forEach(btn => {
        btn.onclick = () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            filterAndRender();
        };
    });

    searchInput.oninput = filterAndRender;
    filterAndRender();
});
