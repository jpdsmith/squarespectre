class Edge {
    constructor(lengthFn, angleFn) {
        this.lengthFn = lengthFn;
        this.angleFn = angleFn;
    }

    opposite() {
        return new Edge(this.lengthFn, () => Math.PI + this.angleFn());
    }

    get re() {
        return this.lengthFn() * Math.cos(this.angleFn());
    }

    get im() {
        return this.lengthFn() * Math.sin(this.angleFn());
    }

}

export default Edge;