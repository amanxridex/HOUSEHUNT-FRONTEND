document.addEventListener('DOMContentLoaded', async () => {
    if (typeof lucide !== 'undefined') { lucide.createIcons(); }

    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    const spinner = document.getElementById('loading-spinner');
    const dashboard = document.getElementById('dashboard');

    if (!propertyId) {
        spinner.innerHTML = `<i data-lucide="alert-circle" style="color: #ef4444; width: 40px; height: 40px;"></i><p>Property ID is missing.</p><button onclick="window.location.href='my-properties.html'" style="margin-top: 15px; padding: 10px 20px; border-radius: 8px; border: none; background: #2d68ff; color: white;">Go Back</button>`;
        lucide.createIcons();
        return;
    }

    try {
        // Fetch property details from backend
        const BACKEND_URL = 'https://backend.househunt.live';
        const res = await fetch(`${BACKEND_URL}/api/properties/${propertyId}`);
        if (!res.ok) throw new Error('Property not found');
        const property = await res.json();

        // Populate Property Info
        document.getElementById('prop-title').textContent = property.title || property.property_type;
        document.getElementById('prop-loc').textContent = property.location_text || property.city || 'Location N/A';
        
        const formattedPrice = property.price ? '₹ ' + (property.price >= 10000000 ? (property.price/10000000).toFixed(2) + ' Cr' : (property.price/100000).toFixed(2) + ' L') : 'Price on request';
        document.getElementById('prop-price').textContent = formattedPrice;

        if (property.images && property.images.length > 0) {
            document.getElementById('prop-image').src = property.images[0];
        }

        const isPending = property.status === 'pending';
        const isRejected = property.status === 'rejected';
        const statusEl = document.getElementById('prop-status');
        
        if (isPending) {
            statusEl.textContent = 'Pending Review';
            statusEl.style.background = '#fef3c7';
            statusEl.style.color = '#f59e0b';
        } else if (isRejected) {
            statusEl.textContent = 'Rejected';
            statusEl.style.background = '#fee2e2';
            statusEl.style.color = '#ef4444';
        }

        // Mock Analytics Data Generation (Based on how long it's been active or just random for now)
        // In the future, this will come from the backend.
        let baseMultiplier = isPending ? 0 : Math.floor(Math.random() * 50) + 10;
        
        const impressions = isPending ? 0 : Math.floor(baseMultiplier * 124.5);
        const clicks = isPending ? 0 : Math.floor(impressions * (Math.random() * 0.15 + 0.05)); // 5-20% CTR
        const calls = isPending ? 0 : Math.floor(clicks * (Math.random() * 0.1 + 0.02));
        const chats = isPending ? 0 : Math.floor(clicks * (Math.random() * 0.1 + 0.05));
        const leads = calls + chats;

        const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : 0;
        const convRate = clicks > 0 ? ((leads / clicks) * 100).toFixed(1) : 0;

        // Animate numbers
        animateValue('val-impressions', 0, impressions, 1500);
        animateValue('val-clicks', 0, clicks, 1500);
        animateValue('val-leads', 0, leads, 1500);
        animateValue('breakdown-calls', 0, calls, 1500);
        animateValue('breakdown-chats', 0, chats, 1500);

        document.getElementById('conv-clicks').textContent = `${ctr}% CTR`;
        document.getElementById('conv-leads').textContent = `${convRate}% Conv.`;

        // Hide spinner and show dashboard
        spinner.style.display = 'none';
        dashboard.style.display = 'block';

        // Animate progress bars
        setTimeout(() => {
            document.getElementById('bar-clicks').style.width = `${Math.min(ctr * 2, 100)}%`; // Scaled for visual effect
            document.getElementById('bar-leads').style.width = `${Math.min(convRate * 2, 100)}%`;
        }, 300);

    } catch (error) {
        console.error('Failed to load analytics:', error);
        spinner.innerHTML = `<i data-lucide="alert-circle" style="color: #ef4444; width: 40px; height: 40px;"></i><p>Could not load analytics. Please try again later.</p>`;
        lucide.createIcons();
    }
});

function animateValue(id, start, end, duration) {
    if (start === end) {
        document.getElementById(id).innerHTML = end.toLocaleString();
        return;
    }
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing function
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(easeProgress * (end - start) + start);
        document.getElementById(id).innerHTML = current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
