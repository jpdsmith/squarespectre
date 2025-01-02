
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';

const DRAW_POINTS = true;

class Tile {
    constructor(edges) {
        this.edges = edges;
    }

    withAlternatingEdges(initialParity = 1) {
        let parity = initialParity;
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof Edge) {
                newEdges.push(this.edges[i].withParity(parity));
                parity *= -1;
            } else {
                newEdges.push(this.edges[i]);
            }
        }
        return new Tile(newEdges);
    }

    opposite() {
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            newEdges.push(this.edges[i].opposite());
        }
        return new Tile(newEdges);
    }

    draw(ctx, angle) {
        const tips = [];
        const endPoints = [];
        const controlPoints = [];
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#f00'; // Set fill color to red
        ctx.beginPath();
        let re = 500;
        let im = 500;
        ctx.moveTo(re, im);
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i] instanceof TipPoint) {
                tips.push({ 're': re, 'im': im });
            }
            if (this.edges[i] instanceof EndPoint) {
                endPoints.push({ 're': re, 'im': im });
            }
            if (this.edges[i] instanceof ControlPoint) {
                controlPoints.push({ 're': re, 'im': im });
            }
            if (!(this.edges[i] instanceof Edge)) {
                continue;
            }
            ctx.lineTo(re + this.edges[i].midRe(angle), im + this.edges[i].midIm(angle));
            re += this.edges[i].re;
            im += this.edges[i].im;
            if (!this.edges[i].surroundsHole) {
                // Skip this line to prevent the tile having an ugly internal line.
                ctx.lineTo(re, im);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (!DRAW_POINTS) {
            return;
        }
        for (let i = 0; i < tips.length; i++) {
            ctx.fillStyle = '#0f0';
            ctx.beginPath();
            ctx.arc(tips[i].re, tips[i].im, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
        for (let i = 0; i < endPoints.length; i++) {
            ctx.fillStyle = '#00f';
            ctx.beginPath();
            ctx.arc(endPoints[i].re, endPoints[i].im, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
        for (let i = 0; i < controlPoints.length; i++) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(controlPoints[i].re, controlPoints[i].im, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
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