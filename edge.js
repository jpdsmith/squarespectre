class Edge {
    constructor(length, angle, direction = 1, parity = 1, surroundsHole = false) {
        this.length = length;
        this.angle = angle;
        this.direction = direction;
        this.parity = parity;
        this.surroundsHole = surroundsHole;
    }

    inwards() {
        return new Edge(this.length, this.angle, -1, this.parity, this.surroundsHole);
    }

    withParity(parity) {
        return new Edge(this.length, this.angle, this.direction, parity, this.surroundsHole);
    }

    opposite() {
        return new Edge(this.length, Math.PI + this.angle, this.direction, this.parity, this.surroundsHole);
    }

    markHole() {
        return new Edge(this.length, this.angle, this.direction, this.parity, true);
    }

    get re() {
        return this.length * Math.cos(this.angle);
    }

    midRe(angle) {
        const theta = this.parity == 1 ? this.direction*(angle/2+Math.PI/4) : this.direction*(-1*angle/2+Math.PI/4);
        return this.length * Math.cos(theta)* Math.cos(theta + this.angle);
    }

    get im() {
        return this.length * Math.sin(this.angle);
    }

    midIm(angle) {
        const theta = this.parity == 1 ? this.direction*(angle/2+Math.PI/4) : this.direction*(-1*angle/2+Math.PI/4);
        return this.length * Math.cos(theta) * Math.sin(theta + this.angle);
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