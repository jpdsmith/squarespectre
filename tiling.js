
import Tile from './tile.js';
import { Edge, ControlPoint } from './edge.js';

function drawTiling(ctx, angleValue) {
    const angle = () => angleValue;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const e1 = new Edge(() => 1, () => Math.PI / 2);
    const e2 = new Edge(() => 1, () => Math.PI / 6);
    const e3 = new Edge(() => 1, () => -Math.PI / 6);
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

    const I0x = even1;
    const I0y = even2;
    const I0z = even3;
    const S0x = new Tile([controlPoint]);
    const S0y = new Tile([controlPoint]);
    const S0z = new Tile([controlPoint]);

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

    const S1x = conwaySa(S0x, I0x, S0y, I0y, Ex, Ox);
    const S1y = conwaySa(S0y, I0y, S0z, I0z, Ey, Oy);
    const S1z = conwaySa(S0z, I0z.opposite(), S0x, I0x, Ez, Oz);
    const I1x = conwayIa(S0x, I0x, Ex, Ox);
    const I1y = conwayIa(S0y, I0y, Ey, Oy);
    const I1z = conwayIa(S0z, I0z.opposite(), Ez, Oz);


    const S2x = conwaySa(S1x, I1z, S1y, I1x, Ex, Ox);
    const I2x = conwayIa(S1x, I1z, Ex, Ox);
    const S2y = conwaySa(S1y, I1x, S1z.opposite(), I1y, Ey, Oy);
    const I2y = conwayIa(S1y, I1x, Ey, Oy);

    const S2z = conwaySa(S1z, I1y.opposite(), S1x, I1z, Ez, Oz);
    const I2z = conwayIa(S1z, I1y.opposite(), Ez, Oz);


    const S3x = conwaySa(S2x, I2z, S2y, I2x, Ex, Ox);
    S3x.draw(ctx);
}

function conwaySa(sa, ia, sb, ib, e, o) {
    return sa.join(ia).join(sa).join(ia).join(sa)
        .join(e)
        .join(sb).join(ib).join(sb)
        .join(o)
        .join(sa).join(ia).join(sa).join(ia).join(sa);
}
function conwayIa(sa, ia, e, o) {
    return o
        .join(sa).join(ia).join(sa).join(ia).join(sa)
        .join(e);
}

export { drawTiling };