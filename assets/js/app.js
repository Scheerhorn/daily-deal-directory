import { formatDate } from './utils/formatDate.js';
import { calcDistance } from './utils/distance.js';
import { isOpenNow } from './utils/time.js';
import { getUserLocation } from './utils/location.js';
import { initNavMenu } from './components/navMenu.js';
import { initAgeGate } from './components/ageGate.js';
import { initTabs } from './components/tabs.js';
import { loadDeals } from './components/deals.js';
import { loadSpecials } from './components/specials.js';



document.addEventListener('DOMContentLoaded', () => {
    initNavMenu();
    initAgeGate();
    
    // Only initialize tabs on pages that have them
    const page = document.body.dataset.page;
    if (page === "home") {
        initTabs({
            loadDeals,
            loadSpecials
        });
        
    }
});


const dealsButton = document.getElementById('dealsButton');
const dealsContainer = document.getElementById('deals-container');
const specialsButton = document.getElementById('specialsButton');
const specialsContainer = document.getElementById('specials-container');

function activateTab(selected, other) {
    selected.classList.add('active');
    other.classList.remove('active');
}


// Only run tab logic on pages where the buttons exist
if (dealsButton && specialsButton) {
    
    dealsButton.addEventListener('click', () => {
        activateTab(dealsButton, specialsButton);
        dealsContainer.classList.remove('hidden');
        specialsContainer.classList.add('hidden');
        loadDeals();
    });
    
    specialsButton.addEventListener('click', () => {
        activateTab(specialsButton, dealsButton);
        specialsContainer.classList.remove('hidden');
        dealsContainer.classList.add('hidden');
        loadSpecials();
    });
    
}