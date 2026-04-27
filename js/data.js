const types = [
    'Apartment', 'Villa', 'Independent House', 'Plot', 
    'Commercial Office', 'Shop', 'Showroom', 'Warehouse', 'Co-working'
];

for (let i = 1; i <= 250; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const intent = intents[Math.floor(Math.random() * intents.length)];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const imgId = unsplashIds[Math.floor(Math.random() * unsplashIds.length)];
    
    let price;
    if (intent === 'Rent') {
        price = `₹ ${Math.floor(Math.random() * 80 + 10)},000`;
    } else {
        const p = (Math.random() * 5 + 0.5).toFixed(2);
        price = p > 1 ? `₹ ${p} Cr` : `₹ ${Math.floor(p * 100)} L`;
    }

    properties.push({
        id: i,
        type: type,
        intent: intent,
        location: loc,
        price: price,
        image: `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&w=800&q=80`,
        area: `${Math.floor(Math.random() * 3000 + 500)} sqft`,
        beds: (type.includes('Plot') || type.includes('Commercial') || type.includes('Shop') || type.includes('Warehouse') || type.includes('Showroom') || type.includes('Office')) ? null : Math.floor(Math.random() * 4 + 1) + ' BHK',
        tag: i % 7 === 0 ? 'Verified' : i % 5 === 0 ? 'New Launch' : 'Featured'
    });
}

window.propertyData = properties;
