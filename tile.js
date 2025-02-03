
import { Coord } from './coord.js';
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';

const DRAW_POINTS = false;
let COLOR = 14777215;

class JoinedTile {
    constructor(edges, offset = new Coord(0, 0), colorLabels = [], wormColorLabels = []) {
        this.edges = edges;
        this.offset = offset;
        this.colorLabels = colorLabels;
        this.wormColorLabels = wormColorLabels;
        this.oppositeValue = null;
    }

    opposite() {
        if (!this.oppositeValue) {
            const newEdges = [];
            for (let i = 0; i < this.edges.length; i++) {
                newEdges.push(this.edges[i].opposite());
            }
            this.oppositeValue = new JoinedTile(newEdges, this.offset.opposite(), this.colorLabels, this.wormColorLabels);
            this.oppositeValue.oppositeValue = this;
        }
        return this.oppositeValue;
    }

    draw(ctx, position, angle, edgeMorph, colorPalette, showStoke, strokeColor) {
        let coord = new Coord(position.x + this.offset.x, position.y + this.offset.y);
        ctx.moveTo(coord.x, coord.y);
        ctx.beginPath()
        ctx.fillStyle = colorPalette.getColorForLabels(this.colorLabels, this.wormColorLabels).getHexValue();
        for (let i = 0; i < this.edges.length; i++) {
            const oldX = coord.x;
            const oldY = coord.y;
            const midX = coord.x + this.edges[i].midRe(angle);
            const midY = coord.y + this.edges[i].midIm(angle);
            coord = coord.plus(this.edges[i]);
            ctx.lineTo(edgeMorph * midX + 0.5 * (1 - edgeMorph) * (coord.x + oldX), edgeMorph * midY + 0.5 * (1 - edgeMorph) * (coord.y + oldY));
            if (edgeMorph < 1.0 || !this.edges[i].surroundsHole) {
                // Skip this line to prevent the tile having an ugly internal line.
                ctx.lineTo(coord.x, coord.y);
            }
        }
        ctx.closePath()
        ctx.fill();
        if (showStoke) {
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
        ctx.moveTo(position.x, position.y);
    }

    copy() {
        return new JoinedTile(this.edges.slice(), this.offset, this.colorLabels);
    }
}

class Tile {
    constructor(joinedTiles, specialPoints, controlPointOffset) {
        this.joinedTiles = joinedTiles;
        this.specialPoints = specialPoints;
        this.controlPointOffset = controlPointOffset;
        this.oppositeValue = null;
    }

    static withAlternatingEdges(arr, colorLabels = [], initialParity = 1) {
        let parity = initialParity;
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
        return new Tile([new JoinedTile(edges, new Coord(0, 0), colorLabels)], points, controlPointOffset);
    }

    static empty() {
        return new Tile([], new Map(), new Coord(0, 0));
    }

    opposite() {
        if (!this.oppositeValue) {
            const newJoinedTiles = [];
            for (let i = 0; i < this.joinedTiles.length; i++) {
                newJoinedTiles.push(this.joinedTiles[i].opposite());
            }
            const oppositePoints = new Map();
            this.specialPoints.forEach((value, key) => {
                oppositePoints.set(key.opposite(), value.opposite());
            });
            this.oppositeValue = new Tile(newJoinedTiles, oppositePoints, this.controlPointOffset.opposite());
            this.oppositeValue.oppositeValue = this;
        }
        return this.oppositeValue;
    }

    draw(ctx, angle, edgeMorph, startPosition = new Coord(500, 500), colorPalette, showStoke, strokeColor) {
        const tips = [];
        const endPoints = [];
        const controlPoints = [];
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#f00'; // Set fill color to red
        let coord = startPosition;
        ctx.moveTo(coord.x, coord.y);
        for (let i = 0; i < this.joinedTiles.length; i++) {
            this.joinedTiles[i].draw(ctx, coord, angle, edgeMorph, colorPalette, showStoke, strokeColor);
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
        const newJoinedTiles = [];
        this.joinedTiles.forEach((val) => {
            newJoinedTiles.push(val.copy());
        });
        tile.joinedTiles.forEach((val) => {
            newJoinedTiles.push(new JoinedTile(val.edges, val.offset.plus(this.controlPointOffset), val.colorLabels, val.wormColorLabels))
        });
        const specialPoints = new Map();
        this.specialPoints.forEach((val, key) => {
            specialPoints.set(key, val);
        });
        return new Tile(newJoinedTiles, specialPoints, tile.controlPointOffset.plus(this.controlPointOffset));
    }

    createEvenMystic(tile) {
        return this.join(tile);
    }

    createOddMystic(tile) {
        if (tile.joinedTiles.length != 1 || this.joinedTiles.length != 1) {
            throw new Error("Use join for multiple tiles");
        }
        const newJoinedTiles = [this.joinedTiles[0].copy()];
        const joinedTile = tile.joinedTiles[0].copy();
        const edgesToJoin = joinedTile.edges;
        const rotatedEdgeOrder = [];
        let offset = new Coord(0, 0);
        for (let i = 0; i < edgesToJoin.length; i++) {
            const idx = (i + 2) % edgesToJoin.length;
            if (i < 6) {
                offset = offset.plus(edgesToJoin[idx]);
            }
            rotatedEdgeOrder.push(edgesToJoin[idx]);
        }
        newJoinedTiles.push(new JoinedTile(rotatedEdgeOrder, joinedTile.offset.plus(this.controlPointOffset), joinedTile.colorLabels, joinedTile.wormColorLabels));
        const specialPoints = new Map();
        this.specialPoints.forEach((val, key) => {
            specialPoints.set(key, val);
        });
        return new Tile(newJoinedTiles, specialPoints, tile.controlPointOffset.plus(this.controlPointOffset).plus(offset));
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
            newJoinedTiles.push(new JoinedTile(val.edges, val.offset.plus(joinFromOffset).minus(joinToOffset), val.colorLabels, val.wormColorLabels))
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

    withWormColorLabels(labels) {
        const newJoinedTiles = [];
        this.joinedTiles.forEach((val) => {
            const tiles = val.copy();
            tiles.wormColorLabels = labels;
            newJoinedTiles.push(tiles);
        });
        this.joinedTiles = newJoinedTiles;
        return this;
    }
}

export default Tile;