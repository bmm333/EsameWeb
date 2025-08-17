import { Utils } from "./utils.js";
import { AuthManager } from "./auth-manager.js";

document.addEventListener("DOMContentLoaded", () => {
    const getCurrentYearElement = document.getElementById("currentYear")
    if (getCurrentYearElement) {
        getCurrentYearElement.textContent = Utils.getCurrentYear()
    }
    Utils.setVh()
    window.addEventListener("resize", Utils.setVh)
    const themeSwitcher = document.getElementById("themeSwitcher")
    if (themeSwitcher) {
        themeSwitcher.addEventListener("click", () => Utils.toggleTheme())
        const savedTheme = localStorage.getItem("theme")
        if (savedTheme) {
            Utils.setTheme(savedTheme)
        }
    }
    Utils.setupSmoothscrolling()
    Utils.setupOffcanvasClose()
    document.querySelectorAll(".offcanvas").forEach((el) => {
        new bootstrap.Offcanvas(el)
    })
    
    // Initialize global auth manager
    window.authManager = new AuthManager();
});