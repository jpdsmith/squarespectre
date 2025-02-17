
import Tile from './tile.js';
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';
import { Coord } from './coord.js';

const endPointX = new EndPoint("X");
const endPointY = new EndPoint("Y");
const endPointZ = new EndPoint("Z");
const tipX = new TipPoint("X");
const tipY = new TipPoint("Y");
const tipZ = new TipPoint("Z");


function drawTiling(ctx, angle, xValue, yValue, zValue, morph, edgeMorph, scale, startPosition, colorPalette, backgroundColor, showStoke, strokeColor, substitutionLevel) {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const tile = generateTiling(ctx, angle, xValue, yValue, zValue, morph, scale, substitutionLevel);

    tile.draw(ctx, angle, edgeMorph, startPosition, colorPalette, showStoke, strokeColor);
}

function generateTiling(ctx, angle, xValue, yValue, zValue, morph, scale, substitutionLevel) {
    const ANGLE_1 = Math.PI / 2;
    const ANGLE_2 = Math.PI / 3 + morph * Math.PI * (1 / 4 - 1 / 3);
    const ANGLE_3 = Math.PI / 6 + morph * Math.PI * (1 / 4 - 1 / 6);
    const ANGLE_4 = 0;
    const ANGLE_5 = -Math.PI / 6 + morph * Math.PI * (-1 / 4 + 1 / 6);
    const ANGLE_6 = -Math.PI / 3 + morph * Math.PI * (-1 / 4 + 1 / 3);

    const e01 = new Edge(zValue * scale, ANGLE_1);
    const e02 = new Edge(xValue * scale, ANGLE_2 + angle);
    const e03 = new Edge(yValue * scale, ANGLE_3);
    const e04 = new Edge(zValue * scale, ANGLE_4 + angle);
    const e05 = new Edge(xValue * scale, ANGLE_5);
    const e06 = new Edge(yValue * scale, ANGLE_6 + angle);
    const e07 = new Edge(zValue * scale, Math.PI + ANGLE_1);
    const e08 = new Edge(xValue * scale, Math.PI + ANGLE_2 + angle);
    const e09 = new Edge(yValue * scale, Math.PI + ANGLE_3);
    const e10 = new Edge(zValue * scale, Math.PI + ANGLE_4 + angle);
    const e11 = new Edge(xValue * scale, Math.PI + ANGLE_5);
    const e12 = new Edge(yValue * scale, Math.PI + ANGLE_6 + angle);

    const controlPoint = new ControlPoint();

    const S0x = Tile.empty();
    const I0x = Tile.withAlternatingEdges([
        e03.markHole(),
        e12,
        tipX,
        e05,
        e06,
        controlPoint,
        e07,
        e09.inwards(),
        endPointX,
        e11,
        e01.inwards()], ["I", "X"]);
    const OddX = Tile.withAlternatingEdges([
        e10.inwards(),
        endPointX,
        e12,
        e02.inwards(),
        e04.markHole(),
        e01,
        tipX,
        e06,
        controlPoint,
        e07,
        e08], ["Odd", "X"]);
    const N0x = I0x;
    const M0x = Tile.empty();
    const S0y = Tile.empty();
    const I0y = Tile.withAlternatingEdges([
        e05.markHole(),
        e02,
        tipY,
        e07,
        e08,
        controlPoint,
        e09,
        e11.inwards(),
        endPointY,
        e01,
        e03.inwards()], ["I", "Y"]);
    const OddY = Tile.withAlternatingEdges([
        e12.inwards(),
        endPointY,
        e02,
        e04.inwards(),
        e06.markHole(),
        e03,
        tipY,
        e08,
        controlPoint,
        e09,
        e10], ["Odd", "Y"]);

    const N0y = I0y;
    const M0y = Tile.empty();
    const S0z = Tile.empty();
    const I0z = Tile.withAlternatingEdges([
        e07.markHole(),
        e04,
        tipZ,
        e09,
        e10,
        controlPoint,
        e11,
        e01.inwards(),
        endPointZ,
        e03,
        e05.inwards()], ["I", "Z"]);

    const OddZ = Tile.withAlternatingEdges([
        e02.inwards(),
        endPointZ,
        e04,
        e06.inwards(),
        e08.markHole(),
        e05,
        tipZ,
        e10,
        controlPoint,
        e11,
        e12,], ["Odd", "Z"]);
    const N0z = I0z;
    const M0z = Tile.empty();

    const Ex = OddY.createEvenMystic(I0y);
    const Ox = I0y.createOddMystic(OddX);
    const Ey = OddZ.createEvenMystic(I0z);
    const Oy = I0z.createOddMystic(OddY);
    const Ez = OddX.createEvenMystic(I0x);
    const Oz = I0x.createOddMystic(OddZ.opposite());

    const S1x = conwayS(S0x, I0x, S0y, I0y, Ex, Ox, ["S", "1", "Sx"]);
    const S1y = conwayS(S0y, I0y, S0z, I0z, Ey, Oy, ["S", "1", "Sy"]);
    const S1z = conwayS(S0z, I0z.opposite(), S0x, I0x, Ez, Oz, ["S", "1", "Sz"]);

    const I1x = conwayI(S0x, I0x, Ex, Ox, ["I", "1", "Ix"]);
    const I1y = conwayI(S0y, I0y, Ey, Oy, ["I", "1", "Iy"]);
    const I1z = conwayI(S0z, I0z.opposite(), Ez, Oz, ["I", "1", "Iz"]);

    const M1x = conwayM(S0x, I0x, M0x, ["M", "1", "Mx"]);
    const M1y = conwayM(S0y, I0y, M0y, ["M", "1", "My"]);
    const M1z = conwayM(S0z, I0z.opposite(), M0z, ["M", "1", "Mz"]);

    const N1x = conwayN(S0x, I0x, ["N", "1", "Nx"]);
    const N1y = conwayN(S0y, I0y, ["N", "1", "Ny"]);
    const N1z = conwayN(S0z, I0z.opposite(), ["N", "1", "Nz"]);

    const S2x = conwayS(S1x, I1z, S1y, I1x, Ex, Ox, ["S", "2", "Sx"]);
    const S2y = conwayS(S1y, I1x, S1z.opposite(), I1y, Ey, Oy, ["S", "2", "Sy"]);
    const S2z = conwayS(S1z, I1y.opposite(), S1x, I1z, Ez, Oz, ["S", "2", "Sz"]);

    const I2x = conwayI(S1x, I1z, Ex, Ox, ["I", "2", "Ix"]);
    const I2y = conwayI(S1y, I1x, Ey, Oy, ["I", "2", "Iy"]);
    const I2z = conwayI(S1z, I1y.opposite(), Ez, Oz, ["I", "2", "Iz"]);

    const M2x = conwayM(S1x, I1z, M1x, ["M", "2", "Mx"]);
    const M2y = conwayM(S1y, I1x, M1y, ["M", "2", "My"]);
    const M2z = conwayM(S1z, I1y.opposite(), M1z, ["M", "2", "Mz"]);

    const N2x = conwayN(S1x, I1z, ["N", "2", "Nx"]);
    const N2y = conwayN(S1y, I1x, ["N", "2", "Ny"]);
    const N2z = conwayN(S1z, I1y.opposite(), ["N", "2", "Nz"]);

    const N3x = conwayN(S2x, I2z, ["N", "3", "Nx"]);
    const N3y = conwayN(S2y, I2x, ["N", "3", "Ny"]);
    const N3z = conwayN(S2z, I2y.opposite(), ["N", "3", "Nz"]);

    const M3x = conwayM(S2x, I2z, M2x, ["M", "3", "Mx"]);
    const M3y = conwayM(S2y, I2x, M2y, ["M", "3", "My"]);
    const M3z = conwayM(S2z, I2y.opposite(), M2z, ["M", "3", "Mz"]);

    const S3x = conwayS(S2x, I2z, S2y, I2x, Ex, Ox, ["S", "3", "Sx"]);
    const S3y = conwayS(S2y, I2x, S2z.opposite(), I2y, Ey, Oy, ["S", "3", "Sy"]);
    const S3z = conwayS(S2z, I2y.opposite(), S2x, I2z, Ez, Oz, ["S", "3", "Sz"]);

    const I3x = conwayI(S2x, I2z, Ex, Ox, ["I", "3", "Ix"]);
    const I3y = conwayI(S2y, I2x, Ey, Oy, ["I", "3", "Iy"]);
    const I3z = conwayI(S2z, I2y.opposite(), Ez, Oz, ["I", "3", "Iz"]);

    const N4x = conwayN(S3x, I3z, ["N", "4", "Nx"]);
    const N4y = conwayN(S3y, I3x, ["N", "4", "Ny"]);
    const N4z = conwayN(S3z, I3y.opposite(), ["N", "4", "Nz"]);

    const TD1 = I0x
        .joinPoints(I0z, endPointX, null, tipX, [tipZ, endPointZ])
        .joinPoints(I0y.opposite(), endPointZ, null, [tipX, tipZ], tipY.opposite());
    const PA1x = I0x.joinPoints(I0x.opposite(), tipX, null, endPointX, endPointX.opposite());
    const PA1y = I0y.joinPoints(I0y.opposite(), tipY, null, endPointY, endPointY.opposite());
    const PA1z = I0z.joinPoints(I0z.opposite(), tipZ, null, endPointZ, endPointZ.opposite());

    const TA0 = Tile.withAlternatingEdges([endPointX.opposite(), endPointY, endPointZ.opposite()]);

    const TC1 = smallPropeller(PA1x, PA1y, PA1z, TD1, M1x, M1y, M1z);
    const TB1 = largePropeller(PA1x, PA1y, PA1z, TA0, TD1, M1x, M1y, M1z);

    const TA1 = bird(TB1, TC1, S1x, S1y, S1z);
    const PB1x = penguinX(TB1, TC1, PA1x, S1y, S1z);
    const PB1y = penguinY(TB1, TC1, PA1y, S1x, S1z);
    const PB1z = penguinZ(TB1, TC1, PA1z, S1x, S1y);

    const TD2 = rose(TC1, PB1x, PB1y, PB1z, N2x, N2y, N2z);
    const PA2x = rectangleX(PB1x, TA1, N2x);
    const PA2y = rectangleY(PB1y, TA1, N2y);
    const PA2z = rectangleZ(PB1z, TA1, N2z);

    const TC2 = smallPropeller(PA2x, PA2y, PA2z, TD2, M2x, M2y, M2z);
    const TB2 = largePropeller(PA2x, PA2y, PA2z, TA1, TD2, M2x, M2y, M2z);

    const TA2 = bird(TB2, TC2, S2x, S2y, S2z);
    const PB2x = penguinX(TB2, TC2, PA2x, S2y, S2z);
    const PB2y = penguinY(TB2, TC2, PA2y, S2x, S2z);
    const PB2z = penguinZ(TB2, TC2, PA2z, S2x, S2y);

    const TD3 = rose(TC2, PB2x, PB2y, PB2z, N3x, N3y, N3z);
    const PA3x = rectangleX(PB2x, TA2, N3x);
    const PA3y = rectangleY(PB2y, TA2, N3y);
    const PA3z = rectangleZ(PB2z, TA2, N3z);


    const TC3 = () => smallPropeller(PA3x, PA3y, PA3z, TD3, M3x, M3y, M3z);
    const TB3 = () => largePropeller(PA3x, PA3y, PA3z, TA2, TD3, M3x, M3y, M3z);

    const TA3 = () => bird(TB3(), TC3(), S3x, S3y, S3z);
    const PB3x = () => penguinX(TB3(), TC3(), PA3x, S3y, S3z);
    const PB3y = () => penguinY(TB3(), TC3(), PA3y, S3x, S3z);
    const PB3z = () => penguinZ(TB3(), TC3(), PA3z, S3x, S3y);

    const TD4 = () => rose(TC3(), PB3x(), PB3y(), PB3z(), N4x, N4y, N4z);

    switch (substitutionLevel) {
        case 0:
            return TD1;
        case 1:
            return TC1;
        case 2:
            return TD2;
        case 3:
            return TC2;
        case 4:
            return TD3;
        case 5:
            return TC3();
        default:
            return TD4();
    }
}

// const lazy = (f) => {
//     let value = null;
//     return () => {
//         if (value === null) {
//             value = f();
//         }
//         return value;
//     }
// };

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

function smallPropeller(px, py, pz, td, mx, my, mz) {
    const tempMPx = mx.opposite()
        .joinPoints(pz.opposite(), endPointX.opposite(), endPointZ.opposite(), null, [endPointZ, endPointZ.opposite()]);
    const tempMPy = my.joinPoints(px.opposite(), endPointY, endPointX.opposite(), null, [endPointX, endPointX.opposite()]);
    const tempMPz = mz.joinPoints(py, endPointZ.opposite(), endPointY, null, [endPointY, endPointY.opposite()]);
    return td.joinPoints(tempMPy, tipY.opposite(), null, [tipX, tipZ], [endPointX])
        .joinPoints(tempMPx, tipX, null, [endPointX, tipZ], [endPointZ])
        .joinPoints(tempMPz, tipZ, null, [endPointX, endPointZ], [endPointY.opposite()]);

}

function largePropeller(px, py, pz, ta, td, mx, my, mz) {
    const tempMPx = mx.opposite()
        .joinPoints(pz.opposite(), endPointX.opposite(), endPointZ.opposite(), null, [endPointZ, endPointZ.opposite()]);
    const tempMPy = my.joinPoints(px.opposite(), endPointY, endPointX.opposite(), null, [endPointX, endPointX.opposite()]);
    const tempMPz = mz.joinPoints(py, endPointZ.opposite(), endPointY, null, [endPointY, endPointY.opposite()]);
    const tempPartY = td.joinPoints(tempMPy, tipY.opposite(), null, [tipX, tipZ], [endPointX])
        .joinPoints(mx.opposite(), tipX, null, [endPointX, tipZ], [endPointX.opposite()]);
    const tempPartX = td.joinPoints(tempMPx, tipX, null, [tipZ, tipY.opposite()], endPointZ)
        .joinPoints(mz, tipZ, null, [endPointZ, tipY.opposite()], [endPointZ.opposite()]);
    const tempPartZ = td.joinPoints(tempMPz, tipZ, null, [tipX, tipY.opposite()], endPointY.opposite())
        .joinPoints(my, tipY.opposite(), null, [tipX, endPointY.opposite()], [endPointY]);
    const temp = ta.joinPoints(tempPartY, endPointZ.opposite(), endPointX.opposite(), [endPointX.opposite(), endPointY], [tipZ]);

    return temp.joinPoints(tempPartX, endPointY, endPointZ.opposite(), [endPointX.opposite(), tipZ], [tipY.opposite()])
        .joinPoints(tempPartZ, endPointX.opposite(), endPointY, [tipY.opposite(), tipZ], [tipX]);
}

function bird(tb, tc, sx, sy, sz) {
    return tb.joinPoints(
        sz.joinPoints(
            tc.opposite(), endPointZ.opposite(), endPointY, [tipX, tipY.opposite()], [endPointZ.opposite()]),
        tipZ, null, [tipX, tipY.opposite()], [endPointZ.opposite()])
        .joinPoints(
            sx.opposite().joinPoints(
                tc.opposite(), endPointX.opposite(), endPointZ.opposite(), [tipY.opposite()], [endPointX.opposite()]),
            tipX, null, [tipY.opposite(), endPointZ.opposite()], [endPointX.opposite()])
        .joinPoints(
            sy.joinPoints(
                tc.opposite(), endPointY, endPointX.opposite(), [], [endPointY]),
            tipY.opposite(), null, [endPointZ.opposite(), endPointX.opposite()], [endPointY]);
}

function penguinX(tb, tc, pax, sy, sz) {
    const topHalfX = tb
        .joinPoints(sz, tipZ, null, [endPointZ, tipY.opposite(), tipX, tipX.opposite()], [endPointZ.opposite()])
        .joinPoints(sy, tipY.opposite(), null, [endPointZ.opposite(), tipX, tipX.opposite()], [endPointY])
        .joinPoints(tc.opposite(), endPointZ.opposite(), endPointY, [endPointY, tipX], []);
    const bottomHalfX = topHalfX.opposite();

    return pax
        .joinPoints(bottomHalfX, endPointX, endPointY.opposite(), [endPointX.opposite()], [tipX.opposite()])
        .joinPoints(topHalfX, endPointX.opposite(), endPointY, [tipX.opposite()], [tipX]);
}

function penguinY(tb, tc, pay, sx, sz) {
    const topHalfY = tb
        .joinPoints(sx.opposite(), tipX, null, [endPointX, tipZ, tipY.opposite()], [endPointX.opposite()])
        .joinPoints(sz, tipZ, null, [endPointX.opposite(), tipY.opposite()], [endPointZ.opposite()])
        .joinPoints(tc.opposite(), endPointX.opposite(), endPointZ.opposite(), [endPointZ.opposite(), tipY.opposite()], []);
    const bottomHalfY = topHalfY.opposite();

    return pay
        .joinPoints(bottomHalfY, endPointY.opposite(), endPointZ, [endPointY], [tipY])
        .joinPoints(topHalfY, endPointY, endPointZ.opposite(), [tipY], [tipY.opposite()]);
}

function penguinZ(tb, tc, paz, sx, sy) {
    const topHalfZ = tb
        .joinPoints(sy, tipY.opposite(), null, [endPointY.opposite(), tipX, tipZ], [endPointY])
        .joinPoints(sx.opposite(), tipX, null, [endPointY, tipZ], [endPointX.opposite()])
        .joinPoints(tc.opposite(), endPointY, endPointX.opposite(), [endPointX.opposite(), tipZ], []);
    const bottomHalfZ = topHalfZ.opposite();

    return paz
        .joinPoints(bottomHalfZ, endPointZ, endPointX, [endPointZ.opposite()], [tipZ.opposite()])
        .joinPoints(topHalfZ, endPointZ.opposite(), endPointX.opposite(), [tipZ.opposite()], [tipZ]);
}

function rose(tc, pbx, pby, pbz, nx, ny, nz) {
    return tc
        .joinPoints(
            pbx.joinPoints(nx, tipX.opposite(), null, [tipX], [endPointX]),
            endPointZ, endPointX, [endPointX, endPointY.opposite()], [tipX])
        .joinPoints(
            pby.joinPoints(ny.opposite(), tipY, null, [tipY.opposite()], [endPointY.opposite()]),
            endPointX, endPointY.opposite(), [endPointY.opposite(), tipX], [tipY.opposite()])
        .joinPoints(
            pbz.joinPoints(nz.opposite(), tipZ.opposite(), null, [tipZ], [endPointZ]),
            endPointY.opposite(), endPointZ, [tipX, tipY.opposite()], [tipZ]);
}

function rectangleX(pbx, ta, nx) {
    return pbx.joinPoints(nx, tipX.opposite(), null, [tipX], [endPointX])
        .joinPoints(ta.opposite(), endPointX, endPointZ, [tipX], [endPointX])
        .joinPoints(nx.opposite(), tipX, null, [endPointX], [endPointX.opposite()])
        .joinPoints(ta, endPointX.opposite(), endPointZ.opposite(), [endPointX], [endPointX.opposite()])
}

function rectangleY(pby, ta, ny) {
    return pby.joinPoints(ny.opposite(), tipY, null, [tipY.opposite()], [endPointY.opposite()])
        .joinPoints(ta.opposite(), endPointY.opposite(), endPointX, [tipY.opposite()], [endPointY.opposite()])
        .joinPoints(ny, tipY.opposite(), null, [endPointY.opposite()], [endPointY])
        .joinPoints(ta, endPointY, endPointX.opposite(), [endPointY.opposite()], [endPointY])
}

function rectangleZ(pbz, ta, nz) {
    return pbz.joinPoints(nz, tipZ, null, [tipZ.opposite()], [endPointZ.opposite()])
        .joinPoints(ta, endPointZ.opposite(), endPointY, [tipZ.opposite()], [endPointZ.opposite()])
        .joinPoints(nz.opposite(), tipZ.opposite(), null, [endPointZ.opposite()], [endPointZ])
        .joinPoints(ta.opposite(), endPointZ, endPointY.opposite(), [endPointZ.opposite()], [endPointZ])
}


export { drawTiling };