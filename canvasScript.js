import * as tiling from './tiling.js';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    let angle = 0;

    const angleControl = document.getElementById('angleControl');
    angleControl.addEventListener('input', (event) => {
        angle = 2 * Math.PI * event.target.value / 360;
        tiling.drawTiling(ctx, angle);
    });

    // Resize the canvas to fill the entire browser window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        tiling.drawTiling(ctx, angle);
    }

    // Initial resize
    resizeCanvas();

    // Resize the canvas when the window is resized
    window.addEventListener('resize', resizeCanvas);
});

