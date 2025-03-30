import { Coord } from './coord.js';
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';

/** Flag to enable drawing special points for debugging purposes. */
const DRAW_POINTS = false;

/**
 * Represents a single, contiguous polygon shape, forming a component part of a larger Tile.
 * It holds the sequence of edges defining its boundary and its offset
 * relative to the parent Tile's origin.
 */
class ProtoTile {
    /**
     * Creates a ProtoTile.
     * @param {Edge[]} edges - Array of Edge objects defining the polygon boundary.
     * @param {Coord} [offset=new Coord(0, 0)] - The offset relative to the parent Tile origin.
     * @param {string[]} [colorLabels=[]] - Labels for determining the base fill color.
     * @param {string[]} [wormColorLabels=[]] - Labels for alternative coloring schemes.
     */
    constructor(edges, offset = new Coord(0, 0), colorLabels = [], wormColorLabels = []) {
        this.edges = edges;
        this.offset = offset;
        this.colorLabels = [...colorLabels];
        this.wormColorLabels = [...wormColorLabels];
        /** @private Cache for the opposite tile to avoid recomputation. */
        this._oppositeValue = null;
    }

    /**
     * Returns the geometrically opposite version of this ProtoTile (reversed edges, negated offset).
     * Result is cached. Assumes the tile's state is immutable after the first call.
     * @returns {ProtoTile} The opposite ProtoTile.
     */
    opposite() {
        if (!this._oppositeValue) {
            const oppositeEdges = this.edges.map(edge => edge.opposite());
            this._oppositeValue = new ProtoTile(
                oppositeEdges,
                this.offset.opposite(),
                this.colorLabels, // Color labels are typically symmetrical
                this.wormColorLabels
            );
            // Ensure the cached opposite also points back here
            this._oppositeValue._oppositeValue = this;
        }
        return this._oppositeValue;
    }

    /**
     * Draws this polygon onto the canvas context.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     * @param {Coord} parentStartPosition - The absolute canvas position of the parent Tile's origin.
     * @param {number} angle - The global rotation angle (used by Edge methods).
     * @param {number} edgeMorph - Factor [0, 1] controlling edge curvature (0=straight, 1=max curve).
     * @param {object} colorPalette - The palette object providing coloring methods.
     * @param {boolean} showStroke - Whether to draw the outline.
     * @param {string} strokeColor - The outline color.
     */
    draw(ctx, parentStartPosition, angle, edgeMorph, colorPalette, showStroke, strokeColor) {
        let currentCoord = parentStartPosition.plus(this.offset);
        const startCoord = currentCoord;

        ctx.beginPath();
        ctx.moveTo(startCoord.x, startCoord.y);

        const fillColor = colorPalette.getColorForLabels(this.colorLabels, this.wormColorLabels);
        ctx.fillStyle = fillColor.getHexValue ? fillColor.getHexValue() : fillColor;

        for (const edge of this.edges) {
            const nextCoord = currentCoord.plus(edge);

            // Calculate control point for curved edge interpolation.
            const midX = currentCoord.x + edge.midRe(angle);
            const midY = currentCoord.y + edge.midIm(angle);
            const avgX = 0.5 * (currentCoord.x + nextCoord.x);
            const avgY = 0.5 * (currentCoord.y + nextCoord.y);

            // Interpolate between midpoint (max curve) and average point (straight).
            const controlX = edgeMorph * midX + (1 - edgeMorph) * avgX;
            const controlY = edgeMorph * midY + (1 - edgeMorph) * avgY;

            ctx.lineTo(controlX, controlY);

            // Draw final segment to the vertex unless morphing fully on a hole edge.
            if (edgeMorph < 1.0 || !edge.surroundsHole) {
                 ctx.lineTo(nextCoord.x, nextCoord.y);
            }

            currentCoord = nextCoord;
        }

        ctx.closePath();
        ctx.fill();

        if (showStroke) {
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
    }

    /**
     * Creates a shallow copy of this ProtoTile. Edges array is copied, Edge objects are reused.
     * @returns {ProtoTile} A new ProtoTile instance with copied properties.
     */
    copy() {
        return new ProtoTile(
            [...this.edges],
            this.offset,
            this.colorLabels,
            this.wormColorLabels
        );
    }
}


/**
 * Represents a complex tiling element, potentially composed of multiple ProtoTiles (polygons).
 * Manages the collection of polygons, special points (endpoints, tips),
 * and provides methods for combining and transforming tiles.
 */
class Tile {
    /**
     * Creates a Tile.
     * @param {ProtoTile[]} protoTiles - Array of ProtoTile objects composing this Tile.
     * @param {Map<EndPoint|TipPoint, Coord>} specialPoints - Map of special point identifiers to their Coord offsets relative to this Tile's origin.
     * @param {Coord} controlPointOffset - The offset of the 'control point' used for joining, relative to this Tile's origin.
     */
    constructor(protoTiles, specialPoints, controlPointOffset) {
        this.protoTiles = protoTiles;
        this.specialPoints = specialPoints;
        this.controlPointOffset = controlPointOffset;
        /** @private Cache for the opposite tile. */
        this._oppositeValue = null;
    }

    /**
     * Static factory to create a Tile from an array defining edges and points for a single polygon.
     * Edges are automatically assigned alternating parity.
     * @param {Array<Edge|ControlPoint|EndPoint|TipPoint>} definitionArray - Array defining the tile structure.
     * @param {string[]} [colorLabels=[]] - Labels for the base color.
     * @param {number} [initialParity=1] - Starting parity for the first edge (1 or -1).
     * @returns {Tile} A new Tile instance containing one ProtoTile.
     */
    static withAlternatingEdges(definitionArray, colorLabels = [], initialParity = 1) {
        let currentParity = initialParity;
        const edges = [];
        let controlPointOffset = new Coord(0, 0);
        let currentOffset = new Coord(0, 0);
        const points = new Map();

        for (const item of definitionArray) {
            if (item instanceof Edge) {
                edges.push(item.withParity(currentParity));
                // Offset accumulates based on the edge *before* parity assignment.
                currentOffset = currentOffset.plus(item);
                currentParity *= -1;
            } else if (item instanceof ControlPoint) {
                controlPointOffset = currentOffset;
            } else if (item instanceof EndPoint || item instanceof TipPoint) {
                points.set(item, currentOffset);
            }
        }

        const protoTile = new ProtoTile(edges, new Coord(0, 0), colorLabels);
        return new Tile([protoTile], points, controlPointOffset);
    }

    /**
     * Static factory method for creating an empty Tile.
     * @returns {Tile} An empty Tile instance.
     */
    static empty() {
        return new Tile([], new Map(), new Coord(0, 0));
    }

    /**
     * Returns the geometrically opposite version of this Tile (reversed polygons and points).
     * Result is cached. Assumes the tile's state is immutable after the first call.
     * @returns {Tile} The opposite Tile.
     */
    opposite() {
        if (!this._oppositeValue) {
            const oppositeProtoTiles = this.protoTiles.map(pt => pt.opposite());
            const oppositePoints = new Map();
            this.specialPoints.forEach((coord, pointKey) => {
                // Point keys (EndPoint/TipPoint instances) also need their opposite representation
                oppositePoints.set(pointKey.opposite(), coord.opposite());
            });
            this._oppositeValue = new Tile(
                oppositeProtoTiles,
                oppositePoints,
                this.controlPointOffset.opposite()
            );
            this._oppositeValue._oppositeValue = this;
        }
        return this._oppositeValue;
    }

    /**
     * Draws the entire Tile (all its ProtoTiles and optionally special points)
     * onto the canvas context.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     * @param {number} angle - The global rotation angle.
     * @param {number} edgeMorph - Factor [0, 1] controlling edge curvature.
     * @param {Coord} [startPosition=new Coord(500, 500)] - The absolute canvas position of this Tile's origin.
     * @param {object} colorPalette - The color palette object.
     * @param {boolean} showStroke - Whether to draw outlines for the ProtoTiles.
     * @param {string} strokeColor - The color for the outlines.
     */
    draw(ctx, angle, edgeMorph, startPosition = new Coord(500, 500), colorPalette, showStroke, strokeColor) {
        for (const protoTile of this.protoTiles) {
            protoTile.draw(ctx, startPosition, angle, edgeMorph, colorPalette, showStroke, strokeColor);
        }

        // Optional debug drawing for special points
        if (DRAW_POINTS) {
            this.specialPoints.forEach((pointCoord, pointKey) => {
                const absolutePos = startPosition.plus(pointCoord);
                ctx.fillStyle = '#00cc00';
                ctx.beginPath();
                ctx.arc(absolutePos.x, absolutePos.y, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.fillText(pointKey.label(), absolutePos.x + 8, absolutePos.y - 8);
            });
            const controlPos = startPosition.plus(this.controlPointOffset);
            ctx.fillStyle = '#cc0000';
            ctx.beginPath();
            ctx.arc(controlPos.x, controlPos.y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.fillText('CP', controlPos.x + 8, controlPos.y - 8);
        }
    }


    /**
     * Joins another Tile to this one at their respective control points.
     * Returns a new Tile containing ProtoTiles from both, offset appropriately.
     * Special points from *this* Tile are kept; points from `otherTile` are discarded.
     * The new control point is the offset control point of `otherTile`.
     * @param {Tile} otherTile - The Tile to join.
     * @returns {Tile} A new combined Tile.
     */
    join(otherTile) {
        if (this.protoTiles.length === 0) return otherTile;
        if (otherTile.protoTiles.length === 0) return this;

        const newProtoTiles = this.protoTiles.map(pt => pt.copy());
        // Offset from this tile's origin to its join point
        const joinOffset = this.controlPointOffset;

        otherTile.protoTiles.forEach((otherPT) => {
            newProtoTiles.push(
                new ProtoTile(
                    [...otherPT.edges],
                    otherPT.offset.plus(joinOffset), // Offset relative to this tile's origin
                    otherPT.colorLabels,
                    otherPT.wormColorLabels
                )
            );
        });

        // Keep only special points from the original 'this' tile.
        const newSpecialPoints = new Map(this.specialPoints);
        // New control point is otherTile's control point relative to this tile's origin.
        const newControlPointOffset = otherTile.controlPointOffset.plus(joinOffset);

        return new Tile(newProtoTiles, newSpecialPoints, newControlPointOffset);
    }

    /** Alias for join, used for specific Conway rule steps. */
    createEvenMystic(tile) {
        return this.join(tile);
    }

    /**
     * Creates a new Tile by joining another Tile using specific edge rotations (Conway "Odd Mystic" rule).
     * Assumes both this and the other tile consist of exactly one ProtoTile.
     * @param {Tile} otherTile - The Tile to join (must have 1 ProtoTile).
     * @returns {Tile} A new combined Tile.
     * @throws {Error} If either tile does not have exactly one ProtoTile.
     */
    createOddMystic(otherTile) {
        if (otherTile.protoTiles.length !== 1 || this.protoTiles.length !== 1) {
            throw new Error("createOddMystic requires tiles with exactly one ProtoTile each.");
        }

        const thisPT = this.protoTiles[0];
        const otherPT = otherTile.protoTiles[0];
        const newProtoTiles = [thisPT.copy()];

        // Apply specific Conway rotation/offset logic to the second tile's edges
        const edgesToJoin = otherPT.edges;
        const rotatedEdgeOrder = [];
        // Extra offset calculated during rotation
        let connectionOffset = new Coord(0, 0);

        // Specific algorithm: rotate edges by 2, sum first 6 rotated edges for connection offset
        for (let i = 0; i < edgesToJoin.length; i++) {
            const rotatedIndex = (i + 2) % edgesToJoin.length;
            rotatedEdgeOrder.push(edgesToJoin[rotatedIndex]);
             // Accumulate offset from specific rotated edges
            if (i < 6) {
                connectionOffset = connectionOffset.plus(edgesToJoin[rotatedIndex]);
            }
        }

        // Base offset from this tile's control point
        const joinOffset = this.controlPointOffset;
        // Base offset for the other tile
        const totalOtherOffset = otherPT.offset.plus(joinOffset);

        newProtoTiles.push(new ProtoTile(
            rotatedEdgeOrder,
            totalOtherOffset,
            otherPT.colorLabels,
            otherPT.wormColorLabels
        ));

        // Keep only special points from the original 'this' tile.
        const newSpecialPoints = new Map(this.specialPoints);
        // Final control point combines base offset and rotation-derived offset.
        const newControlPointOffset = otherTile.controlPointOffset
            .plus(joinOffset)
            .plus(connectionOffset);

        return new Tile(newProtoTiles, newSpecialPoints, newControlPointOffset);
    }

    /**
     * Joins another Tile to this one by aligning specified special points.
     * Returns a new Tile containing components from both, offset appropriately.
     * Allows specifying which special points from each original tile to retain.
     * @param {Tile} otherTile - The Tile to join.
     * @param {EndPoint|TipPoint} fromPoint - The special point on *this* Tile to align from.
     * @param {EndPoint|TipPoint|null} toPoint - The special point on `otherTile` to align to. If null, aligns to otherTile's origin (0,0).
     * @param {Array<EndPoint|TipPoint>|EndPoint|TipPoint} [keepLeftPoints=[]] - Point(s) from *this* Tile to keep in the new Tile (relative to new origin).
     * @param {Array<EndPoint|TipPoint>|EndPoint|TipPoint} [keepRightPoints=[]] - Point(s) from `otherTile` to keep (will be offset relative to new origin).
     * @returns {Tile} A new combined Tile, or Tile.empty() if alignment points are missing.
     */
    joinPoints(otherTile, fromPoint, toPoint, keepLeftPoints = [], keepRightPoints = []) {
        const leftPointsToKeep = Array.isArray(keepLeftPoints) ? keepLeftPoints : [keepLeftPoints];
        const rightPointsToKeep = Array.isArray(keepRightPoints) ? keepRightPoints : [keepRightPoints];

        const joinFromOffset = this.specialPoints.get(fromPoint);
        const joinToOffset = toPoint ? otherTile.specialPoints.get(toPoint) : new Coord(0, 0);

        if (!joinFromOffset || (toPoint && !joinToOffset)) {
             console.error(`joinPoints: Cannot join due to missing alignment points. From: ${fromPoint?.label?.()}, To: ${toPoint?.label?.()}`);
             return Tile.empty();
        }

        // Calculate offset: vector from otherTile's origin to this Tile's origin when aligned.
        const relativeOffset = joinFromOffset.minus(joinToOffset);

        const newProtoTiles = this.protoTiles.map(pt => pt.copy());

        otherTile.protoTiles.forEach((otherPT) => {
            newProtoTiles.push(new ProtoTile(
                [...otherPT.edges],
                otherPT.offset.plus(relativeOffset), // Apply calculated offset
                otherPT.colorLabels,
                otherPT.wormColorLabels
            ));
        });

        // Collect and offset the specified special points to keep
        const newSpecialPoints = new Map();
        leftPointsToKeep.forEach(pointKey => {
            const coord = this.specialPoints.get(pointKey);
            if (coord) {
                // Keep original offset (relative to this tile's origin)
                newSpecialPoints.set(pointKey, coord);
            }
        });
        rightPointsToKeep.forEach(pointKey => {
            const originalCoord = otherTile.specialPoints.get(pointKey);
            if (originalCoord) {
                 // Apply offset
                newSpecialPoints.set(pointKey, originalCoord.plus(relativeOffset));
            }
        });

        // Control point of the combined tile is the offset control point of the *other* tile.
        const newControlPointOffset = otherTile.controlPointOffset.plus(relativeOffset);

        return new Tile(newProtoTiles, newSpecialPoints, newControlPointOffset);
    }

    /**
     * Creates a *new* Tile with updated wormColorLabels for all its ProtoTiles, promoting immutability.
     * @param {string[]} labels - The new array of worm color labels.
     * @returns {Tile} A new Tile instance with updated labels.
     */
    withWormColorLabels(labels) {
        const newProtoTiles = this.protoTiles.map(pt => {
            // Create a new ProtoTile instance with updated labels
            return new ProtoTile(
                pt.edges,           // Edges are assumed immutable
                pt.offset,          // Coords assumed immutable
                pt.colorLabels,     // Keep original base labels
                [...labels]         // Assign a copy of the new worm labels
            );
        });
        // Return a new Tile instance with the modified ProtoTiles
        return new Tile(
            newProtoTiles,
            new Map(this.specialPoints), // Copy special points map
            this.controlPointOffset      // Copy control point offset
        );
    }
}

export default Tile;
