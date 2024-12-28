class Tile {
    constructor(edges) {
        this.edges = edges;
    }

    draw(ctx) {
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#f00'; // Set fill color to red
        ctx.beginPath();
        let re = 200;
        let im = 200;
        ctx.moveTo(re, im);
        for (let i = 0; i < this.edges.length; i++) {
            re += this.edges[i].re;
            im += this.edges[i].im;
            ctx.lineTo(re, im);
        }
        ctx.closePath();
        ctx.fill(); // Fill the shape with red
        ctx.stroke();
    }

}

export default Tile;