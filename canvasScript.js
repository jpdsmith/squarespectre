document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    // Resize the canvas to fill the entire browser window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Draw a Tetris-like shape
        drawTetrisShape();
    }

    // Function to draw a Tetris-like shape
    function drawTetrisShape() {
        const blockSize = 30; // Size of each block
        const shape = [
            [1, 1],
            [0, 1],
            [1, 1]
        ];

        ctx.fillStyle = 'blue'; // Color of the shape

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                }
            }
        }
    }

    // Initial resize
    resizeCanvas();

    // Resize the canvas when the window is resized
    window.addEventListener('resize', resizeCanvas);
});