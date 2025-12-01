import { initNavMenu } from './components/navMenu.js';
import { initAgeGate } from './components/ageGate.js';
import { initTabs } from './components/tabs.js';
import { loadDeals } from './components/deals.js';
import { loadSpecials } from './components/specials.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize shared components
    initNavMenu();
    initAgeGate();

    // Page-specific initialization
    const page = document.body.dataset.page;

    if (page === "home") {
        initTabs({
            loadDeals,
            loadSpecials
        });
    }
});
