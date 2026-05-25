document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://backend.househunt.live';
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    if (!propertyId) {
        console.error('No property ID provided');
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/properties`);
        const allProperties = await response.json();
        const p = allProperties.find(item => item.id == propertyId);

        if (!p) {
            console.error('Property not found');
            return;
        }

        // --- Basic Info ---
        document.querySelector('.price').textContent = `₹ ${p.price}`;
        document.querySelector('.type-tag').textContent = `For ${p.intent}`;
        document.querySelector('.title').textContent = p.title || `${p.property_type} in ${p.city}`;
        document.querySelector('.location').innerHTML = `<i data-lucide="map-pin"></i> ${p.location_text || p.location}`;
        document.querySelector('.main-img').src = (p.images && p.images[0]) || p.image || '../assets/mainappicon.png';
        document.querySelector('.description p').textContent = p.description || 'No description available.';

        // --- Dynamic Stats Grid ---
        const statsGrid = document.querySelector('.stats-grid');
        statsGrid.innerHTML = ''; 

        const details = p.details || {};
        
        // Define mappings for important fields
        const statMappings = [
            { key: 'area', label: 'Sqft', icon: 'maximize' },
            { key: 'bhk', label: '', icon: 'bed' },
            { key: 'beds', label: 'Beds', icon: 'bed' },
            { key: 'bath', label: 'Bath', icon: 'bath' },
            { key: 'floor', label: 'Floor', icon: 'layers', prefix: 'Floor ' },
            { key: 'facing', label: 'Facing', icon: 'navigation' },
            { key: 'furnishing', label: '', icon: 'armchair' },
            { key: 'plot_area', label: 'Plot Area', icon: 'map' }
        ];

        statMappings.forEach(m => {
            if (details[m.key]) {
                let value = details[m.key];
                if (m.prefix) value = m.prefix + value;
                if (m.label) value = value + ' ' + m.label;
                addStat(statsGrid, m.icon, value);
            }
        });

        // --- Dynamic Amenities ---
        const amenityGrid = document.querySelector('.amenity-grid');
        amenityGrid.innerHTML = '';
        
        // Collect everything else into a list of "Extra Features"
        const skipKeys = ['area', 'bhk', 'beds', 'bath', 'floor', 'facing', 'furnishing', 'plot_area', 'carpet_area', 'total_floors', 'built_up', 'rent', 'deposit', 'price', 'desc'];
        
        Object.entries(details).forEach(([key, val]) => {
            if (skipKeys.includes(key)) return;
            
            if (Array.isArray(val)) {
                val.forEach(item => addAmenity(amenityGrid, item));
            } else if (typeof val === 'boolean' && val === true) {
                // Convert key like 'gated_society' to 'Gated Society'
                const label = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                addAmenity(amenityGrid, label);
            } else if (typeof val === 'string' && val.length > 0 && val !== 'all') {
                addAmenity(amenityGrid, val);
            }
        });

        if (amenityGrid.innerHTML === '') {
            document.querySelector('.amenities').style.display = 'none';
        }

        // --- Seller Info ---
        if (p.owner_name) {
            document.querySelector('.seller-info h4').textContent = p.owner_name;
        }

        if (window.lucide) window.lucide.createIcons();

    } catch (err) {
        console.error('Error loading property:', err);
    }

    function addStat(container, icon, text) {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.innerHTML = `<i data-lucide="${icon}"></i><span>${text}</span>`;
        container.appendChild(div);
    }

    function addAmenity(container, label) {
        const div = document.createElement('div');
        div.className = 'amenity-item';
        // Simple heuristic for icons
        let icon = 'check-circle';
        if (label.toLowerCase().includes('parking')) icon = 'parking-circle';
        if (label.toLowerCase().includes('power')) icon = 'zap';
        if (label.toLowerCase().includes('security')) icon = 'shield-check';
        if (label.toLowerCase().includes('water')) icon = 'droplet';
        
        div.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;
        container.appendChild(div);
    }
});
