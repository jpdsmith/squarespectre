import {Color, ColorPalette} from "./color_palette.js";

class Mystics extends ColorPalette {
    constructor() {
        super();
        this.oddColor =  new Color("#f0f0f0");
        this.xColor =  new Color("#ff0000");
        this.yColor =  new Color("#00ff00");
        this.zColor =  new Color("#0000ff");
        this.defaultColor =  new Color("#ffffff");

    }

    getLabels() {
        return ["Odd", "X", "Y", "Z"];
    }

    getColorsForLabel(label) {
        if (label === "Odd") {
            return [this.oddColor];
        }
        if (label === "X") {
            return [this.xColor];
        }
        if (label === "Y") {
            return [this.yColor];
        }
        if (label === "Z") {
            return [this.zColor];
        }
    }

    getColorForLabels(labels, wormColorLabels) {
        if (labels.includes("Odd")) {
            return this.oddColor;
        }
        if (labels.includes("X")) {
            return this.xColor;
        }
        if (labels.includes("Y")) {
            return this.yColor;
        }
        if (labels.includes("Z")) {
            return this.zColor;
        }
        return this.defaultColor;
    }
}



class Conway extends ColorPalette {
    constructor() {
        super();
        this.sColor =  new Color("#ff0000");
        this.mColor =  new Color("#0000ff");
        this.nColor =  new Color("#ffff00");
        this.defaultColor =  new Color("#ffffff");

    }

    getLabels() {
        return ["default", "S", "M", "N"];
    }

    getColorsForLabel(label) {
        if (label === "default") {
            return [this.defaultColor];
        }
        if (label === "S") {
            return [this.sColor];
        }
        if (label === "M") {
            return [this.mColor];
        }
        if (label === "N") {
            return [this.nColor];
        }
    }

    getColorForLabels(labels, wormColorLabels) {
        let opacity = 1.0;
        if (wormColorLabels.includes("2")) {
            opacity *= 0.65;
        }
        if (wormColorLabels.includes("3")) {
            opacity *= 0.65;
        }
        if (wormColorLabels.includes("S")) {
            return this.sColor.withOpacity(opacity);
        }
        if (wormColorLabels.includes("M")) {
            return this.mColor.withOpacity(opacity);
        }
        if (wormColorLabels.includes("N")) {
            return this.nColor.withOpacity(opacity);
        }
        return this.defaultColor;
    }
}


export {Mystics, Conway};