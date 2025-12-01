import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { formatDate } from './utils/formatDate.js';
import { calcDistance } from './utils/distance.js';
import { isOpenNow } from './utils/time.js';
import { getUserLocation } from './utils/location.js';
import { initNavMenu } from './components/navMenu.js';
import { initAgeGate } from './components/ageGate.js';
import { initTabs } from './components/tabs.js';




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




// Initialize Supabase client
const supabase = createClient(
    'https://fxpaqqpddrcunxcwnjgk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cGFxcXBkZHJjdW54Y3duamdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDAwNzcsImV4cCI6MjA3NTI3NjA3N30.BlCa7aLn9XneDhElnCtwR8YuuxGvTR_8bc2aAkivmcQ'
);





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



async function loadDeals() {
    
    const userLocation = await getUserLocation();
    
    const { data, error } = await supabase
        .from('daily_deals')
        .select(`
            deal_id,
            deal_name,
            deal_description,
            dispensaries:dispensaries!daily_deals_disp_id_fkey (
                disp_name,
                disp_lat,
                disp_long,
                hours:hours!hours_disp_id_fkey (
                    day_of_week,
                    hour_open,
                    hour_close
                )
            ),
            deal_icons (
                icons:icon_id (
                    icon_id,
                    icon_name,
                    icon_emoji
                )
            )
        `)
        .eq('day_of_week', new Date().getDay())                
        .order('deal_id', { ascending: true });
    
    if (error) {
        console.error('Error loading deals:', error);
        return;
    }
    
    // Add distance to each deal
    data.forEach(deal => {
        const dLat = deal.dispensaries?.disp_lat;
        const dLong = deal.dispensaries?.disp_long;
        
        // If a dispensary is missing coords, skip it
        if (!dLat || !dLong) {
            deal.distance = Infinity;
            return;
        }
        
        deal.distance = calcDistance(userLocation.lat, userLocation.long, dLat, dLong);
        
    });
    
    data.sort((a, b) => a.distance - b.distance);
    
    dealsContainer.innerHTML = '';
    
    data.forEach(deal => {
        
        const icons = deal.deal_icons
            ?.map(di => di.icons?.icon_emoji)
            .filter(Boolean)
            .join(' ') || '';
        
        const isOpen = isOpenNow(deal.dispensaries?.hours);
        const statusImage = isOpen ? "assets/images/openSign.png" : "assets/images/closedSign.png";
        
        const div = document.createElement('div');
        
        div.classList.add('deal-card');
        
        div.innerHTML = `
            <div class="deal-line-1">
                ${icons} ${deal.deal_name} — ${deal.deal_description}
            </div>
            
            <div class="deal-line-2">
                ${deal.dispensaries.disp_name} • ${deal.distance.toFixed(2)} mi 
            </div>
            
            <img class="status-icon" src="${statusImage}" alt="${isOpen ? "Open" : "Closed"}">
        `;
        
        dealsContainer.appendChild(div);
    });
};

async function loadSpecials() {
    
    const userLocation = await getUserLocation();
    
    
    const { data, error } = await supabase
        .from('specials')
        .select(`
            special_id,
            special_name,
            special_description,
            start_date,
            end_date,
            dispensaries:dispensaries!specials_disp_id_fkey (
                disp_name,
                disp_lat,
                disp_long,
                hours:hours!hours_disp_id_fkey (
                    day_of_week,
                    hour_open,
                    hour_close
                )
            ),
            special_icons (
                icons:icon_id (
                    icon_id,
                    icon_name,
                    icon_emoji
                )
            )
        `)
    .order('start_date', { ascending: true });
    
    if (error) {
        console.error("Error loading specials:", error);
        return;
    }
    
    data.forEach(special => {
        const dLat = special.dispensaries?.disp_lat;
        const dLong = special.dispensaries?.disp_long;
        
        if (!dLat || !dLong) {
            special.distance = Infinity;
            return;
        }
        
        special.distance = calcDistance(
            userLocation.lat,
            userLocation.long,
            dLat,
            dLong
        );
        
        const today = new Date().toISOString().split("T")[0]; 
        special.isActive = (special.start_date <= today && special.end_date >= today);
    });
    
    
    
    const activeSpecials = data.filter(s => s.isActive);
    
    activeSpecials.sort((a, b) => a.distance - b.distance);
    
    specialsContainer.innerHTML = '';
    
    activeSpecials.forEach(special => {
    
        const icons = special.special_icons
            ?.map(si => si.icons?.icon_emoji)
            .filter(Boolean)
            .join(' ') || '';
            
        const isOpen = isOpenNow(special.dispensaries?.hours);
        const statusImage = isOpen ? "assets/images/openSign.png" : "assets/images/closedSign.png";
        
        
        const div = document.createElement('div');
        
        div.classList.add('deal-card');
        
        const start = formatDate(special.start_date);
        const end = formatDate(special.end_date);
        
        div.innerHTML = `
            <div class="deal-line-1">
                ${icons} ${special.special_name || ''} — ${special.special_description}
            </div>
            
            <div class="deal-line-2">
                Until ${end} • ${special.dispensaries.disp_name} • ${special.distance.toFixed(2)} mi
            </div>

            <img class="status-icon" src="${statusImage}" alt="${isOpen ? "Open" : "Closed"}">
        `;
        
        specialsContainer.appendChild(div);
    });
    
    
    
    
};



