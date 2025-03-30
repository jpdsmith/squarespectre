import * as tiling from './tiling.js';
import { Coord } from './coord.js';
import { RangeSlider } from "./range_slider.js";
import { Directional, Conway, AdvancedColoring } from "./colorings.js";

// --- Constants ---
const ELEMENT_IDS = {
    CANVAS: 'myCanvas',
    CONTROLS_PANEL: 'controls-panel',
    CONTROLS_WRAPPER: 'controls-wrapper',
    HAMBURGER_MENU: 'hamburger-menu',
    LEVEL_INPUT: 'levelInput',
    DECREMENT_BTN: 'decrementLevel',
    INCREMENT_BTN: 'incrementLevel',
    ANGLE_CONTROL: 'angleControl',
    MORPH_CONTROL: 'morphControl',
    X_FACTOR: 'xFactor',
    Y_FACTOR: 'yFactor',
    Z_FACTOR: 'zFactor',
    EDGE_MORPH: 'edgeMorph',
    BG_COLOR: 'backgroundColor',
    STROKE_COLOR: 'strokeColor',
    STROKE_ENABLED: 'strokeEnabled',
    COLOR_PALETTES: 'colorPalettes',
    COLOR_PICKERS: 'colorPickers',
};
const MIN_SCALE = 0.5;

const MAX_SUBSTITUTION_LEVEL = 6; // Maximum depth for recursive tiling generation (0-based).
const MORPH_SCALE_FACTOR = 2400 / 36000; // Scaling factor for morph control input.

// --- Global Application State ---
let appState = {
    ctx: null,
    canvas: null,
    angleRad: 0,
    edgeMorph: 1.0,
    morph: 0.0,
    factors: { x: 0.5, y: 0.5, z: 0.5 },
    startPosition: new Coord(1000, 500),
    scale: 20,
    backgroundColor: '#ffffff',
    strokeColor: '#666666',
    showStroke: true,
    substitutionLevel: 3,
    currentPalette: null,
    isDragging: false,
    panLastPos: { x: 0, y: 0 },
    pinchInitial: { dist: 0, scale: 1, center: { x: 0, y: 0 } }, // Optional state for pinch start
    pinchLastDist: 0, // Stores the touch distance from the previous move event during a pinch
    redrawRequested: false,
    rafId: null
};

// --- Main Setup ---
document.addEventListener('DOMContentLoaded', () => {
    if (!setupCanvasAndContext()) return;
    initializeStateFromDOM();
    setupEventListeners();
    setupColorManagement();
    setupUIControlListeners();
    resizeCanvas();
});

// --- Initialization Functions ---

/**
 * Finds the canvas element, gets the 2D rendering context, and stores them in appState.
 * @returns {boolean} True if successful, false otherwise.
 */
function setupCanvasAndContext() {
    appState.canvas = document.getElementById(ELEMENT_IDS.CANVAS);
    if (!appState.canvas) {
        console.error(`Canvas element with ID "${ELEMENT_IDS.CANVAS}" not found.`);
        return false;
    }
    appState.ctx = appState.canvas.getContext('2d');
    if (!appState.ctx) {
        console.error("Failed to get 2D rendering context.");
        return false;
    }
    appState.canvas.style.cursor = 'grab';
    return true;
}

/**
 * Initializes parts of the appState based on the initial values set in the HTML DOM.
 * Also synchronizes ARIA attributes with initial UI state.
 */
function initializeStateFromDOM() {
    const levelInput = document.getElementById(ELEMENT_IDS.LEVEL_INPUT);
    if (levelInput) levelInput.value = appState.substitutionLevel + 1;

    const strokeEnabled = document.getElementById(ELEMENT_IDS.STROKE_ENABLED);
    const strokeColorInput = document.getElementById(ELEMENT_IDS.STROKE_COLOR);
    if (strokeEnabled) {
        strokeEnabled.checked = appState.showStroke;
        if (strokeColorInput) strokeColorInput.disabled = !appState.showStroke;
    }
    const bgColorInput = document.getElementById(ELEMENT_IDS.BG_COLOR);
    if (bgColorInput) bgColorInput.value = appState.backgroundColor;

    if (strokeColorInput) strokeColorInput.value = appState.strokeColor;

    // Initialize ARIA states for hamburger menu and collapsible sections
    const controlsPanel = document.getElementById(ELEMENT_IDS.CONTROLS_PANEL);
    const hamburgerBtn = document.getElementById(ELEMENT_IDS.HAMBURGER_MENU);
    if (controlsPanel && hamburgerBtn) {
        const panelIsOpen = controlsPanel.classList.contains('open');
        hamburgerBtn.setAttribute('aria-expanded', panelIsOpen);
        hamburgerBtn.classList.toggle('open', panelIsOpen);
        hamburgerBtn.classList.toggle('closed', !panelIsOpen);
    } else {
        console.warn("Could not initialize hamburger ARIA state: elements not found.");
    }

    document.querySelectorAll('.collapse-button').forEach(button => {
        const targetSelector = button.getAttribute('data-target');
        const targetElement = targetSelector ? document.querySelector(targetSelector) : null;
        const isOpen = targetElement ? targetElement.classList.contains('open') : false;
        button.setAttribute('aria-expanded', isOpen);
        button.classList.toggle('open', isOpen);
        button.classList.toggle('closed', !isOpen);
    });

    appState.startPosition = new Coord(
        Math.floor(0.5 * (appState.canvas?.width || window.innerWidth)),
        Math.floor(0.5 * (appState.canvas?.height || window.innerHeight))
    );
}

// --- Event Listener Setup ---

/** Sets up all event listeners for UI controls and canvas interaction. */
function setupEventListeners() {
    setupLevelControls();
    setupSliders();
    setupFactorInputs();
    setupColorControls();
    setupCanvasResizing();
    setupZoomAndPan();
}

/** Sets up listeners for the substitution level increment/decrement buttons. */
function setupLevelControls() {
    const levelInput = document.getElementById(ELEMENT_IDS.LEVEL_INPUT);
    const decBtn = document.getElementById(ELEMENT_IDS.DECREMENT_BTN);
    const incBtn = document.getElementById(ELEMENT_IDS.INCREMENT_BTN);

    if (!levelInput || !decBtn || !incBtn) {
        console.warn("Level control elements not found.");
        return;
    }

    const updateLevel = (delta) => {
        const newLevel = appState.substitutionLevel + delta;
        if (newLevel >= 0 && newLevel <= MAX_SUBSTITUTION_LEVEL) {
            appState.substitutionLevel = newLevel;
            levelInput.value = appState.substitutionLevel + 1;
            requestRedraw();
        }
    };

    decBtn.addEventListener('click', () => updateLevel(-1));
    incBtn.addEventListener('click', () => updateLevel(1));
}

/** Initializes range sliders using the RangeSlider class. */
function setupSliders() {
    const angleControl = document.getElementById(ELEMENT_IDS.ANGLE_CONTROL);
    if (angleControl) {
        new RangeSlider(angleControl, angleControl.dataset, (val) => {
            appState.angleRad = (val / 360) * 2 * Math.PI;
            requestRedraw();
        });
    } else {
        console.warn(`Element "${ELEMENT_IDS.ANGLE_CONTROL}" not found.`);
    }

    const morphControl = document.getElementById(ELEMENT_IDS.MORPH_CONTROL);
    if (morphControl) {
        new RangeSlider(morphControl, morphControl.dataset, (val) => {
            appState.morph = val * MORPH_SCALE_FACTOR;
            requestRedraw();
        });
    } else {
        console.warn(`Element "${ELEMENT_IDS.MORPH_CONTROL}" not found.`);
    }
}

/** Creates an event listener function for a factor range input. */
function createFactorInputListener(factorKey) {
    return (event) => {
        const value = parseFloat(event.target.value);
        if (!isNaN(value)) {
            appState.factors[factorKey] = value / 100;
            requestRedraw();
        }
    };
}

/** Sets up listeners for the X, Y, Z factor and edge morph range inputs. */
function setupFactorInputs() {
    const xFactorInput = document.getElementById(ELEMENT_IDS.X_FACTOR);
    const yFactorInput = document.getElementById(ELEMENT_IDS.Y_FACTOR);
    const zFactorInput = document.getElementById(ELEMENT_IDS.Z_FACTOR);
    const edgeMorphInput = document.getElementById(ELEMENT_IDS.EDGE_MORPH);

    if (xFactorInput) xFactorInput.addEventListener('input', createFactorInputListener('x'));
    else console.warn(`Element "${ELEMENT_IDS.X_FACTOR}" not found.`);

    if (yFactorInput) yFactorInput.addEventListener('input', createFactorInputListener('y'));
    else console.warn(`Element "${ELEMENT_IDS.Y_FACTOR}" not found.`);

    if (zFactorInput) zFactorInput.addEventListener('input', createFactorInputListener('z'));
    else console.warn(`Element "${ELEMENT_IDS.Z_FACTOR}" not found.`);

    if (edgeMorphInput) {
        edgeMorphInput.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            if (!isNaN(value)) {
                appState.edgeMorph = 1.0 - (value / 100);
                requestRedraw();
            }
        });
    } else {
        console.warn(`Element "${ELEMENT_IDS.EDGE_MORPH}" not found.`);
    }
}

/** Sets up listeners for background color, stroke color, and stroke visibility controls. */
function setupColorControls() {
    const bgControl = document.getElementById(ELEMENT_IDS.BG_COLOR);
    const strokeColorControl = document.getElementById(ELEMENT_IDS.STROKE_COLOR);
    const strokeEnabledControl = document.getElementById(ELEMENT_IDS.STROKE_ENABLED);

    if (bgControl) {
        bgControl.addEventListener('input', (event) => {
            appState.backgroundColor = event.target.value;
            requestRedraw();
        });
    } else {
        console.warn(`Element "${ELEMENT_IDS.BG_COLOR}" not found.`);
    }

    if (strokeColorControl) {
        strokeColorControl.addEventListener('input', (event) => {
            appState.strokeColor = event.target.value;
            if (appState.showStroke) requestRedraw();
        });
    } else {
        console.warn(`Element "${ELEMENT_IDS.STROKE_COLOR}" not found.`);
    }

    if (strokeEnabledControl) {
        strokeEnabledControl.addEventListener('input', (event) => {
            appState.showStroke = event.target.checked;
            if (strokeColorControl) strokeColorControl.disabled = !appState.showStroke;
            requestRedraw();
        });
    } else {
        console.warn(`Element "${ELEMENT_IDS.STROKE_ENABLED}" not found.`);
    }
}

/** Sets up the listener for window resize events to adjust the canvas. */
function setupCanvasResizing() {
    window.addEventListener('resize', resizeCanvas);
}

/** Sets up listeners for the hamburger menu and collapsible sections within the control panel. */
function setupUIControlListeners() {
    const controlsPanel = document.getElementById(ELEMENT_IDS.CONTROLS_PANEL);
    const controlsWrapper = document.getElementById(ELEMENT_IDS.CONTROLS_WRAPPER);
    const hamburgerBtn = document.getElementById(ELEMENT_IDS.HAMBURGER_MENU);

    if (!controlsPanel || !hamburgerBtn) {
        console.warn("Control panel or hamburger button not found, cannot set up UI toggles.");
        return;
    }

    // Hamburger Toggle for Main Panel
    hamburgerBtn.addEventListener('click', () => {
        const isOpening = !controlsPanel.classList.contains('open');
        controlsPanel.classList.toggle('open', isOpening);
        controlsPanel.classList.toggle('closed', !isOpening);
        hamburgerBtn.classList.toggle('open', isOpening);
        hamburgerBtn.classList.toggle('closed', !isOpening);
        hamburgerBtn.setAttribute('aria-expanded', isOpening);
        controlsWrapper.classList.toggle('hide-wrapper', !isOpening);
    });

    // Generic Collapse Toggle using Event Delegation on the panel
    controlsPanel.addEventListener('click', (event) => {
        const button = event.target.closest('.collapse-button');
        if (!button || button.id === ELEMENT_IDS.HAMBURGER_MENU) return;

        const targetSelector = button.getAttribute('data-target');
        const targetElement = targetSelector ? document.querySelector(targetSelector) : null;

        if (targetElement) {
            const isOpening = !targetElement.classList.contains('open');
            targetElement.classList.toggle('open', isOpening);
            targetElement.classList.toggle('closed', !isOpening);
            button.classList.toggle('open', isOpening);
            button.classList.toggle('closed', !isOpening);
            button.setAttribute('aria-expanded', isOpening);
        } else {
            console.warn(`Collapse target not found for button: ${targetSelector}`);
        }
    });
}

// --- Color Palette Management ---

/** Sets up the color palette selection dropdown and initializes the first palette. */
function setupColorManagement() {
    const palettes = [
        { name: 'Conway Coloring', instance: new Conway() },
        { name: 'Orientation Coloring', instance: new Directional() },
        { name: 'Full Control', instance: new AdvancedColoring() }
    ];

    const colorPalettesSelect = document.getElementById(ELEMENT_IDS.COLOR_PALETTES);
    if (!colorPalettesSelect) {
        console.error(`Element "${ELEMENT_IDS.COLOR_PALETTES}" not found.`);
        return;
    }

    palettes.forEach((p, index) => {
        const option = document.createElement('option');
        option.text = p.name;
        option.value = index;
        colorPalettesSelect.add(option);
    });

    const paletteInstances = palettes.map(p => p.instance);

    const updateColorPickers = () => {
        const selectedIndex = parseInt(colorPalettesSelect.value, 10);
        if (!isNaN(selectedIndex) && selectedIndex < paletteInstances.length) {
            appState.currentPalette = paletteInstances[selectedIndex];
            initializeColorPickers(appState.currentPalette);
            requestRedraw();
        } else {
            console.error("Invalid palette selection.");
            appState.currentPalette = paletteInstances[0] || null;
            if (appState.currentPalette) initializeColorPickers(appState.currentPalette);
            requestRedraw();
        }
    };

    colorPalettesSelect.addEventListener('change', updateColorPickers);
    updateColorPickers();
}

/**
 * Dynamically creates color picker controls based on the selected color palette.
 * @param {object} colorPalette - An instance of a coloring class (e.g., Conway, Directional).
 */
function initializeColorPickers(colorPalette) {
    const colorPickersContainer = document.getElementById(ELEMENT_IDS.COLOR_PICKERS);
    if (!colorPickersContainer) {
        console.error(`Element "${ELEMENT_IDS.COLOR_PICKERS}" not found.`);
        return;
    }
    colorPickersContainer.innerHTML = '';

    if (!colorPalette || typeof colorPalette.getLabels !== 'function') {
        console.warn("Invalid color palette object provided to initializeColorPickers.");
        return;
    }

    colorPalette.getLabels().forEach(label => {
        if (typeof colorPalette.getColorsForLabel !== 'function') return;
        const colors = colorPalette.getColorsForLabel(label);
        if (!Array.isArray(colors)) return;

        colors.forEach(color => {
            if (typeof color?.getRgbHexValue !== 'function' || typeof color?.updateHexValue !== 'function') {
                console.warn(`Color object for label "${label}" is missing required methods.`);
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.classList.add('color-picker-wrapper');

            const pickerLabel = document.createElement('label');
            pickerLabel.textContent = label + ": ";
            const pickerId = `color-picker-${label}-${Math.random().toString(16).slice(2)}`;
            pickerLabel.htmlFor = pickerId;
            wrapper.appendChild(pickerLabel);

            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.id = pickerId;
            colorPicker.value = color.getRgbHexValue();
            colorPicker.addEventListener('input', () => {
                color.updateHexValue(colorPicker.value);
                requestRedraw();
            });
            wrapper.appendChild(colorPicker);

            if (color.hasOwnProperty('opacity') || typeof color.opacity !== 'undefined') {
                const opacityId = `opacity-control-${label}-${Math.random().toString(16).slice(2)}`;
                const opacityControl = document.createElement('input');
                opacityControl.type = 'range';
                opacityControl.id = opacityId;
                opacityControl.min = '0';
                opacityControl.max = '1';
                opacityControl.step = '0.01';
                opacityControl.classList.add('opacityControl');
                opacityControl.title = `${label} Opacity`;
                opacityControl.setAttribute('aria-label', `${label} Opacity`);
                opacityControl.value = color.opacity ?? '1';
                opacityControl.addEventListener('input', () => {
                    color.opacity = parseFloat(opacityControl.value);
                    requestRedraw();
                });
                wrapper.appendChild(opacityControl);
            }
            colorPickersContainer.appendChild(wrapper);
        });
    });
}

// --- Canvas Interaction (Zoom/Pan) ---

/** Calculates the distance between two touch points. */
function getTouchDistance(event) {
    if (event.touches.length !== 2) {
        console.warn("getTouchDistance called with incorrect number of touches:", event.touches.length);
        return 0;
    }
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the new scale and adjusts the start position to zoom towards a center point.
 * @param {number} delta - A factor indicating zoom amount and direction.
 * @param {number} centerX - The x-coordinate of the zoom center.
 * @param {number} centerY - The y-coordinate of the zoom center.
 * @returns {boolean} True if the scale changed, false otherwise.
 */
function calculateZoom(delta, centerX, centerY) {
    const zoomFactor = 0.03;
    const oldScale = appState.scale;

    let newScale = oldScale * (1 - delta * zoomFactor);
    newScale = Math.max(MIN_SCALE, newScale);

    if (newScale !== oldScale) {
        appState.startPosition.x = centerX - (centerX - appState.startPosition.x) * newScale / oldScale;
        appState.startPosition.y = centerY - (centerY - appState.startPosition.y) * newScale / oldScale;
        appState.scale = newScale;
        return true;
    }
    return false;
}

/** Sets up event listeners for mouse and touch interactions on the canvas (pan and zoom). */
function setupZoomAndPan() {
    const canvas = appState.canvas;
    if (!canvas) return;

    // --- Mouse Events ---
    canvas.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        appState.isDragging = true;
        appState.panLastPos = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
        if (appState.isDragging) {
            const deltaX = e.clientX - appState.panLastPos.x;
            const deltaY = e.clientY - appState.panLastPos.y;
            appState.startPosition.x += deltaX;
            appState.startPosition.y += deltaY;
            appState.panLastPos = { x: e.clientX, y: e.clientY };
            requestRedraw();
        }
    });

    const stopDragging = () => {
        if (appState.isDragging) {
            appState.isDragging = false;
            canvas.style.cursor = 'grab';
        }
    };

    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) stopDragging();
    });
    canvas.addEventListener('mouseleave', stopDragging);

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const centerX = e.clientX;
        const centerY = e.clientY;
        if (calculateZoom(e.deltaY * 0.01, centerX, centerY)) {
            requestRedraw();
        }
    }, { passive: false });

    // --- Touch Events ---
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            if (appState.pinchLastDist === 0) {
                appState.isDragging = true;
                appState.panLastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                canvas.style.cursor = 'grabbing';
            }
        } else if (e.touches.length === 2) {
            e.preventDefault();
            appState.isDragging = false;
            canvas.style.cursor = 'default';

            const currentDist = getTouchDistance(e);
            appState.pinchLastDist = currentDist;
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (appState.isDragging && e.touches.length === 1) {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - appState.panLastPos.x;
            const deltaY = e.touches[0].clientY - appState.panLastPos.y;
            appState.startPosition.x += deltaX;
            appState.startPosition.y += deltaY;
            appState.panLastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            requestRedraw();
        } else if (e.touches.length === 2 && appState.pinchLastDist > 0) {
            e.preventDefault();

            const currentDist = getTouchDistance(e);
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            const scaleFactor = currentDist / appState.pinchLastDist;
            const oldScale = appState.scale;
            let newScale = oldScale * scaleFactor;
            newScale = Math.max(MIN_SCALE, newScale);

            if (newScale !== oldScale) {
                appState.startPosition.x = centerX - (centerX - appState.startPosition.x) * newScale / oldScale;
                appState.startPosition.y = centerY - (centerY - appState.startPosition.y) * newScale / oldScale;
                appState.scale = newScale;
                requestRedraw();
            }
            appState.pinchLastDist = currentDist;
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        const remainingTouches = e.touches.length;

        if (remainingTouches < 2) {
            appState.pinchLastDist = 0;
            canvas.style.cursor = 'grab';
        }

        if (remainingTouches === 1) {
            if (!appState.isDragging) {
                appState.isDragging = true;
                appState.panLastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                canvas.style.cursor = 'grabbing';
            }
        } else if (remainingTouches === 0) {
            if (appState.isDragging) {
                appState.isDragging = false;
                canvas.style.cursor = 'grab';
            }
        }
    });

    canvas.addEventListener('touchcancel', (e) => {
        appState.isDragging = false;
        appState.pinchLastDist = 0;
        canvas.style.cursor = 'grab';
    });
}


// --- Rendering ---

/**
 * Adjusts the canvas internal resolution to match its display size
 * and recalculates the start position to maintain the visual center.
 */
function resizeCanvas() {
    const canvas = appState.canvas;
    if (!canvas) return;

    const oldCanvasWidth = canvas.width || window.innerWidth;
    const oldCanvasHeight = canvas.height || window.innerHeight;

    const rect = canvas.getBoundingClientRect();
    const newWidth = rect.width;
    const newHeight = rect.height;

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
        const relativeCenterX = oldCanvasWidth > 0 ? appState.startPosition.x / oldCanvasWidth : 0.5;
        const relativeCenterY = oldCanvasHeight > 0 ? appState.startPosition.y / oldCanvasHeight : 0.5;

        canvas.width = newWidth;
        canvas.height = newHeight;

        appState.startPosition.x = Math.floor(relativeCenterX * newWidth);
        appState.startPosition.y = Math.floor(relativeCenterY * newHeight);

        requestRedraw();
    } else {
        // Fallback centering logic on initial load if needed
        if (appState.startPosition.x === 1000 && appState.startPosition.y === 500) {
            appState.startPosition = new Coord(
                Math.floor(0.5 * newWidth),
                Math.floor(0.5 * newHeight)
            );
            requestRedraw();
        }
    }
}

/**
 * Requests a redraw on the next available animation frame.
 * Avoids queuing multiple redraws if one is already pending.
 */
function requestRedraw() {
    if (!appState.redrawRequested) {
        appState.redrawRequested = true;
        if (appState.rafId) {
            window.cancelAnimationFrame(appState.rafId);
        }
        appState.rafId = window.requestAnimationFrame(updateCanvas);
    }
}

/**
 * The main drawing function, called via requestAnimationFrame.
 * Clears the canvas and delegates the actual drawing to the tiling module.
 * @param {DOMHighResTimeStamp} timestamp - The timestamp provided by requestAnimationFrame.
 */
function updateCanvas(timestamp) {
    appState.redrawRequested = false;
    appState.rafId = null;

    if (!appState.ctx || !appState.currentPalette || !appState.canvas) {
        console.error("Cannot draw: Rendering context, Color Palette, or Canvas missing.");
        return;
    }

    // const startTime = performance.now();

    tiling.drawTiling(
        appState.ctx,
        appState.angleRad,
        appState.factors.x,
        appState.factors.y,
        appState.factors.z,
        appState.morph,
        appState.edgeMorph,
        appState.scale,
        appState.startPosition,
        appState.currentPalette,
        appState.backgroundColor,
        appState.showStroke,
        appState.strokeColor,
        appState.substitutionLevel
    );

    // const endTime = performance.now();
    // console.log(`Draw time: ${endTime - startTime}ms`);
}