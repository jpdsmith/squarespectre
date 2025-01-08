import * as tiling from './tiling.js';

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let edgeMorph = 1.0;
    let morph = 0.0;
    let xfactor = 1;
    let yfactor = 1;
    let zfactor = 1;

    const angleControl = document.getElementById('angleControl');
    angleControl.addEventListener('input', (event) => {
        angle = 2 * Math.PI * event.target.value / 360;
        tiling.drawTiling(ctx, angle, xfactor, yfactor, zfactor, morph, edgeMorph);
    });
    const morphControl = document.getElementById('morphControl');
    morphControl.addEventListener('input', (event) => {
        morph = 1.0 * event.target.value / 100;
        tiling.drawTiling(ctx, angle, xfactor, yfactor, zfactor, morph, edgeMorph);
    });
    const lengthControlX = document.getElementById('xFactor');
    lengthControlX.addEventListener('input', (event) => {
        xfactor = event.target.value / 100;
        tiling.drawTiling(ctx, angle, xfactor, yfactor, zfactor, morph, edgeMorph);
    });
    const lengthControlY = document.getElementById('yFactor');
    lengthControlY.addEventListener('input', (event) => {
        yfactor = event.target.value / 100;
        tiling.drawTiling(ctx, angle, xfactor, yfactor, zfactor, morph, edgeMorph);
    });
    const lengthControlZ = document.getElementById('zFactor');
    lengthControlZ.addEventListener('input', (event) => {
        zfactor = event.target.value / 100;
        tiling.drawTiling(ctx, angle, xfactor, yfactor, zfactor, morph, edgeMorph);
    });
    const edgeMorphControl = document.getElementById('edgeMorph');
    edgeMorphControl.addEventListener('input', (event) => {
        edgeMorph = 1.0 * event.target.value / 100;
        tiling.drawTiling(ctx, angle, xfactor, yfactor, zfactor, morph, edgeMorph);
    });

    // Resize the canvas to fill the entire browser window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        tiling.drawTiling(ctx, angle, xfactor, yfactor, zfactor, morph, edgeMorph);
    }

    // Initial resize
    resizeCanvas();

    // Resize the canvas when the window is resized
    window.addEventListener('resize', resizeCanvas);
});

