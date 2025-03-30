import * as tiling from './tiling.js';
import { Coord } from './coord.js';
import { RangeSlider } from "./range_slider.js";
import { Directional, Conway, AdvancedColoring } from "./colorings.js";

// --- Constants ---
const ELEMENT_IDS = {
    CANVAS: 'myCanvas',
    CONTROLS_PANEL: 'controls-panel',
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
    startPosition: new Coord(1000, 500), // Initial center point for drawing
    scale: 20, // Initial zoom level
    backgroundColor: '#ffffff',
    strokeColor: '#666666',
    showStroke: true,
    substitutionLevel: 3, // Initial substitution level (0-based)
    currentPalette: null, // Active coloring strategy instance
    isDragging: false, // Flag for canvas panning state
    panLastPos: { x: 0, y: 0 }, // Last mouse/touch position during pan
    pinchInitial: { dist: 0, scale: 1, center: { x: 0, y: 0 } }, // Initial state for pinch-zoom gesture
    redrawRequested: false, // Flag to avoid multiple pending animation frames
    rafId: null // ID of the requested animation frame
};

// --- Main Setup ---
document.addEventListener('DOMContentLoaded', () => {
    if (!setupCanvasAndContext()) return;
    initializeStateFromDOM();
    setupEventListeners();
    setupColorManagement();
    setupUIControlListeners();
    resizeCanvas(); // Perform initial canvas sizing and drawing
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
    if (levelInput) levelInput.value = appState.substitutionLevel + 1; // Display 1-based level

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

    // Set an initial center position (refined further in resizeCanvas)
    appState.startPosition = new Coord(
        Math.floor(0.5 * (appState.canvas.width || window.innerWidth)),
        Math.floor(0.5 * (appState.canvas.height || window.innerHeight))
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
            levelInput.value = appState.substitutionLevel + 1; // Update read-only input (1-based)
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
            appState.factors[factorKey] = value / 100; // Convert percentage to 0-1 range
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
                appState.edgeMorph = 1.0 - (value / 100); // Invert value (0=full, 100=none)
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
    });

    // Generic Collapse Toggle using Event Delegation on the panel
    controlsPanel.addEventListener('click', (event) => {
        const button = event.target.closest('.collapse-button');
        // Ignore clicks not on a collapse button, or clicks on the main hamburger
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
    // Define available palettes and their corresponding class instances
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

    // Populate the dropdown
    palettes.forEach((p, index) => {
        const option = document.createElement('option');
        option.text = p.name;
        option.value = index;
        colorPalettesSelect.add(option);
    });

    const paletteInstances = palettes.map(p => p.instance);

    // Function to update UI when palette changes
    const updateColorPickers = () => {
        const selectedIndex = parseInt(colorPalettesSelect.value, 10);
        if (!isNaN(selectedIndex) && selectedIndex < paletteInstances.length) {
            appState.currentPalette = paletteInstances[selectedIndex];
            initializeColorPickers(appState.currentPalette);
            requestRedraw();
        } else {
            console.error("Invalid palette selection.");
            // Fallback to first palette if selection is invalid
            appState.currentPalette = paletteInstances[0] || null;
            if (appState.currentPalette) initializeColorPickers(appState.currentPalette);
            requestRedraw();
        }
    };

    colorPalettesSelect.addEventListener('change', updateColorPickers);
    updateColorPickers(); // Initial setup based on default selection
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
    colorPickersContainer.innerHTML = ''; // Clear previous pickers

    if (!colorPalette || typeof colorPalette.getLabels !== 'function') {
        console.warn("Invalid color palette object provided to initializeColorPickers.");
        return;
    }

    // Create controls for each color defined by the palette
    colorPalette.getLabels().forEach(label => {
        if (typeof colorPalette.getColorsForLabel !== 'function') return;
        const colors = colorPalette.getColorsForLabel(label);
        if (!Array.isArray(colors)) return;

        colors.forEach(color => {
            // Ensure the color object has the expected methods
            if (typeof color?.getRgbHexValue !== 'function' || typeof color?.updateHexValue !== 'function') {
                console.warn(`Color object for label "${label}" is missing required methods.`);
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.classList.add('color-picker-wrapper');

            const pickerLabel = document.createElement('label');
            pickerLabel.textContent = label + ": ";
            const pickerId = `color-picker-${label}-${Math.random().toString(16).slice(2)}`; // Unique ID
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

            // Add opacity slider if the color object supports it
            if (color.hasOwnProperty('opacity')) {
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
                opacityControl.value = color.opacity ?? '1'; // Default to 1 if undefined
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
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the new scale and adjusts the start position to zoom towards a center point.
 * @param {number} delta - The zoom factor delta (positive for zoom in, negative for zoom out).
 * @param {number} centerX - The x-coordinate of the zoom center.
 * @param {number} centerY - The y-coordinate of the zoom center.
 * @returns {boolean} True if the scale changed, false otherwise.
 */
function calculateZoom(delta, centerX, centerY) {
    const zoomFactor = 0.05; // Sensitivity of wheel zoom
    const oldScale = appState.scale;
    let newScale = oldScale * (1 + delta * zoomFactor);
    newScale = Math.max(1, newScale); // Prevent zooming out too far

    if (newScale !== oldScale) {
        // Adjust start position to keep the point under the cursor stationary
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

    // --- Mouse Events ---
    canvas.addEventListener('mousedown', (e) => {
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
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging); // Stop dragging if mouse leaves canvas

    // Mouse Wheel Zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault(); // Prevent page scrolling
        const centerX = e.clientX;
        const centerY = e.clientY;
        // Adjust delta for consistent zoom direction (scrolling down zooms out)
        if (calculateZoom(-e.deltaY * 0.01, centerX, centerY)) {
            requestRedraw();
        }
    }, { passive: false }); // passive: false needed for preventDefault

    // --- Touch Events ---
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { // Pan start
            appState.isDragging = true;
            appState.panLastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) { // Pinch start
            e.preventDefault(); // Prevent default actions like page zoom
            appState.isDragging = false; // Stop panning if two fingers are down
            // Record initial pinch state
            appState.pinchInitial.dist = getTouchDistance(e);
            appState.pinchInitial.scale = appState.scale;
            appState.pinchInitial.center = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2
            };
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (appState.isDragging && e.touches.length === 1) { // Pan move
            e.preventDefault(); // Prevent page scroll
            const deltaX = e.touches[0].clientX - appState.panLastPos.x;
            const deltaY = e.touches[0].clientY - appState.panLastPos.y;
            appState.startPosition.x += deltaX;
            appState.startPosition.y += deltaY;
            appState.panLastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            requestRedraw();
        } else if (e.touches.length === 2) { // Pinch move
            e.preventDefault(); // Prevent default actions
            const newTouchDist = getTouchDistance(e);
            const scaleFactor = newTouchDist / appState.pinchInitial.dist;
            // Current center of pinch
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            const oldScale = appState.scale;
            let newScale = appState.pinchInitial.scale * scaleFactor;
            newScale = Math.max(1, newScale); // Clamp minimum scale

            if (newScale !== oldScale) {
                // Calculate pan needed to keep the visual center of the pinch stable
                const pinchCenterXRelToStart_Initial = (appState.pinchInitial.center.x - appState.startPosition.x) / oldScale;
                const pinchCenterYRelToStart_Initial = (appState.pinchInitial.center.y - appState.startPosition.y) / oldScale;

                // Calculate the new start position based on the current pinch center and the desired new scale
                const newStartX = centerX - pinchCenterXRelToStart_Initial * newScale;
                const newStartY = centerY - pinchCenterYRelToStart_Initial * newScale;

                appState.startPosition.x = newStartX;
                appState.startPosition.y = newStartY;
                appState.scale = newScale;
                requestRedraw();
            }
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) { // Fewer than 2 fingers left
            appState.isDragging = false; // Stop potential pan
        }
        if (e.touches.length === 0) { // All fingers lifted
            // Reset pinch state if needed (optional)
            appState.pinchInitial = { dist: 0, scale: 1, center: { x: 0, y: 0 } };
        }
    });
}

// --- Rendering ---

/**
 * Adjusts the canvas internal resolution to match its display size
 * and recalculates the start position to maintain the center point.
 */
function resizeCanvas() {
    const canvas = appState.canvas;
    if (!canvas) return;

    // Store old dimensions for calculating relative center
    const oldCanvasWidth = canvas.width || window.innerWidth;
    const oldCanvasHeight = canvas.height || window.innerHeight;

    // Get current display dimensions dictated by CSS
    const rect = canvas.getBoundingClientRect();
    const newWidth = rect.width;
    const newHeight = rect.height;

    // Only resize and redraw if dimensions actually changed
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
        // Calculate where the center was relative to the old size
        const relativeCenterX = appState.startPosition.x / oldCanvasWidth;
        const relativeCenterY = appState.startPosition.y / oldCanvasHeight;

        // Set the canvas drawing buffer size
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Recalculate the absolute pixel position of the center for the new size
        appState.startPosition = new Coord(
            Math.floor(relativeCenterX * newWidth),
            Math.floor(relativeCenterY * newHeight)
        );

        requestRedraw();
    }
}

/**
 * Requests a redraw on the next available animation frame.
 * Avoids queuing multiple redraws if one is already pending.
 */
function requestRedraw() {
    if (!appState.redrawRequested) {
        appState.redrawRequested = true;
        appState.rafId = window.requestAnimationFrame(updateCanvas);
    }
}

/**
 * The main drawing function, called via requestAnimationFrame.
 * Clears the canvas and delegates the actual drawing to the tiling module.
 * @param {DOMHighResTimeStamp} timestamp - The timestamp provided by requestAnimationFrame.
 */
function updateCanvas(timestamp) {
    appState.redrawRequested = false; // Reset the flag

    if (!appState.ctx || !appState.currentPalette) {
        console.error("Cannot draw: Rendering context or Color Palette missing.");
        return;
    }

    // Optional: Performance timing
    // const startTime = performance.now();

    // Call the core tiling drawing function with current state
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

    // Optional: Performance timing
    // const endTime = performance.now();
    // console.log(`Draw time: ${endTime - startTime}ms`);
}