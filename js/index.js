document.addEventListener('DOMContentLoaded', () => {
    // Category selection
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Rent/Sale tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Typewriter Placeholder effect
    const searchInput = document.querySelector('.search-bar input');
    const placeholders = [
        "Search for 3 BHK apartments...",
        "Search for properties in Noida...",
        "Modern villas in New York...",
        "Luxury penthouses for sale...",
        "Affordable land in Dubai..."
    ];
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentPlaceholder = placeholders[wordIndex];
        
        if (isDeleting) {
            searchInput.placeholder = currentPlaceholder.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            searchInput.placeholder = currentPlaceholder.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPlaceholder.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % placeholders.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();

    // Lucide icons initialization
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
