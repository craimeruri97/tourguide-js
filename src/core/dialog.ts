import { TourGuideClient } from "../Tour";
import { arrow, autoPlacement, computePosition as fui_computePosition, offset, shift } from "@floating-ui/dom";
import type { Placement, MiddlewareData } from "@floating-ui/dom";

/**
 * createTourGuideDialog
 */
async function createTourGuideDialog(this: TourGuideClient) {
  // Create base tour dialog element
  this.dialog = document.createElement("div");
  this.dialog.classList.add("tg-dialog");

  // Render HTML content
  await renderDialogHtml(this).then((html) => {
    this.dialog.innerHTML = html;
  });

  document.body.append(this.dialog);

  // Attach skip tutorial functionality
  const skipBtn = this.dialog.querySelector(".tg-skip-btn");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => this.exit());
  }

  const restartBtn = this.dialog.querySelector(".tg-restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => this.visitStep(0));
  }

  const finishBtn = this.dialog.querySelector(".tg-finish-btn");
  if (finishBtn) {
    finishBtn.addEventListener("click", () => this.exit());
  }

  return true;
}

/**
 * renderDialogHtml
 * @param tgInstance
 */
async function renderDialogHtml(tgInstance: TourGuideClient) {
  let htmlRes = "";

  // Dialog header
  htmlRes += `<div class='tg-dialog-header'>`;
  htmlRes += `<div class="tg-dialog-title" id="tg-dialog-title"><!-- JS rendered --></div>`;
  htmlRes += "</div>";

  // Dialog body
  htmlRes += `<div class="tg-dialog-body" id="tg-dialog-body"><!-- JS rendered --></div>`;

  // Dialog footer
  htmlRes += renderDialogFooter(tgInstance);

  htmlRes += `<div id="tg-arrow" class="tg-arrow"></div><!-- end tour arrow -->`;

  return htmlRes;
}

/**
 * renderDialogFooter
 */
function renderDialogFooter(tgInstance: TourGuideClient) {
    let htmlRes = '<div class="tg-dialog-footer">';

    if (tgInstance.activeStep === tgInstance.tourSteps.length - 1) {
      htmlRes += `
      <div class="tg-dialog-footer-left">
        <button type="button" class="tg-restart-btn">Restart Tutorial</button>
      </div>
      <div class="tg-dialog-footer-right">
        <button type="button" class="tg-finish-btn">Finish Tutorial</button>
      </div>`;
    } else {
      // Skip Tutorial button on the left
      htmlRes += `
      <div class="tg-dialog-footer-left">
        <button type="button" class="tg-skip-btn">Skip tutorial</button>
      </div>`;
    
      // Navigation buttons on the right
      htmlRes += `
      <div class="tg-dialog-footer-right">
        <button type="button" class="tg-dialog-btn" id="tg-dialog-prev-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20">
            <path d="M9.4 278.6c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.2L214.6 87.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
          </svg>
        </button>

        <button type="button" class="tg-dialog-btn" id="tg-dialog-next-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20">
            <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
          </svg>
        </button>
      </div>`;
    }

    htmlRes += '</div>';
      
    // Progress bar at the bottom
    htmlRes += `
      <div class="tg-dialog-progress-bar">
        <span class="tg-bar" id="tg-dialog-progbar"></span>
      </div>`;

    return htmlRes;
}

/**
 * updateDialogHtml
 * @param tgInstance
 */
function updateDialogHtml(tgInstance: TourGuideClient) {
  return new Promise((resolve, reject) => {
    const stepData = tgInstance.tourSteps[tgInstance.activeStep];
    if (!stepData) reject('No active step data');

    // Update title
    const tgTitle = document.getElementById('tg-dialog-title');
    if (tgTitle) tgTitle.innerHTML = stepData.title || '';

    // Update body
    const tgBody = document.getElementById('tg-dialog-body');
    if (tgBody && stepData) {
      if (typeof stepData.content === "string") {
        tgBody.innerHTML = stepData.content || '';
      } else {
        tgBody.innerHTML = "";
        tgBody.append(stepData.content);
      }
    }

    // Update footer buttons for the last step
    const tgFooter = document.querySelector('.tg-dialog-footer');
    if (tgFooter) {
      if (tgInstance.activeStep === tgInstance.tourSteps.length - 1) {
        tgFooter.innerHTML = `
          <div class="tg-dialog-footer-left">
            <button type="button" class="tg-dialog-btn" id="tg-restart-btn" style="width: 126px; height: 40px;">Restart Tutorial</button>
          </div>
          <div class="tg-dialog-footer-right">
            <button type="button" class="tg-dialog-btn" id="tg-finish-btn" style="width: 126px; height: 40px;">Finish Tutorial</button>
          </div>
        `;

        // Attach event listeners for "Restart Tutorial" and "Finish Tutorial"
        const restartBtn = tgFooter.querySelector('#tg-restart-btn');
        if (restartBtn) {
          restartBtn.addEventListener('click', () => tgInstance.visitStep(0));
        }

        const finishBtn = tgFooter.querySelector('#tg-finish-btn');
        if (finishBtn) {
          finishBtn.addEventListener('click', () => tgInstance.exit());
        }

      } else {
        // If not the last step, update footer with Next/Back buttons
        tgFooter.innerHTML = `
          <div class="tg-dialog-footer-left">
            <button type="button" class="tg-skip-btn">Skip tutorial</button>
          </div>
          <div class="tg-dialog-footer-right">
            <button type="button" class="tg-dialog-btn" id="tg-dialog-prev-btn">
              <svg style="transform: rotate(180deg)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20">
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
              </svg>
            </button>

            <button type="button" class="tg-dialog-btn" id="tg-dialog-next-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20">
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
              </svg>
            </button>
          </div>
        `;

        // Attach event listeners for "Previous" and "Next" buttons
        const prevBtn = tgFooter.querySelector('#tg-dialog-prev-btn');
        if (prevBtn) {
          prevBtn.addEventListener('click', () => tgInstance.prevStep());
        }

        const nextBtn = tgFooter.querySelector('#tg-dialog-next-btn');
        if (nextBtn) {
          nextBtn.addEventListener('click', () => tgInstance.nextStep());
        }

        const skipBtn = tgFooter.querySelector('.tg-skip-btn');
        if (skipBtn) {
          skipBtn.addEventListener('click', () => tgInstance.exit());
        }
      }
    }

    // Progress bar
    const tgProgBar = document.getElementById('tg-dialog-progbar');
    if (tgProgBar) {
      tgProgBar.style.width = (((tgInstance.activeStep + 1) / tgInstance.tourSteps.length) * 100) + '%';
    }

    resolve(true);
  });
}


/**
 * computeDialogPosition
 */
function computeDialogPosition(tgInstance: TourGuideClient) {
  return new Promise((resolve) => {
    const arrowElement: HTMLElement | null = document.querySelector('#tg-arrow');
    const targetElem = tgInstance.tourSteps[tgInstance.activeStep].dialogTarget || tgInstance.tourSteps[tgInstance.activeStep].target as HTMLElement;

    if (!(targetElem instanceof HTMLElement)) {
      console.error("Target element is not a valid HTMLElement:", targetElem);
      return resolve(false);
    }

    if (tgInstance.activeStep === 0) {
      if (arrowElement) arrowElement.style.display = 'none';
    } else {
      if (arrowElement) arrowElement.style.display = 'block';
    }

    if (targetElem === document.body) {
      Object.assign(tgInstance.dialog.style, {
        top: `${(((window.innerHeight / 2.25)) - (tgInstance.dialog.clientHeight / 2))}px`,
        left: `${((window.innerWidth / 2) - (tgInstance.dialog.clientWidth / 2))}px`,
        position: 'fixed',
      });
      if (arrowElement) arrowElement.style.display = 'none';
      return resolve(true);
    }

    fui_computePosition(targetElem, tgInstance.dialog, {
      placement: tgInstance.options.dialogPlacement as Placement,
      middleware: [
        autoPlacement({ autoAlignment: true, padding: 5 }),
        shift({ crossAxis: tgInstance.options.allowDialogOverlap, padding: 15 }),
        arrow({ element: arrowElement as HTMLElement }),
        offset(20)
      ],
    }).then(({ x, y, middlewareData }) => {
      Object.assign(tgInstance.dialog.style, { left: `${x}px`, top: `${y}px` });

      if (middlewareData.arrow && arrowElement) {
        Object.assign(arrowElement.style, arrowStyles(middlewareData.arrow, tgInstance.dialog));
      }

      return resolve(true);
    });
  });
}

/**
 * arrowStyles
 */
function arrowStyles(arrowMiddlewareData: MiddlewareData["arrow"], dialog: HTMLElement): object {
  const arrowX = arrowMiddlewareData?.x || 0;
  const arrowY = arrowMiddlewareData?.y || 0;
  const arrowSize = 10;
  const maxWidth = dialog.clientWidth - arrowSize;
  const maxHeight = dialog.clientHeight - arrowSize;

  return {
    left: arrowX ? `${arrowX}px` : `${maxWidth / 2}px`,
    top: arrowY ? `${arrowY}px` : `${maxHeight / 2}px`,
  };
}

export { createTourGuideDialog, renderDialogHtml, updateDialogHtml, computeDialogPosition };
