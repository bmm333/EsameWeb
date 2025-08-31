/**
 * utility func for smart wardrobe app
 */
export const API_BASE = "http://192.168.1.4:3001";

export const Utils={
    API_BASE,
    /**
     * setting css var for vp h 
     * fxing 100vh vp for ios 
     */
    setVh:()=>{
        const vh=window.innerHeight*0.01
        document.documentElement.style.setProperty("--vh",`${vh}px`)
    },
    /**
     * curr year
     * returns {number} 
     */
    getCurrentYear:()=>new Date().getFullYear(),
    /**
     * Theme switcher
     * gets parm {string} theme ('light'||'dark')
     */
    setTheme:(theme)=>{
        document.body.setAttribute("data-bs-theme",theme)
        localStorage.setItem("theme",theme)
        //Update theme icons
        const lightIcons=document.querySelectorAll(".theme-icon-light")
        const darkIcons=document.querySelectorAll(".theme-icon-dark")
        lightIcons.forEach((icon)=>{
            if(theme==="dark")
            {
                icon.classList.add("d-none")
            }else
            {
                icon.classList.remove("d-none")
            }
        })
        darkIcons.forEach((icon)=>{
            if(theme==="light")
            {
                icon.classList.add("d-none")
            }
            else
            {
                icon.classList.remove("d-none")
            }
        })
    },
    /**
     * gets current theme
     */
    getTheme:()=>document.body.getAttribute("data-bs-theme")||"light",
    /**
     * Switch between themes
     */
    toggleTheme:function()
    {
        const currentTheme=this.getTheme()
        const newTheme=currentTheme==="dark"?"light":"dark"
        this.setTheme(newTheme)
    },
    /**
     * Smoothscorlling util
     */
    setupSmoothscrolling:()=>
    {
        document.querySelectorAll('a[href^="#"]').forEach((anchor)=>{
            anchor.addEventListener("click",function(e){
                const targetId=this.getAttribute("href")
                //skips if just #
                if(targetId==="#") return
                const targetElement=document.querySelector(targetId)
                if(targetElement)
                {
                    e.preventDefault()
                    //offest of fixed navbar
                    const navbarHeight=document.querySelector(".navbar")?.offsetHeight||0
                    const targetPosition=targetElement.getBoundingClientRect().top+window.pageYOffset-navbarHeight
                    window.scrollTo({
                        top:targetPosition,
                        behavior:"smooth",
                    })
                }
            })
        })
    },
    /**
     * canvas closing when clicked on links
     */
    setupOffcanvasClose:()=>
    {
        const navLinks=document.querySelectorAll(".offcanvas .nav-link")
        const bsOffcanvas=document.getElementById("sideMenu")
        if(bsOffcanvas&&navLinks.length>0&&window.bootstrap)
        {
            const offcanvas=window.bootstrap.Offcanvas

            navLinks.forEach((link)=>{
                link.addEventListener("click",()=>{
                    const offcanvasInstance=offcanvas.getInstance(bsOffcanvas)
                    if(offcanvasInstance){
                        offcanvasInstance.hide()
                    }
                })
            })
        }
    }
};