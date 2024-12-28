import Edge from './edge.js';
import Tile from './tile.js';

function drawTiling(ctx, angle) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const edge1 = new Edge(() => 100, () => angle+Math.PI / 2);
    const edge2 = new Edge(() => 100, () => -angle);
    const edge3 = edge1.opposite();
    const edge4 = edge2.opposite();
    const square = new Tile([edge1, edge2, edge3, edge4]);
    square.draw(ctx);
}

export { drawTiling };