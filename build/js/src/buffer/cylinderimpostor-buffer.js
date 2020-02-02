/**
 * @file Cylinder Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
// @ts-ignore: unused import Vector3 required for declaration only
import { Matrix4 } from 'three';
import '../shader/CylinderImpostor.vert';
import '../shader/CylinderImpostor.frag';
import MappedAlignedBoxBuffer from './mappedalignedbox-buffer.js';
import { BufferDefaultParameters, BufferParameterTypes } from './buffer';
export const CylinderImpostorBufferDefaultParameters = Object.assign({
    openEnded: false
}, BufferDefaultParameters);
const CylinderImpostorBufferParameterTypes = Object.assign({
    openEnded: { updateShader: true }
}, BufferParameterTypes);
/**
 * Cylinder impostor buffer.
 *
 * @example
 * var cylinderimpostorBuffer = new CylinderImpostorBuffer({
 *     position1: new Float32Array([ 0, 0, 0 ]),
 *     position2: new Float32Array([ 1, 1, 1 ]),
 *     color: new Float32Array([ 1, 0, 0 ]),
 *     color2: new Float32Array([ 0, 1, 0 ]),
 *     radius: new Float32Array([ 1 ])
 * });
 */
class CylinderImpostorBuffer extends MappedAlignedBoxBuffer {
    /**
     * make cylinder impostor buffer
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position1 - from positions
     * @param  {Float32Array} data.position2 - to positions
     * @param  {Float32Array} data.color - from colors
     * @param  {Float32Array} data.color2 - to colors
     * @param  {Float32Array} data.radius - radii
     * @param  {Picker} data.picking - picking ids
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data, params = {}) {
        super(data, params);
        this.parameterTypes = CylinderImpostorBufferParameterTypes;
        this.isImpostor = true;
        this.vertexShader = 'CylinderImpostor.vert';
        this.fragmentShader = 'CylinderImpostor.frag';
        this.addUniforms({
            'modelViewMatrixInverse': { value: new Matrix4() },
            'ortho': { value: 0.0 }
        });
        this.addAttributes({
            'position1': { type: 'v3', value: null },
            'position2': { type: 'v3', value: null },
            'color2': { type: 'c', value: null },
            'radius': { type: 'f', value: null }
        });
        this.setAttributes(data);
        this.makeMapping();
    }
    get defaultParameters() { return CylinderImpostorBufferDefaultParameters; }
    getDefines(type) {
        const defines = MappedAlignedBoxBuffer.prototype.getDefines.call(this, type);
        if (!this.parameters.openEnded) {
            defines.CAP = 1;
        }
        return defines;
    }
}
export default CylinderImpostorBuffer;
