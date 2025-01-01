
import Tile from './tile.js';
import { Edge, ControlPoint, EndPoint, TipPoint } from './edge.js';

const EDGE_LENGTH = 10;

function drawTiling(ctx, angleValue) {
    const angle = () => angleValue;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const e1 = new Edge(() => EDGE_LENGTH, () => Math.PI / 2);
    const e2 = new Edge(() => EDGE_LENGTH, () => Math.PI / 6);
    const e3 = new Edge(() => EDGE_LENGTH, () => -Math.PI / 6);
    const e4 = e1.opposite();
    const e5 = e2.opposite()
    const e6 = e3.opposite();
    const controlPoint = new ControlPoint();
    const endPointX = new EndPoint("X");
    const endPointY = new EndPoint("Y");
    const endPointZ = new EndPoint("Z");
    const tipX = new TipPoint("X");
    const tipY = new TipPoint("Y");
    const tipZ = new TipPoint("Z");

    const S0x = new Tile([controlPoint]);
    const I0x = new Tile([
        e2, e1.plus(angle), tipX, e3, e4.plus(angle),
        controlPoint,
        e4, e5, endPointX, e6, e1]);
    const N0x = I0x;
    const M0x = new Tile([controlPoint]);
    const S0y = new Tile([controlPoint]);
    const I0y = new Tile([
        e3, e2.plus(angle), tipY, e4, e5.plus(angle),
        controlPoint,
        e5, e6, endPointY, e1, e2]);
    const N0y = I0y;
    const M0y = new Tile([controlPoint]);
    const S0z = new Tile([controlPoint]);
    const I0z = new Tile([
        e4, e3.plus(angle), tipZ, e5, e6.plus(angle),
        controlPoint,
        e6, e1, endPointZ, e2, e3]);
    const N0z = I0z;
    const M0z = new Tile([controlPoint]);

    const Ex = new Tile([
        e1.plus(angle), e2.plus(angle), e3.plus(angle), e4.plus(angle),
        e2, e5.plus(angle),
        e3, e2.plus(angle), e4, e5.plus(angle),
        controlPoint,
        e5, e6, e1, e2, e5,
        e6.plus(angle)]);
    const Ox = new Tile([
        e3, e2.plus(angle), e4, e5.plus(angle),
        e2.plus(angle), e3.plus(angle),
        e1, e4.plus(angle), controlPoint, e4,
        e5.plus(angle), e6.plus(angle), e1.plus(angle),
        e5, e6, e1, e2]);

    const Ey = new Tile([
        e2.plus(angle), e3.plus(angle), e4.plus(angle), e5.plus(angle),
        e3, e6.plus(angle),
        e4, e3.plus(angle), e5, e6.plus(angle),
        controlPoint,
        e6, e1, e2, e3, e6,
        e1.plus(angle)]);
    const Oy = new Tile([
        e4, e3.plus(angle), e5, e6.plus(angle),
        e3.plus(angle), e4.plus(angle),
        e2, e5.plus(angle), controlPoint, e5,
        e6.plus(angle), e1.plus(angle), e2.plus(angle),
        e6, e1, e2, e3]);

    const Ez = new Tile([
        e6.plus(angle), e1.plus(angle), e2.plus(angle), e3.plus(angle),
        e1, e4.plus(angle),
        e2, e1.plus(angle), e3, e4.plus(angle),
        controlPoint,
        e4, e5, e6, e1, e4,
        e5.plus(angle)]);
    const Oz = new Tile([
        e2, e1.plus(angle), e3, e4.plus(angle),
        e1.plus(angle), e2.plus(angle),
        e6, e3.plus(angle), controlPoint, e3,
        e4.plus(angle), e5.plus(angle), e6.plus(angle),
        e4, e5, e6, e1]);

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
    const TD1 = I0x.joinToEndPoint(I0z).joinToEndPoint(I0y.opposite()).edgesAndTipsOnly();
    const PA1x = I0x.joinToTip(I0x.opposite());
    const PA1y = I0y.joinToTip(I0y.opposite());
    const PA1z = I0z.joinToTip(I0z.opposite());

    const tempMPx = M1x.opposite().joinPoints(PA1z.opposite(), endPointX.opposite(), endPointZ.opposite());
    const tempMPy = M1y.joinPoints(PA1x.opposite(), endPointY, endPointX.opposite());
    const tempMPz = M1z.joinPoints(PA1y, endPointZ.opposite(), endPointY);
    const TC1 = TD1.joinPoints(tempMPy.edgesAndEndPointsOnly(), tipY.opposite())
        .joinPoints(tempMPx.edgesAndEndPointsOnly(), tipX)
        .joinPoints(tempMPz.edgesAndEndPointsOnly(), tipZ);

    const tempPartY = TD1.joinPoints(tempMPy.edgesAndEndPointsOnly(), tipY.opposite()).edgesAndTipsOnly()
        .joinPoints(M1x.opposite(), tipX);
    const tempPartX = TD1.joinPoints(tempMPx.edgesAndEndPointsOnly(), tipX).edgesAndTipsOnly()
        .joinPoints(M1z, tipZ);
    const tempPartZ = TD1.joinPoints(tempMPz.edgesAndEndPointsOnly(), tipZ).edgesAndTipsOnly()
        .joinPoints(M1y, tipY.opposite());
    const TA0 = new Tile([endPointX.opposite(), endPointY, endPointZ]);
    const temp = TA0.joinPoints(tempPartY, endPointZ, endPointX.opposite());

    const TB1 = temp.joinPoints(tempPartX, endPointY, endPointZ.opposite())
        .joinPoints(tempPartZ, endPointX.opposite(), endPointY)
        .edgesAndTipsOnly();

    const TA1 = TB1.joinPoints(S1z.joinPoints(TC1.opposite(), endPointZ.opposite(), endPointY),
        tipZ
    ).joinPoints(
        S1x.opposite().joinPoints(TC1.opposite(), endPointX.opposite(), endPointZ.opposite()),
        tipX
    ).joinPoints(
        S1y.joinPoints(TC1.opposite(), endPointY, endPointX.opposite()),
        tipY.opposite());
    TA1.draw(ctx);
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