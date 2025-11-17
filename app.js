import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase client
const supabase = createClient(
    'https://fxpaqqpddrcunxcwnjgk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cGFxcXBkZHJjdW54Y3duamdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDAwNzcsImV4cCI6MjA3NTI3NjA3N30.BlCa7aLn9XneDhElnCtwR8YuuxGvTR_8bc2aAkivmcQ'
);

const dealsContainer = document.getElementById('deals-container');

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
                lat: pos.coords.latitude,
                long: pos.coords.longitude
            }),
            (err) => reject(err)
        );
    });
}

function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // radius of Earth in miles
    const toRad = (x) => x * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat/2)**2 +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon/2)**2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function isOpenNow(hoursArray) {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday

    const todaysHours = hoursArray.find(h => h.day_of_week === day);
    if (!todaysHours) return false;

    // Format "HH:MM"
    const open = todaysHours.hour_open.slice(0, 5);   // "08:08"
    const close = todaysHours.hour_close.slice(0, 5); // "20:08"

    const currentTime = now.toTimeString().slice(0, 5);

    return currentTime >= open && currentTime <= close;
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
        const statusImage = isOpen ? "openSign.png" : "closedSign.png";
        
        const div = document.createElement('div');
        
        div.classList.add('deal-card');

        div.innerHTML = 
            `<p>${icons}
            Deal Name: ${deal.deal_name}
            Deal Description: ${deal.deal_description}
            From: ${deal.dispensaries.disp_name}
            Distance: ${deal.distance.toFixed(2)} miles
            <img src="${statusImage}" alt="${isOpen ? 'Open' : 'Closed'}" width="50" /></p>`;

        dealsContainer.appendChild(div);
    });
}

loadDeals();

