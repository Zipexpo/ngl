/**
 * @file Vector Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
// @ts-ignore: unused import Vector3, Matrix4 required for declaration only
import { Color } from 'three';
import '../shader/Line.vert';
import '../shader/Line.frag';
import { uniformArray3 } from '../math/array-utils';
import Buffer, { BufferDefaultParameters } from './buffer';
function getSize(data) {
    const n = data.position.length / 3;
    return n * 2 * 3;
}
export const VectorBufferDefaultParameters = Object.assign({
    scale: 1,
    color: 'grey'
}, BufferDefaultParameters);
/**
 * Vector buffer. Draws vectors as lines.
 */
class VectorBuffer extends Buffer {
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.vector - vectors
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data, params = {}) {
        super({
            position: new Float32Array(getSize(data)),
            color: new Float32Array(getSize(data))
        }, params);
        this.isLine = true;
        this.vertexShader = 'Line.vert';
        this.fragmentShader = 'Line.frag';
        const color = new Color(this.parameters.color);
        const attributes = this.geometry.attributes; // TODO
        uniformArray3(getSize(data) / 3, color.r, color.g, color.b, attributes.color.array);
        this.setAttributes(data);
    }
    get defaultParameters() { return VectorBufferDefaultParameters; }
    setAttributes(data = {}) {
        const attributes = this.geometry.attributes; // TODO
        let position, vector;
        let aPosition;
        if (data.position && data.vector) {
            position = data.position;
            vector = data.vector;
            aPosition = attributes.position.array;
            attributes.position.needsUpdate = true;
        }
        const n = this.size / 2;
        const scale = this.parameters.scale;
        if (position && vector) {
            for (let v = 0; v < n; v++) {
                const i = v * 2 * 3;
                const j = v * 3;
                aPosition[i + 0] = position[j + 0];
                aPosition[i + 1] = position[j + 1];
                aPosition[i + 2] = position[j + 2];
                aPosition[i + 3] = position[j + 0] + vector[j + 0] * scale;
                aPosition[i + 4] = position[j + 1] + vector[j + 1] * scale;
                aPosition[i + 5] = position[j + 2] + vector[j + 2] * scale;
            }
        }
    }
}
export default VectorBuffer;
