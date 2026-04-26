document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') { lucide.createIcons(); }

    const basicDetails = JSON.parse(sessionStorage.getItem('househunt_basic_details') || '{}');
    const propertyType = (basicDetails.type || 'apartment').toLowerCase();
    const formContainer = document.getElementById('dynamic-fields');
    const appContainer = document.querySelector('.app-container');

    // Apply Premium Villa Theme
    if (propertyType === 'villa') {
        appContainer.classList.add('villa-theme');
    }

    // Update Header Title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = `Rent ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}`;
    }

    // --- FORM RENDERER ---
    const renderSection = (title, icon, content) => `
        <div class="section">
            <div class="section-header">
                <h2><i data-lucide="${icon}"></i> ${title}</h2>
                <i data-lucide="chevron-down" class="chevron"></i>
            </div>
            <div class="section-content">
                ${content}
            </div>
        </div>
    `;

    const createInput = (label, id, type = 'number', icon = 'edit-3', placeholder = '') => `
        <div class="form-group">
            <label>${label}</label>
            <div class="input-container">
                <i data-lucide="${icon}"></i>
                <input type="${type}" id="${id}" placeholder="${placeholder}">
            </div>
        </div>
    `;

    const createChips = (label, id, options, multi = false) => `
        <div class="form-group">
            <label>${label}</label>
            <div class="choice-grid" data-id="${id}" data-multi="${multi}">
                ${options.map((opt, i) => `<div class="chip ${i === 0 && !multi ? 'active' : ''}">${opt}</div>`).join('')}
            </div>
        </div>
    `;

    const createToggle = (label, id) => `
        <div class="toggle-group">
            <span>${label}</span>
            <label class="switch">
                <input type="checkbox" id="${id}">
                <span class="slider"></span>
            </label>
        </div>
    `;

    const createTextArea = (label, id, placeholder = '') => `
        <div class="form-group">
            <label>${label}</label>
            <div class="input-container">
                <textarea id="${id}" placeholder="${placeholder}"></textarea>
            </div>
        </div>
    `;

    // --- PROPERTY SCHEMAS ---
    const schemas = {
        apartment: [
            {
                title: 'Pricing & Charges', icon: 'banknote', content: `
                ${createInput('Monthly Rent', 'rent', 'number', 'indian-rupee', 'e.g. 25000')}
                ${createToggle('Rent Negotiable', 'negotiable')}
                ${createInput('Security Deposit', 'deposit', 'number', 'shield-check', 'e.g. 50000')}
                ${createChips('Maintenance', 'maintenance', ['Included', 'Extra'])}
                ${createChips('Brokerage', 'brokerage', ['None', 'Fee Charged'])}
                ${createInput('Parking Charges', 'parking_fee', 'number', 'car')}
                ${createChips('Electricity', 'electricity', ['Metered', 'Included', 'Fixed'])}
                ${createChips('Water', 'water', ['Included', 'Extra'])}
            `},
            {
                title: 'Availability & Lease', icon: 'calendar', content: `
                ${createInput('Available From', 'avail_date', 'date', 'calendar')}
                ${createInput('Min Lease (Months)', 'lease_duration', 'number', 'clock')}
                ${createInput('Notice Period (Days)', 'notice_period', 'number', 'bell')}
                ${createChips('Status', 'status', ['Ready to move', 'Under maintenance'])}
            `},
            {
                title: 'Tenant Preferences', icon: 'users', content: `
                ${createChips('Preferred Tenant', 'tenant_pref', ['Any', 'Family', 'Bachelor', 'Company'])}
                ${createChips('Gender Preference', 'gender', ['Any', 'Male', 'Female'])}
                ${createInput('Occupancy Limit', 'occupancy', 'number', 'user-plus')}
                ${createChips('Food Preference', 'food', ['Veg', 'Non-Veg', 'No Preference'])}
                ${createToggle('Pets Allowed', 'pets')}
            `},
            {
                title: 'Society & Amenities', icon: 'home', content: `
                ${createToggle('Gated Society', 'gated')}
                ${createChips('Amenities', 'amenities', ['Lift', 'Power Backup', 'Gym', 'Pool', 'Play Area'], true)}
            `},
            {
                title: 'Highlights', icon: 'star', content: `
                ${createChips('Features', 'highlights', ['Near Metro', 'Near School', 'Newly Built', 'Corner Flat', 'High Floor'], true)}
            `},
            {
                title: 'Description', icon: 'file-text', content: `
                ${createTextArea('Full Description (Required)', 'desc', 'Describe your property in detail (min 50 chars)...')}
            `}
        ],
        villa: [
            {
                title: 'Pricing', icon: 'banknote', content: `
                ${createInput('Monthly Rent', 'rent', 'number', 'indian-rupee')}
                ${createInput('Deposit', 'deposit', 'number', 'shield')}
                ${createInput('Maintenance/Society Charges', 'maint', 'number', 'settings')}
            `},
            {
                title: 'Luxury Features', icon: 'crown', content: `
                ${createToggle('Private Pool', 'pool')}
                ${createToggle('Private Garden', 'garden')}
                ${createToggle('Servant Room', 'servant')}
                ${createChips('Furnishing', 'furnishing', ['Unfurnished', 'Semi', 'Full'])}
            `},
            {
                title: 'Community', icon: 'shield', content: `
                ${createToggle('Gated Community', 'gated')}
                ${createToggle('Clubhouse Access', 'clubhouse')}
            `},
            {
                title: 'Description', icon: 'file-text', content: `
                ${createTextArea('Description', 'desc', 'Describe the luxury features...')}
            `}
        ],
        commercial: [
            {
                title: 'Pricing & Terms', icon: 'banknote', content: `
                ${createInput('Monthly Rent', 'rent', 'number', 'indian-rupee')}
                ${createToggle('GST Applicable', 'gst')}
                ${createInput('Lease Duration (Years)', 'lease', 'number', 'clock')}
                ${createInput('Rent Escalation (%)', 'escalation', 'number', 'trending-up')}
            `},
            {
                title: 'Property Use', icon: 'briefcase', content: `
                ${createChips('Suitable For', 'suitable', ['Office', 'Retail', 'Showroom', 'Warehouse'], true)}
            `},
            {
                title: 'Infrastructure', icon: 'zap', content: `
                ${createInput('Power Load (kW)', 'power', 'number', 'zap')}
                ${createInput('Washrooms', 'washrooms', 'number', 'droplet')}
                ${createToggle('Fire Safety Compliant', 'fire')}
            `},
            {
                title: 'Description', icon: 'file-text', content: `
                ${createTextArea('Description', 'desc')}
            `}
        ]
    };

    // Helper to get fallback schema
    const activeSchema = schemas[propertyType] || schemas.apartment;

    // --- RENDER ---
    formContainer.innerHTML = activeSchema.map(s => renderSection(s.title, s.icon, s.content)).join('');
    lucide.createIcons();

    // --- INTERACTIVITY ---
    
    // Accordion Logic
    formContainer.addEventListener('click', (e) => {
        const header = e.target.closest('.section-header');
        if (header) {
            const section = header.parentElement;
            const wasActive = section.classList.contains('active');
            
            // Close others (optional - keeps it clean)
            // document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            section.classList.toggle('active', !wasActive);
        }

        // Chip Logic
        if (e.target.classList.contains('chip')) {
            const grid = e.target.parentElement;
            const isMulti = grid.dataset.multi === 'true';
            
            if (isMulti) {
                e.target.classList.toggle('active');
            } else {
                grid.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
            }
        }
    });

    // Auto-open first section
    const firstSection = formContainer.querySelector('.section');
    if (firstSection) firstSection.classList.add('active');

    // Submit Logic
    document.getElementById('submitBtn').addEventListener('click', () => {
        const desc = document.getElementById('desc')?.value || '';
        if (desc.length < 50) {
            alert('Description must be at least 50 characters long.');
            return;
        }

        // Show Modal
        const modal = document.getElementById('submitModal');
        const loading = document.getElementById('modal-loading');
        const success = document.getElementById('modal-success');
        
        modal.classList.add('active');
        
        // Wait 5 seconds (simulating high-fidelity processing)
        setTimeout(() => {
            loading.style.display = 'none';
            success.style.display = 'block';
            lucide.createIcons({ nodes: [success] });
        }, 5000);
    });
});

