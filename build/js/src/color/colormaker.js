/**
 * @file Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Color } from 'three';
import * as chroma from 'chroma-js';
import { createParams } from '../utils';
export const ScaleDefaultParameters = {
    scale: 'uniform',
    mode: 'hcl',
    domain: [0, 1],
    value: 0xFFFFFF,
    reverse: false
};
const tmpColor = new Color();
/**
 * Class for making colors.
 * @interface
 */
class Colormaker {
    /**
     * Create a colormaker instance
     * @param  {ColormakerParameters} params - colormaker parameter
     */
    constructor(params = {}) {
        this.parameters = createParams(params, ScaleDefaultParameters);
        if (typeof this.parameters.value === 'string') {
            this.parameters.value = tmpColor.set(this.parameters.value).getHex();
        }
        if (this.parameters.structure) {
            this.atomProxy = this.parameters.structure.getAtomProxy();
        }
    }
    getScale(params = {}) {
        const p = createParams(params, this.parameters);
        if (p.scale === 'rainbow') {
            p.scale = ['red', 'orange', 'yellow', 'green', 'blue'];
        }
        else if (p.scale === 'rwb') {
            p.scale = ['red', 'white', 'blue'];
        }
        if (p.reverse) {
            p.domain.reverse();
        }
        return chroma
            .scale(p.scale) // TODO
            .mode(p.mode)
            .domain(p.domain)
            .out('num'); // TODO
    }
    /**
     * safe a color to an array
     * @param  {Integer} color - hex color value
     * @param  {Array|TypedArray} array - destination
     * @param  {Integer} offset - index into the array
     * @return {Array} the destination array
     */
    colorToArray(color, array = [], offset = 0) {
        array[offset] = (color >> 16 & 255) / 255;
        array[offset + 1] = (color >> 8 & 255) / 255;
        array[offset + 2] = (color & 255) / 255;
        return array;
    }
    /**
     * safe a atom color to an array
     * @param  {AtomProxy} atom - atom to get color for
     * @param  {Array|TypedArray} array - destination
     * @param  {Integer} offset - index into the array
     * @return {Array} the destination array
     */
    atomColorToArray(atom, array, offset) {
        return this.colorToArray(this.atomColor ? this.atomColor(atom) : 0x000000, array, offset);
    }
    /**
     * return the color for an bond
     * @param  {BondProxy} bond - bond to get color for
     * @param  {Boolean} fromTo - whether to use the first or second atom of the bond
     * @return {Integer} hex bond color
     */
    bondColor(bond, fromTo) {
        if (this.atomProxy && this.atomColor) {
            this.atomProxy.index = fromTo ? bond.atomIndex1 : bond.atomIndex2;
            return this.atomColor(this.atomProxy);
        }
        else {
            return 0x000000;
        }
    }
    /**
     * safe a bond color to an array
     * @param  {BondProxy} bond - bond to get color for
     * @param  {Boolean} fromTo - whether to use the first or second atom of the bond
     * @param  {Array|TypedArray} array - destination
     * @param  {Integer} offset - index into the array
     * @return {Array} the destination array
     */
    bondColorToArray(bond, fromTo, array, offset) {
        return this.colorToArray(this.bondColor(bond, fromTo), array, offset);
    }
    /**
     * safe a volume cell color to an array
     * @param  {Integer} index - volume cell index
     * @param  {Array|TypedArray} array - destination
     * @param  {Integer} offset - index into the array
     * @return {Array} the destination array
     */
    volumeColorToArray(index, array, offset) {
        return this.colorToArray(this.volumeColor ? this.volumeColor(index) : 0x000000, array, offset);
    }
    /**
     * safe a color for coordinates in space to an array
     * @param  {Vector3} coords - xyz coordinates
     * @param  {Array|TypedArray} array - destination
     * @param  {Integer} offset - index into the array
     * @return {Array} the destination array
     */
    positionColorToArray(coords, array, offset) {
        return this.colorToArray(this.positionColor ? this.positionColor(coords) : 0x000000, array, offset);
    }
}
export default Colormaker;
