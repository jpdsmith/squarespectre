
import Tile from './tile.js';
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';

const EDGE_LENGTH = 10;


function drawTiling(ctx, angle, xValue, yValue, zValue, morph = 0.0) {
    const ANGLE_1 = Math.PI / 2;
    const ANGLE_2 = Math.PI / 3 + morph * Math.PI * (1 / 4 - 1 / 3);
    const ANGLE_3 = Math.PI / 6 + morph * Math.PI * (1 / 4 - 1 / 6);
    const ANGLE_4 = 0;
    const ANGLE_5 = -Math.PI / 6 + morph * Math.PI * (-1 / 4 + 1 / 6);
    const ANGLE_6 = -Math.PI / 3 + morph * Math.PI * (-1 / 4 + 1 / 3);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // const e1 = new Edge(EDGE_LENGTH, Math.PI / 2);
    // const e02 = new Edge(EDGE_LENGTH, Math.PI / 4);
    // const e03 = new Edge(EDGE_LENGTH, Math.PI / 4);
    // const e04 = new Edge(EDGE_LENGTH, 0);
    // const e05 = new Edge(EDGE_LENGTH, -Math.PI / 4);
    // const e06 = new Edge(EDGE_LENGTH, -Math.PI / 4);
    const e01 = new Edge(zValue * EDGE_LENGTH, ANGLE_1);
    const e02 = new Edge(xValue * EDGE_LENGTH, ANGLE_2 + angle);
    const e03 = new Edge(yValue * EDGE_LENGTH, ANGLE_3);
    const e04 = new Edge(zValue * EDGE_LENGTH, ANGLE_4 + angle);
    const e05 = new Edge(xValue * EDGE_LENGTH, ANGLE_5);
    const e06 = new Edge(yValue * EDGE_LENGTH, ANGLE_6 + angle);
    const e07 = new Edge(zValue * EDGE_LENGTH, Math.PI + ANGLE_1);
    const e08 = new Edge(xValue * EDGE_LENGTH, Math.PI + ANGLE_2 + angle);
    const e09 = new Edge(yValue * EDGE_LENGTH, Math.PI + ANGLE_3);
    const e10 = new Edge(zValue * EDGE_LENGTH, Math.PI + ANGLE_4 + angle);
    const e11 = new Edge(xValue * EDGE_LENGTH, Math.PI + ANGLE_5);
    const e12 = new Edge(yValue * EDGE_LENGTH, Math.PI + ANGLE_6 + angle);

    const controlPoint = new ControlPoint();
    const endPointX = new EndPoint("X");
    const endPointY = new EndPoint("Y");
    const endPointZ = new EndPoint("Z");
    const endPoints = [endPointX, endPointY, endPointZ, endPointX.opposite(), endPointY.opposite(), endPointZ.opposite()];
    const tipX = new TipPoint("X");
    const tipY = new TipPoint("Y");
    const tipZ = new TipPoint("Z");
    const tips = [tipX, tipY, tipZ, tipX.opposite(), tipY.opposite(), tipZ.opposite()];
    const all = [tipX, tipY, tipZ, tipX.opposite(), tipY.opposite(), tipZ.opposite(),
        endPointX, endPointY, endPointZ, endPointX.opposite(), endPointY.opposite(), endPointZ.opposite()
    ];

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
        e01.inwards()], "#fff");
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
        e03.inwards()], "#fff");

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
        e05.inwards()], "#fff");
    const N0z = I0z;
    const M0z = Tile.empty();

    const Ex = Tile.withAlternatingEdges([
        e12.inwards(),
        e02,
        e04.inwards(),
        e06.markHole(),
        e03,
        e08,
        e09,
        e03.inwards(),
        e05.markHole(),
        e02,
        e07,
        e08,
        controlPoint,
        e09,
        e11.inwards(),

        e01,
        e10], "#ff0");
    const Ox = Tile.withAlternatingEdges([
        e05.markHole(),
        e02,
        e07,
        e08,
        e02.inwards(),
        e04.markHole(),
        e01,
        e06,
        controlPoint,
        e07,
        e08,
        e10.inwards(),
        e12,
        e09,
        e11.inwards(),
        e01,
        e03.inwards()
    ], "#ff0");

    const Ey = Tile.withAlternatingEdges([
        e02.inwards(),
        e04,
        e06.inwards(),
        e08.markHole(),
        e05,
        e10,
        e11,
        e05.inwards(),
        e07.markHole(),
        e04,
        e09,
        e10,
        controlPoint,
        e11,
        e01.inwards(),
        e03,
        e12], "#ff0");
    const Oy = Tile.withAlternatingEdges([
        e07.markHole(),
        e04,
        e09,
        e10,
        e04.inwards(),
        e06.markHole(),
        e03,
        e08,
        controlPoint,
        e09,
        e10,
        e12.inwards(),
        e02,
        e11,
        e01.inwards(),
        e03,
        e05.inwards()
    ], "#ff0");

    const Ez = Tile.withAlternatingEdges([
        e10.inwards(),
        e12,
        e02.inwards(),
        e04.markHole(),
        e01,
        e06,
        e03.markHole(),
        e12,
        e05,
        e06,
        controlPoint,
        e07,
        e09.inwards(),
        e11,
        e01.inwards(),
        e07,
        e08], "#ff0");
    const Oz = Tile.withAlternatingEdges([
        e03.markHole(),
        e12,
        e05,
        e06,
        e12.inwards(),
        e02.markHole(),
        e11,
        e04,
        controlPoint,
        e05,
        e06,
        e08.inwards(),
        e10,
        e07,
        e09.inwards(),
        e11,
        e01.inwards()
    ], "#ff0");

    const S1x = conwayS(S0x, I0x, S0y, I0y, Ex, Ox);
    const I1x = conwayI(S0x, I0x, Ex, Ox);
    const N1x = conwayN(S0x, I0x);
    const M1x = conwayM(S0x, I0x, M0x);

    const S1y = conwayS(S0y, I0y, S0z, I0z, Ey, Oy);
    const I1y = conwayI(S0y, I0y, Ey, Oy);
    const N1y = conwayN(S0y, I0y);
    const M1y = conwayM(S0y, I0y, M0y);

    const S1z = conwayS(S0z, I0z.opposite(), S0x, I0x, Ez, Oz);
    const I1z = conwayI(S0z, I0z.opposite(), Ez, Oz);
    const N1z = conwayN(S0z, I0z.opposite());
    const M1z = conwayM(S0z, I0z.opposite(), M0z);

    const S2x = conwayS(S1x, I1z, S1y, I1x, Ex, Ox);
    const I2x = conwayI(S1x, I1z, Ex, Ox);
    const N2x = conwayN(S1x, I1z);
    const M2x = conwayM(S1x, I1z, M1x);

    const S2y = conwayS(S1y, I1x, S1z.opposite(), I1y, Ey, Oy);
    const I2y = conwayI(S1y, I1x, Ey, Oy);
    const N2y = conwayN(S1y, I1x);
    const M2y = conwayM(S1y, I1x, M1y);

    const S2z = conwayS(S1z, I1y.opposite(), S1x, I1z, Ez, Oz);
    const I2z = conwayI(S1z, I1y.opposite(), Ez, Oz);
    const N2z = conwayN(S1z, I1y.opposite());
    const M2z = conwayM(S1z, I1y.opposite(), M1z);

    const S3x = conwayS(S2x, I2z, S2y, I2x, Ex, Ox);
    const M3z = conwayM(S2z, I2y.opposite(), M2z);

    const TD1 = I0x
        .joinPoints(I0z, endPointX, null, tipX, [tipZ, endPointZ])
        .joinPoints(I0y.opposite(), endPointZ, null, [tipX, tipZ], tipY.opposite());
    const PA1x = I0x.joinPoints(I0x.opposite(), tipX, null, endPointX, endPointX.opposite());
    const PA1y = I0y.joinPoints(I0y.opposite(), tipY, null, endPointY, endPointY.opposite());
    const PA1z = I0z.joinPoints(I0z.opposite(), tipZ, null, endPointZ, endPointZ.opposite());

    const tempMPx = M1x.opposite()
        .joinPoints(PA1z.opposite(), endPointX.opposite(), endPointZ.opposite(), null, [endPointZ, endPointZ.opposite()]);
    const tempMPy = M1y.joinPoints(PA1x.opposite(), endPointY, endPointX.opposite(), null, [endPointX, endPointX.opposite()]);
    const tempMPz = M1z.joinPoints(PA1y, endPointZ.opposite(), endPointY, null, [endPointY, endPointY.opposite()]);
    const TC1 = TD1.joinPoints(tempMPy, tipY.opposite(), null, [tipX, tipZ], [endPointX])
        .joinPoints(tempMPx, tipX, null, [endPointX, tipZ], [endPointZ])
        .joinPoints(tempMPz, tipZ, null, [endPointX, endPointZ], [endPointY.opposite()]);

    const tempPartY = TD1.joinPoints(tempMPy, tipY.opposite(), null, [tipX, tipZ], [endPointX])
        .joinPoints(M1x.opposite(), tipX, null, [endPointX, tipZ], [endPointX.opposite()]);
    const tempPartX = TD1.joinPoints(tempMPx, tipX, null, [tipZ, tipY.opposite()], endPointZ)
        .joinPoints(M1z, tipZ, null, [endPointZ, tipY.opposite()], [endPointZ.opposite()]);
    const tempPartZ = TD1.joinPoints(tempMPz, tipZ, null, [tipX, tipY.opposite()], endPointY.opposite())
        .joinPoints(M1y, tipY.opposite(), null, [tipX, endPointY.opposite()], [endPointY]);
    const TA0 = Tile.withAlternatingEdges([endPointX.opposite(), endPointY, endPointZ]);
    const temp = TA0.joinPoints(tempPartY, endPointZ, endPointX.opposite(), [endPointX, endPointY, endPointZ, endPointX.opposite()], [endPointX, tipZ]);

    const TB1 = temp.joinPoints(tempPartX, endPointY, endPointZ.opposite(), [tipZ, endPointX, endPointZ, endPointX.opposite(), tipY.opposite()], [tipY.opposite(), endPointZ])
        .joinPoints(tempPartZ, endPointX.opposite(), endPointY, [tipY.opposite(), tipZ, endPointX, endPointZ], [tipY.opposite(), tipX, endPointY.opposite()]);
    TB1.setColor("teal");

    const TA1 = TB1.joinPoints(
        S1z.joinPoints(
            TC1.opposite(), endPointZ.opposite(), endPointY, [tipX, tipY.opposite()], [endPointZ.opposite()]),
        tipZ, null, [tipX, tipY.opposite()], [endPointZ.opposite()])
        .joinPoints(
            S1x.opposite().joinPoints(
                TC1.opposite(), endPointX.opposite(), endPointZ.opposite(), [tipY.opposite()], [endPointX.opposite()]),
            tipX, null, [tipY.opposite(), endPointZ.opposite()], [endPointX.opposite()])
        .joinPoints(
            S1y.joinPoints(
                TC1.opposite(), endPointY, endPointX.opposite(), [], [endPointY]),
            tipY.opposite(), null, [endPointZ.opposite(), endPointX.opposite()], [endPointY]);

    const topHalfX = TB1
        .joinPoints(S1z, tipZ, null, [endPointZ, tipY.opposite(), tipX, tipX.opposite()], [endPointZ.opposite()])
        .joinPoints(S1y, tipY.opposite(), null, [endPointZ.opposite(), tipX, tipX.opposite()], [endPointY])
        .joinPoints(TC1.opposite(), endPointZ.opposite(), endPointY, [endPointY, tipX], []);
    const bottomHalfX = topHalfX.opposite();

    const PB1x = PA1x
        .joinPoints(bottomHalfX, endPointX, endPointY.opposite(), [endPointX.opposite()], [tipX.opposite()])
        .joinPoints(topHalfX, endPointX.opposite(), endPointY, [tipX.opposite()], [tipX]);

    const topHalfY = TB1
        .joinPoints(S1x.opposite(), tipX, null, [endPointX, tipZ, tipY.opposite()], [endPointX.opposite()])
        .joinPoints(S1z, tipZ, null, [endPointX.opposite(), tipY.opposite()], [endPointZ.opposite()])
        .joinPoints(TC1.opposite(), endPointX.opposite(), endPointZ.opposite(), [endPointZ.opposite(), tipY.opposite()], []);
    const bottomHalfY = topHalfY.opposite();

    const PB1y = PA1y
        .joinPoints(bottomHalfY, endPointY.opposite(), endPointZ, [endPointY], [tipY])
        .joinPoints(topHalfY, endPointY, endPointZ.opposite(), [tipY], [tipY.opposite()]);

    const topHalfZ = TB1
        .joinPoints(S1y, tipY.opposite(), null, [endPointY.opposite(), tipX, tipZ], [endPointY])
        .joinPoints(S1x.opposite(), tipX, null, [endPointY, tipZ], [endPointX.opposite()])
        .joinPoints(TC1.opposite(), endPointY, endPointX.opposite(), [endPointX.opposite(), tipZ], []);
    const bottomHalfZ = topHalfZ.opposite();

    const PB1z = PA1z
        .joinPoints(bottomHalfZ, endPointZ, endPointX, [endPointZ.opposite()], [tipZ.opposite()])
        .joinPoints(topHalfZ, endPointZ.opposite(), endPointX.opposite(), [tipZ.opposite()], [tipZ]);

    //PB1x.setColor("red");
    PB1y.setColor("green");
    PB1z.setColor("blue");

    N2x.setColor("pink");

    const TD2 = TC1
        .joinPoints(
            PB1x.joinPoints(N2x, tipX.opposite(), null, [tipX], [endPointX]),
            endPointZ, endPointX, [endPointX, endPointY.opposite()])
        .joinPoints(
            PB1y.joinPoints(N2y.opposite(), tipY, null, [tipY.opposite()], [endPointY.opposite()]),
            endPointX, endPointY.opposite(), [endPointY.opposite()])
        .joinPoints(
            PB1z.joinPoints(N2z.opposite(), tipZ.opposite(), null, [tipZ], [endPointZ]),
            endPointY.opposite(), endPointZ, [endPointX]);

    const PA2x = PB1x.joinPoints(N2x, tipX.opposite(), null, [tipX], [endPointX])
        .joinPoints(TA1.opposite(), endPointX, endPointZ, [tipX], [endPointX])
        .joinPoints(N2x.opposite(), tipX, null, [endPointX], [endPointX.opposite()])
        .joinPoints(TA1, endPointX.opposite(), endPointZ.opposite(), [endPointX], [endPointX.opposite()])

    const PA2y = PB1y.joinPoints(N2y.opposite(), tipY, null, [tipY.opposite()], [endPointY.opposite()])
        .joinPoints(TA1.opposite(), endPointY.opposite(), endPointX, [tipY.opposite()], [endPointY.opposite()])
        .joinPoints(N2y, tipY.opposite(), null, [endPointY.opposite()], [endPointY])
        .joinPoints(TA1, endPointY, endPointX.opposite(), [endPointY.opposite()], [endPointY])

    const PA2z = PB1z.joinPoints(N2z, tipZ, null, [tipZ.opposite()], [endPointZ.opposite()])
        .joinPoints(TA1, endPointZ.opposite(), endPointY, [tipZ.opposite()], [endPointZ.opposite()])
        .joinPoints(N2z.opposite(), tipZ.opposite(), null, [endPointZ.opposite()], [endPointZ])
        .joinPoints(TA1.opposite(), endPointZ, endPointY.opposite(), [endPointZ.opposite()], [endPointZ])

    PA2z.draw(ctx, angle, morph);
}

function conwayS(sa, ia, sb, ib, e, o) {
    return sa.join(ia).join(sa).join(ia).join(sa)
        .join(e)
        .join(sb).join(ib).join(sb)
        .join(o)
        .join(sa).join(ia).join(sa).join(ia).join(sa);
}
function conwayI(s, i, e, o) {
    return o
        .join(s).join(i).join(s).join(i).join(s)
        .join(e);
}
function conwayN(s, i) {
    return s.join(i).join(s);
}
function conwayM(s, i, m) {
    return s.join(i).join(s).join(i).join(m);
}

export { drawTiling };