import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase client
const supabase = createClient(
    'https://fxpaqqpddrcunxcwnjgk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cGFxcXBkZHJjdW54Y3duamdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDAwNzcsImV4cCI6MjA3NTI3NjA3N30.BlCa7aLn9XneDhElnCtwR8YuuxGvTR_8bc2aAkivmcQ'
);

const dealsContainer = document.getElementById('deals-container');




async function loadDeals() {
const { data, error } = await supabase
    .from('daily_deals')
    .select('*')
    .order('deal_id', { ascending: true });

if (error) {
    console.error('Error loading deals:', error);
    return;
}

console.log('Deals from daily_deals:', data);
}

loadDeals();

