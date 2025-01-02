class Edge {
    constructor(lengthFn, angleFn, direction = 1, parity = 1, surroundsHole = false) {
        this.lengthFn = lengthFn;
        this.angleFn = angleFn;
        this.direction = direction;
        this.parity = parity;
        this.surroundsHole = surroundsHole;
    }

    inwards() {
        return new Edge(this.lengthFn, this.angleFn, -1, this.parity, this.surroundsHole);
    }

    withParity(parity) {
        return new Edge(this.lengthFn, this.angleFn, this.direction, parity, this.surroundsHole);
    }

    opposite() {
        return new Edge(this.lengthFn, () => Math.PI + this.angleFn(), this.direction, this.parity, this.surroundsHole);
    }

    markHole() {
        return new Edge(this.lengthFn, this.angleFn, this.direction, this.parity, true);
    }

    plus(angleFn) {
        return new Edge(this.lengthFn, () => this.angleFn() + angleFn(), this.direction, this.parity, this.surroundsHole);
    }

    times(factor) {
        return new Edge(() => this.lengthFn() * factor(), this.angleFn, this.direction, this.parity, this.surroundsHole);
    }

    get re() {
        return this.lengthFn() * Math.cos(this.angleFn());
    }

    midRe(angle) {
        const theta = this.parity == 1 ? this.direction*(angle()/2+Math.PI/6) : this.direction*(-1*angle()/2+Math.PI/3);
        return this.lengthFn() * Math.cos(theta)* Math.cos(theta + this.angleFn());
    }

    get im() {
        return this.lengthFn() * Math.sin(this.angleFn());
    }

    midIm(angle) {
        const theta = this.parity == 1 ? this.direction*(angle()/2+Math.PI/6) : this.direction*(-1*angle()/2+Math.PI/3);
        return this.lengthFn() * Math.cos(theta) * Math.sin(theta + this.angleFn());
    }

}

class ControlPoint {
    opposite() {
        return this;
    }
}

class EndPoint {
    constructor(type){
        this.type = type;
        this.isOpposite = false;
        this.oppositeValue = null;
    }

    opposite() {
        if (this.oppositeValue === null) {
            this.oppositeValue = new EndPoint(this.type);
            this.oppositeValue.isOpposite = true;
            this.oppositeValue.oppositeValue = this;
        }
        return this.oppositeValue;
    }
}

class TipPoint {
    constructor(type){
        this.type = type;
        this.isOpposite = false;
        this.oppositeValue = null;
    }

    opposite() {
        if (this.oppositeValue === null) {
            this.oppositeValue = new TipPoint(this.type);
            this.oppositeValue.isOpposite = true;
            this.oppositeValue.oppositeValue = this;
        }
        return this.oppositeValue;
    }
}


export { Edge, ControlPoint, EndPoint, TipPoint };