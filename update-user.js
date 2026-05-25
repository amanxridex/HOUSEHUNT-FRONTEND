const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace developers grid in HTML safely
const htmlOld = `<div class="developers-grid">
                <a href="#" class="dev-card"><div class="dev-logo">DLF</div><span>DLF</span></a>
                <a href="#" class="dev-card"><div class="dev-logo">M3M</div><span>M3M</span></a>
                <a href="#" class="dev-card"><div class="dev-logo">LOD</div><span>Lodha</span></a>
                <a href="#" class="dev-card"><div class="dev-logo">SOB</div><span>Sobha</span></a>
                <a href="#" class="dev-card"><div class="dev-logo">PRE</div><span>Prestige</span></a>
                <a href="#" class="dev-card"><div class="dev-logo">OMA</div><span>Omaxe</span></a>
            </div>`;

const htmlNew = `<div class="developers-grid" id="dynamic-developers-grid">
                <!-- Fetched dynamically from database -->
                <div class="skeleton" style="width: 100%; height: 80px; border-radius: 12px;"></div>
                <div class="skeleton" style="width: 100%; height: 80px; border-radius: 12px;"></div>
                <div class="skeleton" style="width: 100%; height: 80px; border-radius: 12px;"></div>
            </div>`;

html = html.replace(htmlOld, htmlNew);
fs.writeFileSync('index.html', html);

let js = fs.readFileSync('js/index.js', 'utf8');
const jsUpdates = `
async function fetchAndRenderDevelopers() {
    const grid = document.getElementById('dynamic-developers-grid');
    if (!grid) return;

    try {
        const response = await fetch(\`\${BACKEND_URL}/api/developers\`);
        const developers = await response.json();
        
        grid.innerHTML = ''; // clear skeletons
        
        if (developers.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666;">No developers listed yet.</p>';
            return;
        }

        developers.forEach(dev => {
            const a = document.createElement('a');
            a.className = 'dev-card';
            a.href = dev.link || '#';
            if (dev.link) a.target = '_blank';
            
            a.innerHTML = \`
                <div class="dev-logo">\${dev.short_code}</div>
                <span>\${dev.name}</span>
            \`;
            grid.appendChild(a);
        });
    } catch (err) {
        console.error('Error fetching developers:', err);
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Failed to load developers</p>';
    }
}

// Call it inside DOMContentLoaded
`;

// Append function and call it
if (!js.includes('fetchAndRenderDevelopers')) {
    js += '\n' + jsUpdates;
    // Call it somewhere inside the DOMContentLoaded block where it initializes
    js = js.replace("fetchAndRenderProperties();", "fetchAndRenderProperties();\n    fetchAndRenderDevelopers();");
    fs.writeFileSync('js/index.js', js);
}
