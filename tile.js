
import { Coord } from './coord.js';
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';

const DRAW_POINTS = false;

class JoinedTile {
    constructor(edges, offset = new Coord(0, 0), color = "#fff") {
        this.edges = edges;
        this.offset = offset;
        this.color = color;
    }

    opposite() {
        const newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            newEdges.push(this.edges[i].opposite());
        }
        return new JoinedTile(newEdges, this.offset.opposite(), this.color);
    }

    draw(ctx, position, angle) {
        let coord = new Coord(position.x + this.offset.x, position.y + this.offset.y);
        ctx.moveTo(coord.x, coord.y);
        ctx.beginPath()
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.edges.length; i++) {
            ctx.lineTo(coord.x + this.edges[i].midRe(angle), coord.y + this.edges[i].midIm(angle));
            coord = coord.plus(this.edges[i]);
            if (!this.edges[i].surroundsHole) {
            // Skip this line to prevent the tile having an ugly internal line.
            ctx.lineTo(coord.x, coord.y);
            }
        }
        ctx.closePath()
        ctx.fill();
        // ctx.stroke();
        ctx.moveTo(position.x, position.y);
    }
}

class Tile {
    constructor(joinedTiles, specialPoints, controlPointOffset) {
        this.joinedTiles = joinedTiles;
        this.specialPoints = specialPoints;
        this.controlPointOffset = controlPointOffset;
    }

    static withAlternatingEdges(arr, color = "#fff") {
        let parity = 1;
        const edges = [];
        let controlPointOffset = new Coord(0, 0);
        let offset = new Coord(0, 0);
        const points = new Map();
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] instanceof Edge) {
                offset = offset.plus(arr[i]);
                edges.push(arr[i].withParity(parity));
                parity *= -1;
            } else if (arr[i] instanceof ControlPoint) {
                controlPointOffset = offset;
            } else {
                points.set(arr[i], offset);
            }
        }
        return new Tile([new JoinedTile(edges, new Coord(0, 0), color)], points, controlPointOffset);
    }

    static empty() {
        return new Tile([], new Map(), new Coord(0, 0));
    }

    opposite() {
        const newJoinedTiles = [];
        for (let i = 0; i < this.joinedTiles.length; i++) {
            newJoinedTiles.push(this.joinedTiles[i].opposite());
        }
        const oppositePoints = new Map();
        this.specialPoints.forEach((value, key) => {
            oppositePoints.set(key.opposite(), value.opposite());
        });
        return new Tile(newJoinedTiles, oppositePoints, this.controlPointOffset.opposite());
    }

    draw(ctx, angle) {
        const tips = [];
        const endPoints = [];
        const controlPoints = [];
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#f00'; // Set fill color to red
        let coord = new Coord(500, 500);
        ctx.moveTo(coord.x, coord.y);
        for (let i = 0; i < this.joinedTiles.length; i++) {
            this.joinedTiles[i].draw(ctx, coord, angle);
        }
        if (!DRAW_POINTS) {
            return;
        }
        ctx.moveTo(0, 0);
        // this.joinedTiles.forEach((val) => {
        //     ctx.fillStyle = '#00f';
        //     ctx.beginPath();
        //     ctx.arc(500 + val.offset.x, 500 + val.offset.y, 5, 0, 2 * Math.PI);
        //     ctx.fill();
        // });
        this.specialPoints.forEach((val, key) => {
            ctx.fillStyle = '#0f0';
            ctx.beginPath();
            ctx.arc(500 + val.x, 500 + val.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillText(key.label(), 500 + val.x + 10, 500 + val.y + 10);
        });
    }


    join(tile) {
        if (this.joinedTiles.length == 0) {
            return tile;
        }
        const newJoinedTiles = this.joinedTiles.slice();
        tile.joinedTiles.forEach((val) => {
            newJoinedTiles.push(new JoinedTile(val.edges, val.offset.plus(this.controlPointOffset), val.color))
        });
        const specialPoints = new Map();
        this.specialPoints.forEach((val, key) => {
            specialPoints.set(key, val);
        });
        return new Tile(newJoinedTiles, specialPoints, tile.controlPointOffset.plus(this.controlPointOffset));
    }

    joinPoints(tile, fromPoint, toPoint, keepLeftPoints, keepRightPoints) {
        if (!(keepLeftPoints instanceof Array)) {
            keepLeftPoints = !!keepLeftPoints ? [keepLeftPoints] : [];
        }
        if (!(keepRightPoints instanceof Array)) {
            keepRightPoints = !!keepRightPoints ? [keepRightPoints] : [];
        }
        const newJoinedTiles = this.joinedTiles.slice();
        let joinFromOffset = this.specialPoints.get(fromPoint);
        let joinToOffset = (toPoint != null) ? tile.specialPoints.get(toPoint) : new Coord(0, 0);

        tile.joinedTiles.forEach((val) => {
            newJoinedTiles.push(new JoinedTile(val.edges, val.offset.plus(joinFromOffset).minus(joinToOffset), val.color))
        });
        const specialPoints = new Map();
        keepLeftPoints.forEach(val => {
            if (this.specialPoints.get(val)) {
                specialPoints.set(val, this.specialPoints.get(val));
            }
        });
        keepRightPoints.forEach(val => {
            if (tile.specialPoints.get(val)) {
                specialPoints.set(val, tile.specialPoints.get(val).plus(joinFromOffset).minus(joinToOffset));
            }
        });
        return new Tile(newJoinedTiles, specialPoints, tile.controlPointOffset.plus(joinFromOffset));
    }

    setColor(color) {
        this.joinedTiles.forEach((val) => { val.color = color; });

    }

}

export default Tile;