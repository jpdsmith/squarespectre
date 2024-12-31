
import Tile from './tile.js';
import { Edge, ControlPoint } from './edge.js';

const EDGE_LENGTH = 50;

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
    const even3 = new Tile([
        e4, e3.plus(angle), e5, e6.plus(angle),
        controlPoint,
        e6, e1, e2, e3]);
    const even2 = new Tile([
        e3, e2.plus(angle), e4, e5.plus(angle),
        controlPoint,
        e5, e6, e1, e2]);

    const even1 = new Tile([
        e2, e1.plus(angle), e3, e4.plus(angle),
        controlPoint,
        e4, e5, e6, e1]);

    const S0x = new Tile([controlPoint]);
    const I0x = even1;
    const N0x = I0x;
    const M0x = new Tile([controlPoint]);
    const S0y = new Tile([controlPoint]);
    const I0y = even2;
    const N0y = I0y;
    const M0y = new Tile([controlPoint]);
    const S0z = new Tile([controlPoint]);
    const I0z = even3;
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
    I0x.join(I0y).join(I0z).draw(ctx);
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