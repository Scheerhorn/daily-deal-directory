import { supabase } from './supabaseClient.js';
import { getUserLocation } from '../utils/location.js';
import { calcDistance } from '../utils/distance.js';
import { isOpenNow } from '../utils/time.js';

export async function loadDeals() {
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

    const dealsContainer = document.getElementById('deals-container');
    if (!dealsContainer) return;

    // Add distance sorting
    data.forEach(deal => {
        const dLat = deal.dispensaries?.disp_lat;
        const dLong = deal.dispensaries?.disp_long;

        if (!dLat || !dLong) {
            deal.distance = Infinity;
            return;
        }

        deal.distance = calcDistance(
            userLocation.lat,
            userLocation.long,
            dLat,
            dLong
        );
    });

    data.sort((a, b) => a.distance - b.distance);

    dealsContainer.innerHTML = '';

    data.forEach(deal => {
        const icons = deal.deal_icons
            ?.map(di => di.icons?.icon_emoji)
            .filter(Boolean)
            .join(' ') || '';

        const isOpen = isOpenNow(deal.dispensaries?.hours);
        const statusImage = isOpen
            ? "assets/images/openSign.png"
            : "assets/images/closedSign.png";

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
}
