import { supabase } from './supabaseClient.js';
import { getUserLocation } from '../utils/location.js';
import { calcDistance } from '../utils/distance.js';
import { isOpenNow } from '../utils/time.js';
import { formatDate } from '../utils/formatDate.js';

export async function loadSpecials() {
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

    const specialsContainer = document.getElementById('specials-container');
    if (!specialsContainer) return;

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
        const statusImage = isOpen
            ? "assets/images/openSign.png"
            : "assets/images/closedSign.png";

        const div = document.createElement('div');
        div.classList.add('deal-card');

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
}
