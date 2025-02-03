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
    constructor(hexValue, opacity = 1.0) {
        this.hexValue = hexValue;
        this.opacity = opacity;
    }

    getHexValue() {
        if (this.opacity < 1.0) {
            return this.hexValue + Math.floor(this.opacity * 255).toString(16).padStart(2, "0");
        }
        return this.hexValue;
    }

    withOpacity(opacity) {
        return new Color(this.hexValue, this.opacity * opacity);
    }
}

export { ColorPalette, Color };