export function isOpenNow(hoursArray) {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    
    const todaysHours = hoursArray.find(h => h.day_of_week === day);
    if (!todaysHours) return false;
    
    // Format "HH:MM"
    const open = todaysHours.hour_open.slice(0, 5);   // "08:08"
    const close = todaysHours.hour_close.slice(0, 5); // "20:08"
    
    const currentTime = now.toTimeString().slice(0, 5);
    
    return currentTime >= open && currentTime <= close;
};