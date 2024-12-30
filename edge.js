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

class ControlPoint {}

export { Edge, ControlPoint };