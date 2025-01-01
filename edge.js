class Edge {
    constructor(lengthFn, angleFn) {
        this.lengthFn = lengthFn;
        this.angleFn = angleFn;
    }

    opposite() {
        return new Edge(this.lengthFn, () => Math.PI + this.angleFn());
    }

    plus(angleFn) {
        return new Edge(this.lengthFn, () => this.angleFn() + angleFn());
    }

    get re() {
        return this.lengthFn() * Math.cos(this.angleFn());
    }

    get im() {
        return this.lengthFn() * Math.sin(this.angleFn());
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