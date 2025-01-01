
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';

class Tile {
    constructor(edges) {
        this.edges = edges;
    }

    opposite() {
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            newEdges.push(this.edges[i].opposite());
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
            if (!(this.edges[i] instanceof Edge)) {
                continue;
            }
            re += this.edges[i].re;
            im += this.edges[i].im;
            ctx.lineTo(re, im);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    edgesAndTipsOnly() {
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof Edge || this.edges[i] instanceof TipPoint) {
                newEdges.push(this.edges[i]);
            }
        }
        return new Tile(newEdges);
    }

    edgesAndEndPointsOnly() {
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof Edge || this.edges[i] instanceof EndPoint) {
                newEdges.push(this.edges[i]);
            }
        }
        return new Tile(newEdges);
    }

    join(tile) {
        if (this.edges.length == 1 && this.edges[0] instanceof ControlPoint) {
            return tile;
        }
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof ControlPoint) {
                for (let j = 0; j < tile.edges.length; j++) {
                    if (tile.edges[j] instanceof Edge || tile.edges[j] instanceof ControlPoint) {
                        newEdges.push(tile.edges[j]);;
                    }
                }
            } else {
                newEdges.push(this.edges[i]);
            }
        }
        return new Tile(newEdges);
    }

    joinToEndPoint(tile) {
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof EndPoint) {
                for (let j = 0; j < tile.edges.length; j++) {
                    newEdges.push(tile.edges[j]);
                }
            } else {
                newEdges.push(this.edges[i]);
            }
        }
        return new Tile(newEdges);
    }


    joinPoints(tile, fromPoint, toPoint) {
        let joined = false;
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (!joined && (this.edges[i] == fromPoint)) {
                joined = true;
                const joinIndex = toPoint ? tile.edges.indexOf(toPoint) : 0;
                for (let j = joinIndex; j < joinIndex + tile.edges.length; j++) {
                    newEdges.push(tile.edges[j % tile.edges.length]);
                }
            } else {
                newEdges.push(this.edges[i]);
            }
        }
        return new Tile(newEdges);
    }

    joinToTip(tile) {
        let joined = false;
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (!joined & (this.edges[i] instanceof TipPoint)) {
                joined = true;
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