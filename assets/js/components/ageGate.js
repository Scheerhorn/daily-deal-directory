export function initAgeGate() {
    const ageGate = document.getElementById("ageGate");
    const ageYes = document.getElementById("ageYes");
    const ageNo = document.getElementById("ageNo");
    
    if (!ageGate || !ageYes || !ageNo) return;
    
    // Check stored age verification
    const ageVerified = localStorage.getItem("is21");
    
    // If NOT verified, show the popup
    if (!ageVerified) {
        ageGate.classList.remove("hidden");
    }
    
    ageYes.addEventListener("click", () => {
        localStorage.setItem("is21", "true");
        ageGate.classList.add("hidden");
    });
    
    ageNo.addEventListener("click", () => {
        window.location.href = "http://en.spongepedia.org/index.php?title=Weenie_Hut_Juniors";
    });
}
