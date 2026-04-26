const properties = [];
const types = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial Office'];
const intents = ['Buy', 'Rent'];
const locations = [
    'Sector 62, Noida', 'Sector 15, Noida', 'Sector 150, Noida', 
    'Indirapuram, Ghaziabad', 'Crossings Republik, Ghaziabad',
    'South Ext, Delhi', 'Dwarka Sector 10, Delhi', 'Vasant Kunj, Delhi',
    'DLF Phase 3, Gurgaon', 'Golf Course Road, Gurgaon', 'Sohna Road, Gurgaon',
    'Greater Noida West', 'Knowledge Park, Greater Noida'
];

const unsplashIds = [
    '1580587767513-399888175bb9', // Modern House
    '1570129477492-45c003edd2be', // Luxury House
    '1512917774080-9991f1c4c750', // Villa
    '1484154218962-a197022b5858', // Apartment
    '1500382017468-9049fed747ef', // Landscape/Plot
    '1497366216548-37526070297c', // Office
    '1448630305452-114ad330c98e', // Building
    '1600585154340-be6161a56a0c', // Kitchen/Interior
    '1600596542815-ffad4c1539a9', // Modern Villa
    '1600607687920-4e2a09cf159d'  // Living Room
];

for (let i = 1; i <= 100; i++) {
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
        beds: type.includes('Plot') || type.includes('Office') ? null : Math.floor(Math.random() * 4 + 1) + ' BHK',
        tag: i % 5 === 0 ? 'New Launch' : i % 3 === 0 ? 'Verified' : 'Featured'
    });
}

window.propertyData = properties;
