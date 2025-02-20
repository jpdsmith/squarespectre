class ColorPalette {
    constructor() {
        if (this.class == ColorPalette) {
            throw new Error("Abstract class - don't instantiate!");
        }
    }

    getLabels() {
        throw new Error("Method 'getLabels' must be implemented.");
    }

    /**
     * Returns a collection of colors.
     *
     * @param {string} label
     * @param {string} wormColorLabels
     * @returns {Array} colors 
     */
    getColorsForLabel(label, wormColorLabels) {
        throw new Error("Method 'colorsForLabel' must be implemented.");
    }

    /**
     * Returns a collection of colors.
     *
     * @param {Array<string>} labels
     * @returns {Color} color 
     */
    getColorForLabels(labels) {
        throw new Error("Method 'colorsForLabel' must be implemented.");
    }
}

class Color {
    constructor(r, g, b, opacity = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.opacity = parseFloat(opacity);
    }

    static fromHexValue(hexValue, opacity = 1.0) {
        const r = parseInt(hexValue.substring(1, 3), 16);
        const g = parseInt(hexValue.substring(3, 5), 16);
        const b = parseInt(hexValue.substring(5, 7), 16);
        return new Color(r, g, b, opacity);
    }

    updateHexValue(hexValue) {
        this.r = parseInt(hexValue.substring(1, 3), 16);
        this.g = parseInt(hexValue.substring(3, 5), 16);
        this.b = parseInt(hexValue.substring(5, 7), 16);
    }

    getHexValue() {
        if (this.opacity < 1.0) {
            return this.getRgbHexValue() + Math.floor(this.opacity * 255).toString(16).padStart(2, "0");
        }
        return this.getRgbHexValue();
    }

    getRgbHexValue() {
        return "#" + this.r.toString(16).padStart(2, "0") + this.g.toString(16).padStart(2, "0") + this.b.toString(16).padStart(2, "0");
    }

    withOpacity(opacity) {
        return new Color(this.r, this.g, this.b, this.opacity * opacity);
    }

    add(other) {
        if (other.opacity <= 0.01) {
            return this;
        }
        if (this.opacity <= 0.01) {
            return other;
        }
        const r = Math.floor((this.opacity*this.r + other.opacity*other.r)/(this.opacity + other.opacity));
        const g = Math.floor((this.opacity*this.g + other.opacity*other.g)/(this.opacity + other.opacity));
        const b = Math.floor((this.opacity*this.b + other.opacity*other.b)/(this.opacity + other.opacity));
        const opacity = Math.max(this.opacity, other.opacity);
        return new Color(r, g, b, opacity);
    }
}

export { ColorPalette, Color };