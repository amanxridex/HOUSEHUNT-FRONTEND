const BACKEND_URL = 'https://househunt-backend-h19r.onrender.com';
const CATEGORY = 'Independent';

document.addEventListener('DOMContentLoaded', () => {
    const propertyList = document.getElementById('propertyList');
    const resultsCount = document.getElementById('resultsCount');
    const searchInput = document.getElementById('propertySearch');

    let allProperties = [];

    const renderProperties = (props) => {
        propertyList.innerHTML = '';
        resultsCount.innerText = `${props.length} Properties found`;

        props.forEach(prop => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <img src="${prop.images ? prop.images[0] : '../assets/househuntlogo.png'}" alt="${prop.type}">
                <div class="card-body">
                    <div class="card-price">₹${prop.price}</div>
                    <div class="card-title">${prop.beds ? prop.beds + ' BHK ' : ''}${prop.type}</div>
                    <div class="card-loc"><i data-lucide="map-pin" style="width:12px"></i> ${prop.location}</div>
                </div>
            `;
            card.onclick = () => {
                window.location.href = `property-view.html?id=${prop.id}`;
            };
            propertyList.appendChild(card);
        });
        if (window.lucide) window.lucide.createIcons();
    };

    const fetchProperties = async () => {
        if (window.showSkeletons) window.showSkeletons('propertyList', 4);
        
        try {
            const res = await fetch(`${BACKEND_URL}/api/properties`);
            const data = await res.json();
            
            // Filter by category
            allProperties = data.filter(p => 
                p.type.toLowerCase().includes(CATEGORY.toLowerCase()) || 
                p.category?.toLowerCase() === CATEGORY.toLowerCase()
            );

            renderProperties(allProperties);
        } catch (error) {
            console.error("Fetch failed", error);
            resultsCount.innerText = "Error loading properties";
        }
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProperties.filter(p => 
            p.location.toLowerCase().includes(term) || 
            p.type.toLowerCase().includes(term)
        );
        renderProperties(filtered);
    });

    fetchProperties();
});
