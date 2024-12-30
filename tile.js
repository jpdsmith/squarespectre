
import { ControlPoint } from './edge.js';

class Tile {
    constructor(edges) {
        this.edges = edges;
    }

    opposite() {
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof ControlPoint) {
                newEdges.push(this.edges[i]);
            } else {
                newEdges.push(this.edges[i].opposite());
            }
        }
        return new Tile(newEdges);
    } 

    draw(ctx) {
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#f00'; // Set fill color to red
        ctx.beginPath();
        let re = 500;
        let im = 300;
        ctx.moveTo(re, im);
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof ControlPoint) {
                continue;
            }
            re += this.edges[i].re;
            im += this.edges[i].im;
            ctx.lineTo(re, im);
        }
        ctx.closePath();
        ctx.fill(); // Fill the shape with red
        ctx.stroke();
    }

    join(tile) {
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof ControlPoint) {
                for (let j = 0; j < tile.edges.length; j++) {
                    newEdges.push(tile.edges[j]);
                }
            } else {
                newEdges.push(this.edges[i]);
            }
        }
        return new Tile(newEdges);

    }

}

export default Tile;