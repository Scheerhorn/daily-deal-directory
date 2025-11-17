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


async function loadDeals() {
    const { data, error } = await supabase
        .from('daily_deals')
        .select(`
            deal_id,
            deal_name,
            deal_description,
            dispensaries:disp_id (
                disp_name,
                disp_lat,
                disp_long
            )
        `)
        .order('deal_id', { ascending: true });

    if (error) {
        console.error('Error loading deals:', error);
        return;
    }

    dealsContainer.innerHTML = '';

    data.forEach(deal => {
        
        const div = document.createElement('div');
        
        div.classList.add('deal-card');

        div.innerHTML = 
            `<p>Deal Name: ${deal.deal_name}
            Deal Description: ${deal.deal_description}
            From: ${deal.dispensaries.disp_name}</p>`;

        dealsContainer.appendChild(div);
    });
}

loadDeals();

