import os

files_to_meta = {
    "about.html": "Learn more about HouseHunt, the premier zero-brokerage real estate platform connecting buyers and sellers directly across India.",
    "contact.html": "Get in touch with the HouseHunt support team. We're here to assist you with any real estate inquiries or platform issues.",
    "privacy.html": "Read the HouseHunt Privacy Policy to understand how we securely handle, protect, and use your personal data.",
    "terms.html": "Review the Terms & Conditions of using HouseHunt for zero-brokerage real estate transactions.",
    "help.html": "Need assistance? Visit the HouseHunt Help Center for FAQs, guides, and support for your real estate journey.",
    "login.html": "Log in to your HouseHunt account to manage your properties, view favorites, and connect directly with owners.",
    "hosttype.html": "List your property on HouseHunt for free. Choose your property type and connect with thousands of genuine buyers with zero brokerage."
}

base_dir = r"c:\Users\91836\AARAMBH\HouseHuntMaster\Househunt-Frontend\html"

for filename, desc in files_to_meta.items():
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<meta name="description"' not in content:
            content = content.replace('</title>', f'</title>\n    <meta name="description" content="{desc}">')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added meta description to {filename}")

h1_files = {
    "chat.html": "HouseHunt Secure Chat",
    "map-view.html": "HouseHunt Map View"
}
for filename, h1 in h1_files.items():
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<h1' not in content.lower():
            h1_tag = f'\n    <h1 class="visually-hidden" style="position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">{h1}</h1>\n'
            content = content.replace('<body>', f'<body>{h1_tag}', 1)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added h1 to {filename}")

cat_files = {
    "category-villas.html": "Discover our exclusive collection of luxury villas across prime locations. Whether you're looking for a sprawling independent estate or a modern villa in a gated community, HouseHunt connects you directly with owners for zero-brokerage deals. Filter by amenities, location, and price to find your perfect luxury home.",
    "category-plots.html": "Explore premium residential and commercial land plots for sale. Investing in plots offers great returns and the freedom to build your custom dream home or business space. Browse verified listings from direct owners and secure the best land deals without paying any brokerage fees.",
    "category-independent.html": "Find spacious independent houses and builder floors tailored for families seeking privacy and comfort. HouseHunt provides a curated list of verified independent properties with zero brokerage. Enjoy features like private terraces, multiple floors, and prime neighborhood connectivity.",
    "category-commercial.html": "Browse top-tier commercial properties including office spaces, retail shops, and showrooms. Whether you are launching a startup or expanding your enterprise, HouseHunt helps you find the perfect commercial real estate with zero brokerage, maximizing your ROI and business potential.",
    "category-apartments.html": "Search through thousands of premium apartments and flats in top residential societies. From affordable 1 BHKs to ultra-luxury penthouses, find your ideal apartment with modern amenities. Connect directly with owners and skip the hefty broker commissions with HouseHunt."
}

for filename, text in cat_files.items():
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        seo_div = f'\n    <div class="seo-content" style="position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">\n        <h2>About this Category</h2>\n        <p>{text}</p>\n    </div>\n'
        
        if 'seo-content' not in content:
            content = content.replace('<div class="app-container">', f'<div class="app-container">{seo_div}', 1)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added SEO content to {filename}")
