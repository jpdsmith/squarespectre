import Tile from './tile.js';
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';
import { Coord } from './coord.js'; // Assuming Coord might be used internally by Tile/Edge, keep import

// --- Constants ---
const PI = Math.PI;
const PI_OVER_2 = PI / 2;
const PI_OVER_3 = PI / 3;
const PI_OVER_4 = PI / 4;
const PI_OVER_6 = PI / 6;

// --- Global Points ---
const endPointX = new EndPoint("X");
const endPointY = new EndPoint("Y");
const endPointZ = new EndPoint("Z");
const tipX = new TipPoint("X");
const tipY = new TipPoint("Y");
const tipZ = new TipPoint("Z");
const controlPoint = new ControlPoint();

// --- Conway Worm Helper Functions ---
function conwayS(sa, ia, sb, ib, e, o, labels = []) {
    return sa.join(ia).join(sa).join(ia).join(sa)
        .join(e)
        .join(sb).join(ib).join(sb)
        .join(o)
        .join(sa).join(ia).join(sa).join(ia).join(sa)
        .withWormColorLabels(labels);
}
function conwayI(s, i, e, o, labels = []) {
    return o
        .join(s).join(i).join(s).join(i).join(s)
        .join(e)
        .withWormColorLabels(labels);
}
function conwayN(s, i, labels = []) {
    return s.join(i).join(s)
        .withWormColorLabels(labels);
}
function conwayM(s, i, m, labels = []) {
    return s.join(i).join(s).join(i).join(m)
        .withWormColorLabels(labels);
}

// --- Composite Tile Helper Functions ---
function smallPropeller(px, py, pz, td, mx, my, mz) {
    const tempMPx = mx.opposite().joinPoints(pz.opposite(), endPointX.opposite(), endPointZ.opposite(), null, [endPointZ, endPointZ.opposite()]);
    const tempMPy = my.joinPoints(px.opposite(), endPointY, endPointX.opposite(), null, [endPointX, endPointX.opposite()]);
    const tempMPz = mz.joinPoints(py, endPointZ.opposite(), endPointY, null, [endPointY, endPointY.opposite()]);
    return td.joinPoints(tempMPy, tipY.opposite(), null, [tipX, tipZ], [endPointX])
        .joinPoints(tempMPx, tipX, null, [endPointX, tipZ], [endPointZ])
        .joinPoints(tempMPz, tipZ, null, [endPointX, endPointZ], [endPointY.opposite()]);
}

function largePropeller(px, py, pz, ta, td, mx, my, mz) {
    const tempMPx = mx.opposite().joinPoints(pz.opposite(), endPointX.opposite(), endPointZ.opposite(), null, [endPointZ, endPointZ.opposite()]);
    const tempMPy = my.joinPoints(px.opposite(), endPointY, endPointX.opposite(), null, [endPointX, endPointX.opposite()]);
    const tempMPz = mz.joinPoints(py, endPointZ.opposite(), endPointY, null, [endPointY, endPointY.opposite()]);
    const tempPartY = td.joinPoints(tempMPy, tipY.opposite(), null, [tipX, tipZ], [endPointX]).joinPoints(mx.opposite(), tipX, null, [endPointX, tipZ], [endPointX.opposite()]);
    const tempPartX = td.joinPoints(tempMPx, tipX, null, [tipZ, tipY.opposite()], endPointZ).joinPoints(mz, tipZ, null, [endPointZ, tipY.opposite()], [endPointZ.opposite()]);
    const tempPartZ = td.joinPoints(tempMPz, tipZ, null, [tipX, tipY.opposite()], endPointY.opposite()).joinPoints(my, tipY.opposite(), null, [tipX, endPointY.opposite()], [endPointY]);
    const temp = ta.joinPoints(tempPartY, endPointZ.opposite(), endPointX.opposite(), [endPointX.opposite(), endPointY], [tipZ]);
    return temp.joinPoints(tempPartX, endPointY, endPointZ.opposite(), [endPointX.opposite(), tipZ], [tipY.opposite()])
        .joinPoints(tempPartZ, endPointX.opposite(), endPointY, [tipY.opposite(), tipZ], [tipX]);
}

function bird(tb, tc, sx, sy, sz) {
    return tb.joinPoints(
        sz.joinPoints(tc.opposite(), endPointZ.opposite(), endPointY, [tipX, tipY.opposite()], [endPointZ.opposite()]),
        tipZ, null, [tipX, tipY.opposite()], [endPointZ.opposite()])
        .joinPoints(
            sx.opposite().joinPoints(tc.opposite(), endPointX.opposite(), endPointZ.opposite(), [tipY.opposite()], [endPointX.opposite()]),
            tipX, null, [tipY.opposite(), endPointZ.opposite()], [endPointX.opposite()])
        .joinPoints(
            sy.joinPoints(tc.opposite(), endPointY, endPointX.opposite(), [], [endPointY]),
            tipY.opposite(), null, [endPointZ.opposite(), endPointX.opposite()], [endPointY]);
}

function penguinX(tb, tc, pax, sy, sz) {
    const topHalfX = tb
        .joinPoints(sz, tipZ, null, [endPointZ, tipY.opposite(), tipX, tipX.opposite()], [endPointZ.opposite()])
        .joinPoints(sy, tipY.opposite(), null, [endPointZ.opposite(), tipX, tipX.opposite()], [endPointY])
        .joinPoints(tc.opposite(), endPointZ.opposite(), endPointY, [endPointY, tipX], []);
    return pax
        .joinPoints(topHalfX.opposite(), endPointX, endPointY.opposite(), [endPointX.opposite()], [tipX.opposite()])
        .joinPoints(topHalfX, endPointX.opposite(), endPointY, [tipX.opposite()], [tipX]);
}

function penguinY(tb, tc, pay, sx, sz) {
    const topHalfY = tb
        .joinPoints(sx.opposite(), tipX, null, [endPointX, tipZ, tipY.opposite()], [endPointX.opposite()])
        .joinPoints(sz, tipZ, null, [endPointX.opposite(), tipY.opposite()], [endPointZ.opposite()])
        .joinPoints(tc.opposite(), endPointX.opposite(), endPointZ.opposite(), [endPointZ.opposite(), tipY.opposite()], []);
    return pay
        .joinPoints(topHalfY.opposite(), endPointY.opposite(), endPointZ, [endPointY], [tipY])
        .joinPoints(topHalfY, endPointY, endPointZ.opposite(), [tipY], [tipY.opposite()]);
}

function penguinZ(tb, tc, paz, sx, sy) {
    const topHalfZ = tb
        .joinPoints(sy, tipY.opposite(), null, [endPointY.opposite(), tipX, tipZ], [endPointY])
        .joinPoints(sx.opposite(), tipX, null, [endPointY, tipZ], [endPointX.opposite()])
        .joinPoints(tc.opposite(), endPointY, endPointX.opposite(), [endPointX.opposite(), tipZ], []);
    return paz
        .joinPoints(topHalfZ.opposite(), endPointZ, endPointX, [endPointZ.opposite()], [tipZ.opposite()])
        .joinPoints(topHalfZ, endPointZ.opposite(), endPointX.opposite(), [tipZ.opposite()], [tipZ]);
}

function rose(tc, pbx, pby, pbz, nx, ny, nz) {
    return tc
        .joinPoints(pbx.joinPoints(nx, tipX.opposite(), null, [tipX], [endPointX]), endPointZ, endPointX, [endPointX, endPointY.opposite()], [tipX])
        .joinPoints(pby.joinPoints(ny.opposite(), tipY, null, [tipY.opposite()], [endPointY.opposite()]), endPointX, endPointY.opposite(), [endPointY.opposite(), tipX], [tipY.opposite()])
        .joinPoints(pbz.joinPoints(nz.opposite(), tipZ.opposite(), null, [tipZ], [endPointZ]), endPointY.opposite(), endPointZ, [tipX, tipY.opposite()], [tipZ]);
}

function rectangleX(pbx, ta, nx) {
    return pbx.joinPoints(nx, tipX.opposite(), null, [tipX], [endPointX])
        .joinPoints(ta.opposite(), endPointX, endPointZ, [tipX], [endPointX])
        .joinPoints(nx.opposite(), tipX, null, [endPointX], [endPointX.opposite()])
        .joinPoints(ta, endPointX.opposite(), endPointZ.opposite(), [endPointX], [endPointX.opposite()]);
}

function rectangleY(pby, ta, ny) {
    return pby.joinPoints(ny.opposite(), tipY, null, [tipY.opposite()], [endPointY.opposite()])
        .joinPoints(ta.opposite(), endPointY.opposite(), endPointX, [tipY.opposite()], [endPointY.opposite()])
        .joinPoints(ny, tipY.opposite(), null, [endPointY.opposite()], [endPointY])
        .joinPoints(ta, endPointY, endPointX.opposite(), [endPointY.opposite()], [endPointY]);
}

function rectangleZ(pbz, ta, nz) {
    return pbz.joinPoints(nz, tipZ, null, [tipZ.opposite()], [endPointZ.opposite()])
        .joinPoints(ta, endPointZ.opposite(), endPointY, [tipZ.opposite()], [endPointZ.opposite()])
        .joinPoints(nz.opposite(), tipZ.opposite(), null, [endPointZ.opposite()], [endPointZ])
        .joinPoints(ta.opposite(), endPointZ, endPointY.opposite(), [endPointZ.opposite()], [endPointZ]);
}


/**
 * Calculates the base angles for edge generation based on the morph parameter.
 * @param {number} morph - Morphing factor.
 * @returns {object} Object containing calculated angles ANGLE_1 to ANGLE_6.
 */
function calculateBaseAngles(morph) {
    const morphFactor = morph * PI * (1 / 4 - 1 / 3); // Common factor for angles 2, 6
    const morphFactor35 = morph * PI * (1 / 4 - 1 / 6); // Common factor for angles 3, 5
    return {
        ANGLE_1: PI_OVER_2,
        ANGLE_2: PI_OVER_3 + morphFactor,
        ANGLE_3: PI_OVER_6 + morphFactor35,
        ANGLE_4: 0,
        ANGLE_5: -PI_OVER_6 - morphFactor35,
        ANGLE_6: -PI_OVER_3 - morphFactor,
    };
}

/**
 * Creates the 12 Edge directions.
 * @param {number} angle - Global rotation angle offset.
 * @param {number} xValue - Length factor for X-related edges.
 * @param {number} yValue - Length factor for Y-related edges.
 * @param {number} zValue - Length factor for Z-related edges.
 * @param {number} scale - Global scaling factor.
 * @param {object} baseAngles - Object containing ANGLE_1 to ANGLE_6.
 * @returns {Edge[]} Array containing e01 to e12.
 */
function createBaseEdges(angle, xValue, yValue, zValue, scale, baseAngles) {
    const { ANGLE_1, ANGLE_2, ANGLE_3, ANGLE_4, ANGLE_5, ANGLE_6 } = baseAngles;
    const lenX = xValue * scale;
    const lenY = yValue * scale;
    const lenZ = zValue * scale;

    return [
        /*e01*/ new Edge(lenZ, ANGLE_1),
        /*e02*/ new Edge(lenX, ANGLE_2 + angle),
        /*e03*/ new Edge(lenY, ANGLE_3),
        /*e04*/ new Edge(lenZ, ANGLE_4 + angle),
        /*e05*/ new Edge(lenX, ANGLE_5),
        /*e06*/ new Edge(lenY, ANGLE_6 + angle),
        /*e07*/ new Edge(lenZ, PI + ANGLE_1),
        /*e08*/ new Edge(lenX, PI + ANGLE_2 + angle),
        /*e09*/ new Edge(lenY, PI + ANGLE_3),
        /*e10*/ new Edge(lenZ, PI + ANGLE_4 + angle),
        /*e11*/ new Edge(lenX, PI + ANGLE_5),
        /*e12*/ new Edge(lenY, PI + ANGLE_6 + angle),
    ];
}

/**
 * Generates the core tiling structure based on parameters and substitution level.
 * @param {CanvasRenderingContext2D} ctx - Canvas context (might be needed by Tile methods, though not directly used here).
 * @param {number} angle - Global rotation angle offset.
 * @param {number} xValue - Length factor for X-related edges.
 * @param {number} yValue - Length factor for Y-related edges.
 * @param {number} zValue - Length factor for Z-related edges.
 * @param {number} morph - Morphing factor affecting angles.
 * @param {number} scale - Global scaling factor.
 * @param {number} substitutionLevel - The level of detail/iteration for the tiling.
 * @returns {Tile} The final generated Tile object for the specified level.
 */
function generateTiling(ctx, angle, xValue, yValue, zValue, morph, scale, substitutionLevel) {

    // --- 1. Calculate Base Angles and Edges ---
    const baseAngles = calculateBaseAngles(morph);
    const [e01, e02, e03, e04, e05, e06, e07, e08, e09, e10, e11, e12] =
        createBaseEdges(angle, xValue, yValue, zValue, scale, baseAngles);

    // --- 2. Define Level 0 Tiles ---
    const S0x = Tile.empty();
    const I0x = Tile.withAlternatingEdges([e03.markHole(), e12, tipX, e05, e06, controlPoint, e07, e09.inwards(), endPointX, e11, e01.inwards()], ["I", "X"]);
    const OddX = Tile.withAlternatingEdges([e10.inwards(), endPointX, e12, e02.inwards(), e04.markHole(), e01, tipX, e06, controlPoint, e07, e08], ["Odd", "X"]);
    // N0x = I0x; // No need for N0 alias if not used directly
    const M0x = Tile.empty();

    const S0y = Tile.empty();
    const I0y = Tile.withAlternatingEdges([e05.markHole(), e02, tipY, e07, e08, controlPoint, e09, e11.inwards(), endPointY, e01, e03.inwards()], ["I", "Y"]);
    const OddY = Tile.withAlternatingEdges([e12.inwards(), endPointY, e02, e04.inwards(), e06.markHole(), e03, tipY, e08, controlPoint, e09, e10], ["Odd", "Y"]);
    // N0y = I0y;
    const M0y = Tile.empty();

    const S0z = Tile.empty();
    const I0z = Tile.withAlternatingEdges([e07.markHole(), e04, tipZ, e09, e10, controlPoint, e11, e01.inwards(), endPointZ, e03, e05.inwards()], ["I", "Z"]);
    const OddZ = Tile.withAlternatingEdges([e02.inwards(), endPointZ, e04, e06.inwards(), e08.markHole(), e05, tipZ, e10, controlPoint, e11, e12,], ["Odd", "Z"]);
    // N0z = I0z;
    const M0z = Tile.empty();

    // --- 3. Define Mystic Tiles ---
    const Ex = OddY.createEvenMystic(I0y);
    const Ox = I0y.createOddMystic(OddX);
    const Ey = OddZ.createEvenMystic(I0z);
    const Oy = I0z.createOddMystic(OddY);
    const Ez = OddX.createEvenMystic(I0x);
    const Oz = I0x.createOddMystic(OddZ.opposite());

    // --- 4. Define Initial Composite Structures (Level 0 base) ---
    const TD1 = I0x
        .joinPoints(I0z, endPointX, null, tipX, [tipZ, endPointZ])
        .joinPoints(I0y.opposite(), endPointZ, null, [tipX, tipZ], tipY.opposite());

    if (substitutionLevel === 0) return TD1; // Early exit for level 0

    const PA1x = I0x.joinPoints(I0x.opposite(), tipX, null, endPointX, endPointX.opposite());
    const PA1y = I0y.joinPoints(I0y.opposite(), tipY, null, endPointY, endPointY.opposite());
    const PA1z = I0z.joinPoints(I0z.opposite(), tipZ, null, endPointZ, endPointZ.opposite());
    const TA0 = Tile.withAlternatingEdges([endPointX.opposite(), endPointY, endPointZ.opposite()]);

    // --- 5. Calculate Level 1 Tiles (Conway + Composites) ---
    // Calculate Level 1 Conway tiles first
    const S1x = conwayS(S0x, I0x,          S0y, I0y,          Ex, Ox, ["S", "1", "Sx"]);
    const S1y = conwayS(S0y, I0y,          S0z, I0z,          Ey, Oy, ["S", "1", "Sy"]);
    const S1z = conwayS(S0z, I0z.opposite(), S0x, I0x,          Ez, Oz, ["S", "1", "Sz"]);

    const I1x = conwayI(S0x, I0x,          Ex, Ox, ["I", "1", "Ix"]);
    const I1y = conwayI(S0y, I0y,          Ey, Oy, ["I", "1", "Iy"]);
    const I1z = conwayI(S0z, I0z.opposite(), Ez, Oz, ["I", "1", "Iz"]);

    const M1x = conwayM(S0x, I0x,          M0x, ["M", "1", "Mx"]);
    const M1y = conwayM(S0y, I0y,          M0y, ["M", "1", "My"]);
    const M1z = conwayM(S0z, I0z.opposite(), M0z, ["M", "1", "Mz"]);

    const N1x = conwayN(S0x, I0x,          ["N", "1", "Nx"]);
    const N1y = conwayN(S0y, I0y,          ["N", "1", "Ny"]);
    const N1z = conwayN(S0z, I0z.opposite(), ["N", "1", "Nz"]);

    // Calculate Level 1 Composite tiles needed for Level 1 return or Level 2 iteration
    let PA = { x: PA1x, y: PA1y, z: PA1z };
    let TD = TD1;
    let TA = TA0;

    let TC = smallPropeller(PA.x, PA.y, PA.z, TD, M1x, M1y, M1z); // TC1
    if (substitutionLevel === 1) return TC; // Early exit for level 1

    let TB = largePropeller(PA.x, PA.y, PA.z, TA, TD, M1x, M1y, M1z); // TB1
    let TAnext = bird(TB, TC, S1x, S1y, S1z); // TA1 (needed for PA2 calc in loop)
    let PB = { // PB1 (needed for TD2/PA2 calc in loop)
        x: penguinX(TB, TC, PA.x, S1y, S1z),
        y: penguinY(TB, TC, PA.y, S1x, S1z),
        z: penguinZ(TB, TC, PA.z, S1x, S1y),
    };


    // --- 6. Iterative Tile Generation (Levels 2+) ---
    // Initialize state with Level 1 tiles for the start of the loop (calculating Level 2)
    let S = { x: S1x, y: S1y, z: S1z };
    let I = { x: I1x, y: I1y, z: I1z };
    let M = { x: M1x, y: M1y, z: M1z };
    let N = { x: N1x, y: N1y, z: N1z };
    TA = TAnext; // TA is now TA1

    // Start loop from level 1, calculating tiles for level l+1
    for (let l = 1; l < 4; l++) { // Loop calculates levels 2, 3, 4
        const levelNum = l + 1;

        // --- Store previous level's tiles ---
        const S_prev = S;
        const I_prev = I;
        const M_prev = M;
        
        const TA_prev = TA; // TA(l)
        const TC_prev = TC; // TC(l)
        const TB_prev = TB; // TB(l)
        const PA_prev = PA; // PA(l)
        const PB_prev = PB; // PB(l)

        // --- Calculate Conway Worms for Level l+1 ---
        // Careful with .opposite() usage based on original patterns

        S = { // S(l+1)
            x: conwayS(S_prev.x, I_prev.z,            S_prev.y, I_prev.x       ,              Ex, Ox, ["S", `${levelNum}`, "Sx"]),
            y: conwayS(S_prev.y, I_prev.x,            S_prev.z.opposite(), I_prev.y,          Ey, Oy, ["S", `${levelNum}`, "Sy"]),
            z: conwayS(S_prev.z, I_prev.y.opposite(), S_prev.x, I_prev.z       ,              Ez, Oz, ["S", `${levelNum}`, "Sz"]),
        };
        I = { // I(l+1)
            x: conwayI(S_prev.x, I_prev.z,            Ex, Ox, ["I", `${levelNum}`, "Ix"]),
            y: conwayI(S_prev.y, I_prev.x,            Ey, Oy, ["I", `${levelNum}`, "Iy"]),
            z: conwayI(S_prev.z, I_prev.y.opposite(), Ez, Oz, ["I", `${levelNum}`, "Iz"]),
        };
        M = { // M(l+1)
            x: conwayM(S_prev.x, I_prev.z,            M_prev.x, ["M", `${levelNum}`, "Mx"]),
            y: conwayM(S_prev.y, I_prev.x,            M_prev.y, ["M", `${levelNum}`, "My"]),
            z: conwayM(S_prev.z, I_prev.y.opposite(), M_prev.z, ["M", `${levelNum}`, "Mz"]),
        };
        N = { // N(l+1)
            x: conwayN(S_prev.x, I_prev.z,            ["N", `${levelNum}`, "Nx"]),
            y: conwayN(S_prev.y, I_prev.x,            ["N", `${levelNum}`, "Ny"]),
            z: conwayN(S_prev.z, I_prev.y.opposite(), ["N", `${levelNum}`, "Nz"]),
        };


        // --- Calculate Composite Tiles for Level l+1 ---

        TD = rose(TC_prev, PB_prev.x, PB_prev.y, PB_prev.z, N.x, N.y, N.z); // TD(l+1)

        // Use TD result if this is the target level
        if (substitutionLevel === (l * 2)) return TD;

        PA = { // PA(l+1)
            x: rectangleX(PB_prev.x, TA_prev, N.x),
            y: rectangleY(PB_prev.y, TA_prev, N.y),
            z: rectangleZ(PB_prev.z, TA_prev, N.z),
        };

        TC = smallPropeller(PA.x, PA.y, PA.z, TD, M.x, M.y, M.z); // TC(l+1)

        // Use TC result if this is the target level
        if (substitutionLevel === (l * 2 + 1)) return TC;

        TB = largePropeller(PA.x, PA.y, PA.z, TA_prev, TD, M.x, M.y, M.z); // TB(l+1)

        TA = bird(TB, TC, S.x, S.y, S.z); // TA(l+1)

        PB = { // PB(l+1)
             x: penguinX(TB, TC, PA.x, S.y, S.z),
             y: penguinY(TB, TC, PA.y, S.x, S.z),
             z: penguinZ(TB, TC, PA.z, S.x, S.y),
        };

        // Loop continues to calculate next level's tiles...
    }

    // --- 7. Final Selection (Default/Fallback for levels >= 4) ---
    // If the loop completed (l=3 was processed), TD will hold TD4.
    return TD; // Default return is TD4 for substitutionLevel >= 6
}


/**
 * Clears the canvas, draws the background, generates the tiling, and draws the tile.
 * @param {CanvasRenderingContext2D} ctx - The drawing context.
 * @param {number} angle - Global rotation angle offset for tiling generation.
 * @param {number} xValue - Length factor for X-edges.
 * @param {number} yValue - Length factor for Y-edges.
 * @param {number} zValue - Length factor for Z-edges.
 * @param {number} morph - Morphing factor for tiling generation.
 * @param {number} edgeMorph - Morphing factor for edge drawing (passed to tile.draw).
 * @param {number} scale - Global scaling factor.
 * @param {Coord} startPosition - The starting coordinate for drawing the tile.
 * @param {object} colorPalette - Palette used for filling tiles.
 * @param {string} backgroundColor - Canvas background color.
 * @param {boolean} showStoke - Whether to draw tile outlines.
 * @param {string} strokeColor - Color for tile outlines.
 * @param {number} substitutionLevel - The level of detail for tiling generation.
 */
function drawTiling(ctx, angle, xValue, yValue, zValue, morph, edgeMorph, scale, startPosition, colorPalette, backgroundColor, showStoke, strokeColor, substitutionLevel) {

    // Clear and fill background
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Generate the appropriate tile structure based on the level
    const tile = generateTiling(ctx, angle, xValue, yValue, zValue, morph, scale, substitutionLevel);

    // Draw the generated tile
    tile.draw(ctx, angle, edgeMorph, startPosition, colorPalette, showStoke, strokeColor);
}

export { drawTiling };