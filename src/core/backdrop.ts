import {TourGuideClient} from "../Tour";

/**
 * createTourGuideBackdrop
 */
function createTourGuideBackdrop(this : TourGuideClient){
    this.backdrop = document.createElement('div')
    this.computeBackdropAttributes()
    // Append to body
    document.body.append(this.backdrop)
}

/**
 * computeBackdropAttributes
 */
function computeBackdropAttributes(this : TourGuideClient){
    // TS build strict check
    if(!this.options) return
    // Base class
    this.backdrop.className = 'tg-backdrop' // Reset

    const shadowOpacity = 0.2;
    // Backdrop colour
    this.backdrop.style.boxShadow = `rgba(33, 33, 33, ${shadowOpacity}) 0 0 1px 2px, rgba(33, 33, 33, ${shadowOpacity}) 0 0 0 1000vh`;
    // Custom dialog class
    if(this.options.backdropClass) this.backdrop.classList.add(this.options.backdropClass)
    // Animation class
    if(this.options.dialogAnimate) this.backdrop.classList.add('tg-backdrop-animate')
}

function computeBackdropPosition(tgInstance : TourGuideClient){
    return new Promise((resolve, reject) => {
        // TS build strict check
        if(typeof tgInstance.options.targetPadding === "undefined") return reject("Options failed to initialize")
        if(!tgInstance.backdrop) return reject("No backdrop element initialized")

        const stepData = tgInstance.tourSteps[tgInstance.activeStep]
        const targetElem = stepData.target as HTMLElement
        const targetElemRect = targetElem.getBoundingClientRect()

        // if backdrop overlay extends window width with padding - do not apply additional padding if overflows
        const isOverflow = (targetElemRect.width + tgInstance.options.targetPadding) > document.documentElement.clientWidth


        if(targetElem === document.body){
            // Center & cover entire page if body
            const centeredOverlaySize = 0
            targetElemRect.width = centeredOverlaySize
            targetElemRect.height = centeredOverlaySize
            tgInstance.backdrop.style.position = "fixed"
            tgInstance.backdrop.style.top = ((window.innerHeight / 2.5)) + "px"
            tgInstance.backdrop.style.left = ((window.innerWidth / 2)) + "px"
            // Disable resize detection
            // window.onresize = null
        } else if (stepData.fixed){
            tgInstance.backdrop.style.position = "fixed"
            tgInstance.backdrop.style.top = targetElemRect.top - (tgInstance.options.targetPadding / 2) + "px"
            tgInstance.backdrop.style.left = (isOverflow ? targetElemRect.x : targetElemRect.x - (tgInstance.options.targetPadding / 2)) + "px"
        } else {
            tgInstance.backdrop.style.position = "absolute"
            // Set position to match target
            tgInstance.backdrop.style.top = window.scrollY + targetElemRect.top - (tgInstance.options.targetPadding / 2) + "px"
            tgInstance.backdrop.style.left = (isOverflow ? targetElemRect.x : targetElemRect.x - (tgInstance.options.targetPadding / 2)) + "px"
            // Enable resize detection
        }

        // Prevent overlay being wider than screen
        tgInstance.backdrop.style.width = (isOverflow ? targetElemRect.width : (targetElemRect.width + tgInstance.options.targetPadding)) + "px"
        // Set height
        tgInstance.backdrop.style.height = (targetElemRect.height ? targetElemRect.height + (tgInstance.options.targetPadding) : targetElemRect.height) + "px"

        resolve(true)
    });
}

function disableAllExceptTarget(target: HTMLElement) {
    document.body.classList.add("disable-pointer-events");
    target.classList.add("enable-pointer-events");
}

function cleanupPointerEvents() {
    document.body.classList.remove("disable-pointer-events");
    const activeElement = document.querySelector(".enable-pointer-events");
    if (activeElement) {
        activeElement.classList.remove("enable-pointer-events");
    }
}

export {createTourGuideBackdrop, computeBackdropAttributes, computeBackdropPosition, disableAllExceptTarget, cleanupPointerEvents}