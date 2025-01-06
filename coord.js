class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }


    plus(val) {
        return new Coord(this.x + val.x, this.y + val.y);
    }

    minus(val) {
        return new Coord(this.x - val.x, this.y - val.y);
    }

    opposite() {
        return new Coord(-this.x, -this.y);
    }
}

export { Coord };