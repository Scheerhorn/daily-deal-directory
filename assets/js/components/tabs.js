export function initTabs({ loadDeals, loadSpecials }) {
    const dealsButton = document.getElementById('dealsButton');
    const specialsButton = document.getElementById('specialsButton');
    const dealsContainer = document.getElementById('deals-container');
    const specialsContainer = document.getElementById('specials-container');
    
    // Only run if tabs exist on the current page
    if (!dealsButton || !specialsButton) return;
    
    function activateTab(selected, other) {
        selected.classList.add('active');
        other.classList.remove('active');
    }
    
  // DEFAULT: Daily Deals is active on page load
    dealsContainer.classList.remove('hidden');
    specialsContainer.classList.add('hidden');
    
    dealsButton.addEventListener('click', () => {
        activateTab(dealsButton, specialsButton);
        dealsContainer.classList.remove('hidden');
        specialsContainer.classList.add('hidden');
        loadDeals();  // Will be passed in from app.js
    });
    
    specialsButton.addEventListener('click', () => {
        activateTab(specialsButton, dealsButton);
        specialsContainer.classList.remove('hidden');
        dealsContainer.classList.add('hidden');
        loadSpecials();  // Will be passed in from app.js
    });
}
