import * as tiling from './tiling.js';
import { Coord } from './coord.js';
import { RangeSlider } from "./range_slider.js";
import { Mystics, Conway } from "./colorings.js";
import { ColorPalette } from './color_palette.js';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let edgeMorph = 1.0;
    let morph = 0.0;
    let xfactor = 0.5;
    let yfactor = 0.5;
    let zfactor = 0.5;
    let startPosition = new Coord(1000, 500);
    let scale = 20;
    let backgroundColor = '#000000';
    let strokeColor = '#000000';
    let showStoke = true;

    initializeColorPalettes();

    function redrawTiling() {
        tiling.drawTiling(ctx, angle, xfactor, yfactor, zfactor, morph, edgeMorph, scale, startPosition, getColorPalette(), backgroundColor, showStoke, strokeColor);
    }


    const angleControl = document.getElementById('angleControl');

    const angleSlider = new RangeSlider(angleControl, angleControl.dataset, (val) => {
        angle = 2 * Math.PI * val / 360;
        redrawTiling();
    });

    const morphControl = document.getElementById('morphControl');

    const morphSlider = new RangeSlider(morphControl, morphControl.dataset, (val) => {
        morph = 1.0 * 2400 * val / 36000;
        redrawTiling();
    });
    const lengthControlX = document.getElementById('xFactor');
    lengthControlX.addEventListener('input', (event) => {
        xfactor = event.target.value / 100;
        redrawTiling();
    });
    const lengthControlY = document.getElementById('yFactor');
    lengthControlY.addEventListener('input', (event) => {
        yfactor = event.target.value / 100;
        redrawTiling();
    });
    const lengthControlZ = document.getElementById('zFactor');
    lengthControlZ.addEventListener('input', (event) => {
        zfactor = event.target.value / 100;
        redrawTiling();
    });
    const edgeMorphControl = document.getElementById('edgeMorph');
    edgeMorphControl.addEventListener('input', (event) => {
        edgeMorph = 1.0 - (1.0 * event.target.value / 100);
        redrawTiling();
    });
    const backgroundColorControl = document.getElementById('backgroundColor');
    backgroundColorControl.value = backgroundColor;
    backgroundColorControl.addEventListener('input', (event) => {
        backgroundColor = event.target.value;
        redrawTiling();
    });
    const strokeColorControl = document.getElementById('strokeColor');
    const strokeEnabledControl = document.getElementById('strokeEnabled');
    strokeEnabledControl.checked = showStoke;
    strokeColorControl.value = strokeColor;
    strokeColorControl.addEventListener('input', (event) => {
        strokeColor = event.target.value;
        redrawTiling();
    });
    strokeEnabledControl.addEventListener('input', (event) => {
        showStoke = event.target.checked;
        strokeColorControl.hidden = !showStoke;
        redrawTiling();
    });

    // Resize the canvas to fill the entire browser window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        startPosition = new Coord(Math.floor(0.5 * window.innerWidth), Math.floor(0.5 * window.innerHeight));
        redrawTiling();
    }

    function initializeColorPalettes() {
        const colorPalettes = document.getElementById('colorPalettes');

        const option1 = document.createElement('option');
        option1.text = 'Mystics';
        option1.palette = new Mystics();
        initializeColorPickers(option1.palette);
        colorPalettes.add(option1);

        const option2 = document.createElement('option');
        option2.text = 'Conway';
        option2.palette = new Conway();
        colorPalettes.add(option2);

        colorPalettes.addEventListener('change', () => {
            const colorPalette = colorPalettes.options[colorPalettes.selectedIndex].palette;
            initializeColorPickers(colorPalette);
            redrawTiling();
        });
    }

    function getColorPalette() {
        const colorPalettes = document.getElementById('colorPalettes');
        return colorPalettes.options[colorPalettes.selectedIndex].palette;
    }


    function initializeColorPickers(colorPalette) {
        const colorPickers = document.getElementById('colorPickers');
        colorPickers.innerHTML = '';
        colorPalette.getLabels().forEach(label => {
            colorPalette.getColorsForLabel(label).forEach(color => {
                const colorPicker = document.createElement('input');
                colorPicker.type = 'color';
                colorPicker.value = color.getHexValue();
                const opacityControl = document.createElement('input');
                opacityControl.type = 'range';
                opacityControl.min = '0';
                opacityControl.max = '1';
                opacityControl.step = '0.01';
                opacityControl.classList.add('opacityControl');
                opacityControl.value = color.opacity || '1';
                opacityControl.addEventListener('input', () => {
                    color.opacity = opacityControl.value;
                    redrawTiling();
                });
                colorPicker.addEventListener('input', () => {
                    color.hexValue = colorPicker.value;
                    redrawTiling();
                });
                colorPickers.appendChild(colorPicker);
                colorPickers.appendChild(opacityControl);
            });
        });
    }

    // Initial resize
    resizeCanvas();

    // Resize the canvas when the window is resized
    window.addEventListener('resize', resizeCanvas);

    // --- Zoom and Pan functionality ---

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let startX = 0;
    let startY = 0;
    let touchDist = 0;
    let initialScale = scale;

    function getTouchDistance(event) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function handleZoom(delta, centerX, centerY) {
        const zoomFactor = 0.05;
        const oldScale = scale;
        scale *= 1 + delta * zoomFactor;

        if (scale < 1) scale = 1;

        // Adjust startPosition to keep the zoom centered
        startPosition.x = centerX - (centerX - startPosition.x) * scale / oldScale;
        startPosition.y = centerY - (centerY - startPosition.y) * scale / oldScale;

        redrawTiling();
    }

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        startX = event.clientX;
        startY = event.clientY;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const deltaX = event.clientX - lastX;
            const deltaY = event.clientY - lastY;
            startPosition.x += deltaX;
            startPosition.y += deltaY;
            lastX = event.clientX;
            lastY = event.clientY;
            redrawTiling();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault(); // Prevent default scrolling behavior
        const centerX = event.clientX;
        const centerY = event.clientY;
        handleZoom(-event.deltaY, centerX, centerY);
    });

    canvas.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            isDragging = true;
            lastX = event.touches[0].clientX;
            lastY = event.touches[0].clientY;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        } else if (event.touches.length === 2) {
            // For pinch-zoom, prevent dragging
            isDragging = false;
            touchDist = getTouchDistance(event);
            initialScale = scale;
            startX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            startY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

            // Prevent default pinch-zoom behavior
            event.preventDefault();
        }
    });

    canvas.addEventListener('touchmove', (event) => {
        if (isDragging && event.touches.length === 1) {
            const deltaX = event.touches[0].clientX - lastX;
            const deltaY = event.touches[0].clientY - lastY;
            startPosition.x += deltaX;
            startPosition.y += deltaY;
            lastX = event.touches[0].clientX;
            lastY = event.touches[0].clientY;
            redrawTiling();
        } else if (event.touches.length === 2) {
            const newTouchDist = getTouchDistance(event);
            const scaleFactor = newTouchDist / touchDist;
            const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

            const oldScale = scale;
            scale = initialScale * scaleFactor;

            if (scale < 1) scale = 1;

            // Adjust startPosition to keep the zoom centered
            startPosition.x = centerX - (centerX - startPosition.x) * scale / oldScale;
            startPosition.y = centerY - (centerY - startPosition.y) * scale / oldScale;

            redrawTiling();

            // Prevent default pinch-zoom behavior
            event.preventDefault();
        }
    });

    canvas.addEventListener('touchend', (event) => {
        if (event.touches.length < 2)
            isDragging = false;
    });
});