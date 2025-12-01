export function initNavMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    if (!menuToggle || !sideMenu || !closeMenu) return;
    
    menuToggle.addEventListener('click', () => {
        const isOpening = !sideMenu.classList.contains('open');
        
        if (isOpening) {
            sideMenu.classList.remove('hidden');
            sideMenu.classList.add('open');
        } else {
            sideMenu.classList.remove('open');
            
            // Delay re-hiding until the slide-out animation finishes (300ms)
            setTimeout(() => {
                sideMenu.classList.add('hidden');
            }, 300);
        }
    });
    
    closeMenu.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        
        setTimeout(() => {
            sideMenu.classList.add('hidden');
        }, 300);
    });
}
