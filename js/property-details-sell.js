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

    const createImageUpload = () => `
        <div class="form-group">
            <label>Add Property Images (Max 6, Min 2 Required)</label>
            <div class="image-upload-grid" id="imageGrid">
                <div class="upload-box add-box" onclick="document.getElementById('fileInput').click()">
                    <i data-lucide="plus"></i>
                </div>
                <!-- Previews will appear here -->
            </div>
            <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
        </div>
    `;

    // --- SELL SCHEMAS ---
    const schemas = {
        apartment: [
            {
                title: 'Media & Photos', icon: 'image', content: `
                ${createImageUpload()}
            `},
            {
                title: 'Property Configuration', icon: 'settings', content: `
                ${createChips('BHK Type', 'bhk', ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'])}
                ${createInput('Super Area (Sqft)', 'area', 'number', 'maximize')}
                ${createInput('Carpet Area (Sqft)', 'carpet_area', 'number', 'maximize')}
                ${createInput('Total Floors', 'total_floors', 'number', 'layers')}
                ${createInput('Floor Number', 'floor', 'number', 'layers')}
                ${createChips('Facing', 'facing', ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'])}
                ${createChips('Furnishing Status', 'furnishing', ['Unfurnished', 'Semi-Furnished', 'Ready to Move'])}
            `},
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
                title: 'Media & Photos', icon: 'image', content: `
                ${createImageUpload()}
            `},
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
                title: 'Media & Photos', icon: 'image', content: `
                ${createImageUpload()}
            `},
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
                title: 'Media & Photos', icon: 'image', content: `
                ${createImageUpload()}
            `},
            {
                title: 'Villa Configuration', icon: 'settings', content: `
                ${createInput('Bedrooms', 'beds', 'number', 'bed')}
                ${createInput('Bathrooms', 'bath', 'number', 'droplet')}
                ${createInput('Plot Area (Sqft)', 'area', 'number', 'maximize')}
                ${createInput('Built-up Area (Sqft)', 'built_up', 'number', 'maximize')}
                ${createInput('Total Floors', 'total_floors', 'number', 'layers')}
                ${createChips('Facing', 'facing', ['East', 'West', 'North', 'South'])}
            `},
            {
                title: 'Premium Pricing', icon: 'banknote', content: `
                ${createInput('Total Price', 'price', 'number', 'indian-rupee')}
                ${createInput('Monthly Maintenance', 'maint', 'number', 'settings')}
                ${createToggle('Price Negotiable', 'negotiable')}
            `},
            {
                title: 'Luxury Amenities', icon: 'crown', content: `
                ${createToggle('Private Pool', 'pool')}
                ${createToggle('Private Garden', 'garden')}
                ${createToggle('Home Gym', 'gym')}
                ${createToggle('Home Theatre', 'theatre')}
                ${createChips('Furnishing', 'furnishing', ['Bare Shell', 'Semi', 'Lux-Furnished'])}
            `},
            {
                title: 'Description', icon: 'edit-2', content: `
                ${createTextArea('Description', 'desc')}
            `}
        ],
        independent: [
            {
                title: 'Media & Photos', icon: 'image', content: `
                ${createImageUpload()}
            `},
            {
                title: 'House Configuration', icon: 'settings', content: `
                ${createChips('BHK Type', 'bhk', ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'])}
                ${createInput('Built-up Area (Sqft)', 'area', 'number', 'maximize')}
                ${createInput('Plot Area (Sqft)', 'plot_area', 'number', 'maximize')}
                ${createInput('Total Floors', 'total_floors', 'number', 'layers')}
                ${createChips('Facing', 'facing', ['East', 'West', 'North', 'South'])}
                ${createChips('Furnishing Status', 'furnishing', ['Unfurnished', 'Semi-Furnished', 'Ready to Move'])}
            `},
            {
                title: 'Pricing & Brokerage', icon: 'banknote', content: `
                ${createInput('Total Price', 'price', 'number', 'indian-rupee')}
                ${createToggle('Price Negotiable', 'negotiable')}
                ${createChips('Brokerage', 'brokerage', ['None', 'Fee Charged'])}
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

    // --- IMAGE HANDLING ---
    let selectedFiles = [];
    const fileInput = document.getElementById('fileInput');
    const imageGrid = document.getElementById('imageGrid');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (selectedFiles.length + files.length > 6) {
                alert('Max 6 images allowed');
                return;
            }

            files.forEach(file => {
                selectedFiles.push(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                    const box = document.createElement('div');
                    box.className = 'upload-box';
                    box.innerHTML = `
                        <img src="${event.target.result}" alt="preview">
                        <button class="remove-btn" data-name="${file.name}">&times;</button>
                    `;
                    imageGrid.insertBefore(box, imageGrid.firstChild);
                };
                reader.readAsDataURL(file);
            });
            fileInput.value = ''; // Reset for next selection
        });
    }

    if (imageGrid) {
        imageGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const name = e.target.dataset.name;
                selectedFiles = selectedFiles.filter(f => f.name !== name);
                e.target.parentElement.remove();
            }
        });
    }

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

    // --- SUBMIT LOGIC ---
    const BACKEND_URL = 'https://househunt-backend-h19r.onrender.com';

    document.getElementById('submitBtn').addEventListener('click', async () => {
        if (selectedFiles.length < 2) {
            alert('Please upload at least 2 images of the property.');
            return;
        }

        const desc = document.getElementById('desc')?.value || '';
        if (desc.length < 50) {
            alert('Description must be at least 50 characters long.');
            return;
        }

        // 1. Show Modal (Loading State)
        const modal = document.getElementById('submitModal');
        const loading = document.getElementById('modal-loading');
        const success = document.getElementById('modal-success');
        const errorView = document.createElement('div');
        errorView.id = 'modal-error';
        errorView.style.display = 'none';
        errorView.style.textAlign = 'center';
        errorView.innerHTML = `<i data-lucide="x-circle" style="color: #ef4444; width: 64px; height: 64px;"></i><h2 style="margin-top: 15px;">Submission Failed</h2><p>Something went wrong. Please try again.</p><button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; border-radius: 12px; border: none; background: #111; color: white; font-weight: 700;">Try Again</button>`;
        loading.parentElement.appendChild(errorView);
        
        modal.classList.add('active');
        loading.style.display = 'block';
        success.style.display = 'none';

        try {
            // 2. Upload Images First
            const imageFormData = new FormData();
            selectedFiles.forEach(file => imageFormData.append('images', file));
            
            const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
                method: 'POST',
                body: imageFormData
            });
            
            if (!uploadRes.ok) throw new Error('Image upload failed');
            const { urls } = await uploadRes.json();

            // 3. Gather All Data
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const contactDetails = JSON.parse(sessionStorage.getItem('househunt_contact_details') || '{}');
            const city = localStorage.getItem('userCity') || 'Unknown';

            if (!user.uid) {
                alert("Please log in to post a property.");
                window.location.href = 'login.html';
                return;
            }

            let dbPropertyType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
            if (dbPropertyType === 'Independent') dbPropertyType = 'Independent House';

            const formData = {
                owner_id: user.uid,
                owner_name: user.name || contactDetails.name,
                title: `${dbPropertyType} for Sale in ${city}`,
                description: desc,
                property_type: dbPropertyType,
                intent: 'Buy',
                price: document.getElementById('price')?.value || 0,
                location_text: city,
                city: city,
                images: urls, // Use uploaded URLs
                details: {}
            };

            // Collect all inputs
            document.querySelectorAll('input[id], textarea[id]').forEach(input => {
                if (['price', 'desc', 'fileInput'].includes(input.id)) return;
                if (input.type === 'checkbox') {
                    formData.details[input.id] = input.checked;
                } else {
                    formData.details[input.id] = input.value;
                }
            });

            // Collect all chips
            document.querySelectorAll('.choice-grid').forEach(grid => {
                const id = grid.dataset.id;
                const active = Array.from(grid.querySelectorAll('.chip.active')).map(c => c.textContent);
                formData.details[id] = grid.dataset.multi === 'true' ? active : active[0];
            });

            // 3. Send to Backend
            const response = await fetch(`${BACKEND_URL}/api/properties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to post property');

            // 4. Show Success
            loading.style.display = 'none';
            success.style.display = 'block';
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [success] });

        } catch (err) {
            console.error("Submission error:", err);
            loading.style.display = 'none';
            errorView.style.display = 'block';
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [errorView] });
        }
    });
});
