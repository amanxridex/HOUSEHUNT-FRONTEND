document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') { lucide.createIcons(); }

    const basicDetails = JSON.parse(sessionStorage.getItem('househunt_basic_details') || '{}');
    const propertyType = (basicDetails.type || 'apartment').toLowerCase();
    const formContainer = document.getElementById('dynamic-fields');
    const appContainer = document.querySelector('.app-container');
    const pageTitle = document.getElementById('page-title');

    if (pageTitle) {
        pageTitle.textContent = `Sell ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}`;
    }

    if (propertyType === 'villa') {
        appContainer.classList.add('villa-theme');
    }

    // --- RENDER HELPERS ---
    const renderSection = (title, icon, content) => `
        <div class="section">
            <div class="section-header">
                <h2><i data-lucide="${icon}"></i> ${title}</h2>
                <i data-lucide="chevron-down" class="chevron"></i>
            </div>
            <div class="section-content">${content}</div>
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

    // --- SELL SCHEMAS ---
    const schemas = {
        apartment: [
            {
                title: 'Pricing & Brokerage', icon: 'banknote', content: `
                ${createInput('Total Price', 'price', 'number', 'indian-rupee', 'e.g. 75,00,000')}
                ${createToggle('Price Negotiable', 'negotiable')}
                ${createInput('Price per Sq. Ft.', 'sqft_price', 'number', 'calculator')}
                ${createInput('Monthly Maintenance', 'maint', 'number', 'settings')}
                ${createChips('Brokerage', 'brokerage', ['None', 'Fee Charged'])}
            `},
            {
                title: 'Ownership & Legal', icon: 'file-text', content: `
                ${createChips('Ownership Type', 'ownership', ['Freehold', 'Leasehold', 'Co-op'])}
                ${createChips('Property Age', 'age', ['Ready', '0-1 yr', '1-5 yrs', '5-10 yrs', '10+ yrs'])}
                ${createChips('Possession', 'possession', ['Immediate', 'Within 3m', 'Within 6m'])}
                ${createToggle('RERA Registered', 'rera')}
                ${createToggle('Bank Loan Approved', 'loan_approved')}
                ${createToggle('Currently Under Loan', 'under_loan')}
            `},
            {
                title: 'Society & Features', icon: 'home', content: `
                ${createInput('Society Name', 'society', 'text', 'building-2', 'e.g. DLF Magnolias')}
                ${createToggle('Gated Society', 'gated')}
                ${createChips('Highlights', 'highlights', ['Near Metro', 'High Floor', 'Park Facing', 'Newly Built'], true)}
            `},
            {
                title: 'Description', icon: 'edit-2', content: `
                ${createTextArea('Description (Strong Pitch)', 'desc', 'Why should someone buy this property? (min 50 chars)')}
            `}
        ],
        plot: [
            {
                title: 'Pricing', icon: 'banknote', content: `
                ${createInput('Total Price', 'price', 'number', 'indian-rupee')}
                ${createInput('Price per Sq. Yd/Ft', 'price_unit', 'number', 'calculator')}
                ${createToggle('Negotiable', 'negotiable')}
            `},
            {
                title: 'Legal & Ownership', icon: 'shield-check', content: `
                ${createChips('Plot Type', 'plot_type', ['Residential', 'Commercial', 'Agricultural'])}
                ${createToggle('Title Clear', 'title_clear')}
                ${createToggle('Registry Available', 'registry')}
                ${createChips('Approved By', 'authority', ['DDA', 'Local Auth', 'NA'])}
            `},
            {
                title: 'Land Details', icon: 'map', content: `
                ${createInput('Plot Area', 'area', 'number', 'maximize')}
                ${createChips('Facing', 'facing', ['East', 'West', 'North', 'South'])}
                ${createInput('Road Width (Ft)', 'road', 'number', 'move-horizontal')}
                ${createToggle('Boundary Wall', 'boundary')}
            `},
            {
                title: 'Description', icon: 'edit-2', content: `
                ${createTextArea('Description', 'desc')}
            `}
        ],
        commercial: [
            {
                title: 'Pricing & ROI', icon: 'banknote', content: `
                ${createInput('Total Price', 'price', 'number', 'indian-rupee')}
                ${createInput('Current Rent (if any)', 'rent', 'number', 'trending-up')}
                ${createInput('Expected ROI %', 'roi', 'number', 'percent')}
                ${createToggle('GST Applicable', 'gst')}
            `},
            {
                title: 'Property Usage', icon: 'briefcase', content: `
                ${createChips('Best Suited For', 'suitable', ['Office', 'Retail', 'Showroom', 'Warehouse'], true)}
                ${createChips('Occupancy Status', 'occupancy', ['Vacant', 'Rented Out'])}
            `},
            {
                title: 'Infrastructure', icon: 'zap', content: `
                ${createInput('Power Load (kW)', 'power', 'number', 'zap')}
                ${createToggle('Fire Safety Compliant', 'fire')}
            `},
            {
                title: 'Description', icon: 'edit-2', content: `
                ${createTextArea('Description', 'desc')}
            `}
        ],
        villa: [
            {
                title: 'Premium Pricing', icon: 'banknote', content: `
                ${createInput('Total Price', 'price', 'number', 'indian-rupee')}
                ${createInput('Built-up Area (Sqft)', 'area', 'number', 'maximize')}
            `},
            {
                title: 'Luxury Amenities', icon: 'crown', content: `
                ${createToggle('Private Pool', 'pool')}
                ${createToggle('Private Garden', 'garden')}
                ${createToggle('Smart Home', 'smart')}
                ${createToggle('Servant Room', 'servant')}
            `},
            {
                title: 'Description', icon: 'edit-2', content: `
                ${createTextArea('Description', 'desc')}
            `}
        ]
    };

    const activeSchema = schemas[propertyType] || schemas.apartment;
    formContainer.innerHTML = activeSchema.map(s => renderSection(s.title, s.icon, s.content)).join('');
    lucide.createIcons();

    // --- INTERACTIVITY ---
    formContainer.addEventListener('click', (e) => {
        const header = e.target.closest('.section-header');
        if (header) {
            header.parentElement.classList.toggle('active');
        }

        if (e.target.classList.contains('chip')) {
            const grid = e.target.parentElement;
            if (grid.dataset.multi === 'true') {
                e.target.classList.toggle('active');
            } else {
                grid.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
            }
        }
    });

    // Auto-open first
    const first = formContainer.querySelector('.section');
    if (first) first.classList.add('active');

    // Submit
    document.getElementById('submitBtn').addEventListener('click', () => {
        const desc = document.getElementById('desc')?.value || '';
        if (desc.length < 50) {
            alert('Description must be at least 50 characters.');
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
