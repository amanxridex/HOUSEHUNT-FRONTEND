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

    const createImageUpload = () => {
        let boxes = '';
        for (let i = 0; i < 6; i++) {
            boxes += `
                <div class="upload-box empty-box" id="upload-box-${i}" onclick="triggerFileInput(${i})">
                    <i data-lucide="image-plus"></i>
                    <img src="" alt="preview" style="display:none;" id="preview-${i}">
                    <button type="button" class="remove-btn" id="remove-btn-${i}" onclick="removeImage(event, ${i})" style="display:none;"><i data-lucide="x"></i></button>
                    <input type="file" id="fileInput-${i}" accept="image/*" style="display: none;" onchange="handleImageSelect(event, ${i})">
                </div>
            `;
        }
        return `
        <div class="form-group">
            <label>Add Property Images (Choose up to 6, Min 2 Required)</label>
            <div class="image-upload-grid" id="imageGrid">
                ${boxes}
            </div>
        </div>
        `;
    };

    // --- PROPERTY SCHEMAS ---
    const schemas = {
        apartment: [
            {
                title: 'Media & Photos', icon: 'image', content: `
                ${createImageUpload()}
            `},
            {
                title: 'Property Configuration', icon: 'settings', content: `
                ${createChips('BHK Type', 'bhk', ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'])}
                ${createInput('Carpet Area (Sqft)', 'carpet_area', 'number', 'maximize')}
                ${createInput('Total Floors', 'total_floors', 'number', 'layers')}
                ${createInput('Floor Number', 'floor', 'number', 'layers')}
                ${createChips('Facing', 'facing', ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'])}
                ${createChips('Furnishing Status', 'furnishing', ['Unfurnished', 'Semi-Furnished', 'Fully-Furnished'])}
                ${createChips('Preferred Tenants', 'tenants', ['Bachelors', 'Family', 'Company Lease', 'Any'])}
            `},
            {
                title: 'Address & Location', icon: 'map-pin', content: `
                ${createInput('City', 'city_input', 'text', 'map', 'e.g. Noida')}
                ${createInput('State', 'state_input', 'text', 'map', 'e.g. Uttar Pradesh')}
                ${createTextArea('Full Address', 'address_input', 'e.g. Sector 62, Near Metro Station')}
            `},
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
                title: 'Pricing & Brokerage', icon: 'banknote', content: `
                ${createInput('Monthly Rent', 'price', 'number', 'indian-rupee')}
                ${createInput('Security Deposit', 'deposit', 'number', 'shield')}
                ${createInput('Maintenance (Monthly)', 'maint', 'number', 'settings')}
                ${createToggle('Rent Negotiable', 'negotiable')}
                ${createChips('Brokerage', 'brokerage', ['None', '15 Days', '1 Month'])}
            `},
            {
                title: 'Address & Location', icon: 'map-pin', content: `
                ${createInput('City', 'city_input', 'text', 'map', 'e.g. Noida')}
                ${createInput('State', 'state_input', 'text', 'map', 'e.g. Uttar Pradesh')}
                ${createTextArea('Full Address', 'address_input', 'e.g. Sector 62, Near Metro Station')}
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
                ${createChips('Furnishing', 'furnishing', ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'])}
            `},
            {
                title: 'Pricing & Terms', icon: 'banknote', content: `
                ${createInput('Monthly Rent', 'rent', 'number', 'indian-rupee')}
                ${createInput('Security Deposit', 'deposit', 'number', 'shield')}
                ${createChips('Maintenance', 'maintenance', ['Included', 'Extra'])}
            `},
            {
                title: 'Description', icon: 'file-text', content: `
                ${createTextArea('Full Description', 'desc')}
            `}
        ],
        commercial: [
            {
                title: 'Media & Photos', icon: 'image', content: `
                ${createImageUpload()}
            `},
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

    // --- IMAGE HANDLING ---
    window.imageFiles = [null, null, null, null, null, null];

    window.triggerFileInput = (index) => {
        document.getElementById(`fileInput-${index}`).click();
    };

    window.handleImageSelect = (event, index) => {
        const file = event.target.files[0];
        if (file) {
            window.imageFiles[index] = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                const box = document.getElementById(`upload-box-${index}`);
                const img = document.getElementById(`preview-${index}`);
                const removeBtn = document.getElementById(`remove-btn-${index}`);
                
                box.classList.remove('empty-box');
                box.classList.add('filled-box');
                
                img.src = e.target.result;
                img.style.display = 'block';
                removeBtn.style.display = 'flex';
                
                // Hide the plus icon
                const icon = box.querySelector('.lucide-image-plus');
                if (icon) icon.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
        event.target.value = ''; // reset
    };

    window.removeImage = (event, index) => {
        event.stopPropagation(); // prevent opening file selector
        window.imageFiles[index] = null;
        
        const box = document.getElementById(`upload-box-${index}`);
        const img = document.getElementById(`preview-${index}`);
        const removeBtn = document.getElementById(`remove-btn-${index}`);
        
        box.classList.remove('filled-box');
        box.classList.add('empty-box');
        
        img.src = '';
        img.style.display = 'none';
        removeBtn.style.display = 'none';
        
        // Show the plus icon
        const icon = box.querySelector('.lucide-image-plus');
        if (icon) icon.style.display = 'block';
    };

    // --- INTERACTIVITY ---
    
    // Accordion Logic
    formContainer.addEventListener('click', (e) => {
        const header = e.target.closest('.section-header');
        if (header) {
            const section = header.parentElement;
            const wasActive = section.classList.contains('active');
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

    // --- SUBMIT LOGIC ---
    const BACKEND_URL = 'https://backend.househunt.live';

    document.getElementById('submitBtn').addEventListener('click', async () => {
        const actualFilesToUpload = window.imageFiles.filter(f => f !== null);
        if (actualFilesToUpload.length < 2) {
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
            actualFilesToUpload.forEach(file => imageFormData.append('images', file));
            
            const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
                method: 'POST',
                body: imageFormData
            });
            
            if (!uploadRes.ok) throw new Error('Image upload failed');
            const { urls } = await uploadRes.json();

            // 3. Gather All Data
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const contactDetails = JSON.parse(sessionStorage.getItem('househunt_contact_details') || '{}');
            
            const cityInput = document.getElementById('city_input')?.value || localStorage.getItem('userCity') || 'Unknown';
            const stateInput = document.getElementById('state_input')?.value || '';
            const addressInput = document.getElementById('address_input')?.value || '';
            const fullLocationText = [addressInput, cityInput, stateInput].filter(Boolean).join(', ');

            if (!user.uid) {
                alert("Please log in to post a property.");
                window.location.href = 'login.html';
                return;
            }

            let dbPropertyType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
            if (dbPropertyType === 'Independent') dbPropertyType = 'Independent House';

            let draftId = sessionStorage.getItem('househunt_draft_id');

            const formData = {
                owner_id: user.uid,
                title: `${dbPropertyType} for Rent in ${cityInput}`,
                description: desc,
                property_type: dbPropertyType,
                intent: 'Rent',
                price: parseFloat(document.getElementById('rent')?.value || document.getElementById('price')?.value || 0),
                location_text: fullLocationText,
                city: cityInput,
                images: urls,
                details: {
                    state: stateInput,
                    address: addressInput
                }
            };

            if (draftId) formData.id = draftId;

            // Collect all inputs
            document.querySelectorAll('input[id], textarea[id]').forEach(input => {
                if (['rent', 'price', 'deposit', 'desc', 'fileInput', 'city_input', 'state_input', 'address_input'].includes(input.id)) return;
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

            // 5. Clear draft
            sessionStorage.removeItem('househunt_draft_id');
            sessionStorage.removeItem('househunt_basic_details');
            sessionStorage.removeItem('househunt_contact_details');

        } catch (err) {
            console.error("Submission error:", err);
            loading.style.display = 'none';
            errorView.style.display = 'block';
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [errorView] });
        }
    });
});

