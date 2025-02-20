import { Color, ColorPalette } from "./color_palette.js";

class Directional extends ColorPalette {
    constructor() {
        super();
        this.oddColor = Color.fromHexValue("#f0f0f0").withOpacity(0.01);
        this.xColor = Color.fromHexValue("#ff0000").withOpacity(0.66);
        this.yColor = Color.fromHexValue("#00ff00").withOpacity(0.66);
        this.zColor = Color.fromHexValue("#0000ff").withOpacity(0.66);
        this.defaultColor = Color.fromHexValue("#ffffff");

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
        this.defaultColor = Color.fromHexValue("#ffffff");
        this.mColor = Color.fromHexValue("#0000ff").withOpacity(0.5);
        this.sColor = Color.fromHexValue("#0000ff");
        this.nColor = Color.fromHexValue("#000099");
    }

    getLabels() {
        return ["default", "M", "S", "N"];
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
        if (wormColorLabels.includes("3")) {
             opacity *= 0.95;
        } else if (wormColorLabels.includes("2")) {
            opacity *= 0.75;
        } else if (wormColorLabels.includes("1")) {
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


class AdvancedColoring extends ColorPalette {
    constructor() {
        super();
        this.defaultColor = Color.fromHexValue("#ffffff").withOpacity(0.2);
        this.oddColor = Color.fromHexValue("#ff0000").withOpacity(1.0);
        this.xColor = Color.fromHexValue("#00ff00").withOpacity(0.25);
        this.yColor = Color.fromHexValue("#1fdbb5").withOpacity(0.25);
        this.zColor = Color.fromHexValue("#0000ff").withOpacity(0.25);
        this.mColor = Color.fromHexValue("#ffffff").withOpacity(0.01);
        this.sColor = Color.fromHexValue("#0000ff").withOpacity(0.01);
        this.nColor = Color.fromHexValue("#0000ff").withOpacity(0.25);
        this.color1 = Color.fromHexValue("#000000").withOpacity(0.01);
        this.color2 = Color.fromHexValue("#000000").withOpacity(1.0);
        this.color3 = Color.fromHexValue("#3030a0").withOpacity(1.0);
    }
 
    getLabels() {
        return ["default", "Odd", "X", "Y", "Z", "M", "S", "N", "1", "2", "3"];
    }

    getColorsForLabel(label) {
        if (label === "default") {
            return [this.defaultColor];
        }
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
        if (label === "S") {
            return [this.sColor];
        }
        if (label === "M") {
            return [this.mColor];
        }
        if (label === "N") {
            return [this.nColor];
        }
        if (label === "1") {
            return [this.color1];
        }
        if (label === "2") {
            return [this.color2];
        }
        if (label === "3") {
            return [this.color3];
        }
    }

    getColorForLabels(labels, wormColorLabels) {
        let color = this.defaultColor;
        if (labels.includes("Odd")) {
            color = color.add(this.oddColor);
        }
        if (labels.includes("X")) {
            color = color.add(this.xColor);
        }
        if (labels.includes("Y")) {
            color = color.add(this.yColor);
        }
        if (labels.includes("Z")) {
            color = color.add(this.zColor);
        }
        if (wormColorLabels.includes("S")) {
            color = color.add(this.sColor);
        }
        if (wormColorLabels.includes("M")) {
            color = color.add(this.mColor);
        }
        if (wormColorLabels.includes("N")) {
            color = color.add(this.nColor);
        }        
        if (wormColorLabels.includes("3")) {
            color = color.add(this.color3);
        } else if (wormColorLabels.includes("2")) {
            color = color.add(this.color2);
        } else if (wormColorLabels.includes("1")) {
            color = color.add(this.color1);
        }
        return color;
    }
}


export { Directional, Conway, AdvancedColoring };