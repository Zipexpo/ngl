/**
 * @file Wide Line Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
// @ts-ignore: unused import Vector3 required for declaration only
import { Vector2, Matrix4 } from 'three';
import '../shader/WideLine.vert';
import '../shader/WideLine.frag';
import { BufferRegistry } from '../globals';
import MappedQuadBuffer from './mappedquad-buffer';
import { BufferDefaultParameters, BufferParameterTypes } from './buffer';
export const WideLineBufferDefaultParameters = Object.assign({
    linewidth: 2
}, BufferDefaultParameters);
const WideLineBufferParameterTypes = Object.assign({
    linewidth: { uniform: true }
}, BufferParameterTypes);
/**
 * Wide Line buffer. Draws lines with a fixed width in pixels.
 *
 * @example
 * var lineBuffer = new WideLineBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ])
 * });
 */
class WideLineBuffer extends MappedQuadBuffer {
    constructor(data, params = {}) {
        super(data, params);
        this.parameterTypes = WideLineBufferParameterTypes;
        this.vertexShader = 'WideLine.vert';
        this.fragmentShader = 'WideLine.frag';
        if (!data.color2 && data.color)
            data.color2 = data.color;
        this.addUniforms({
            'linewidth': { value: this.parameters.linewidth },
            'resolution': { value: new Vector2() },
            'projectionMatrixInverse': { value: new Matrix4() }
        });
        this.addAttributes({
            'position1': { type: 'v3', value: null },
            'position2': { type: 'v3', value: null },
            'color2': { type: 'c', value: null }
        });
        this.setAttributes(data);
        this.makeMapping();
    }
    get defaultParameters() { return WideLineBufferDefaultParameters; }
    setParameters(params) {
        super.setParameters(params);
    }
}
BufferRegistry.add('wideline', WideLineBuffer);
export default WideLineBuffer;
