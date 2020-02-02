/**
 * @file Tetrahedron Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { TorusBufferGeometry, Vector3 } from 'three';
import { BufferRegistry } from '../globals';
import { defaults } from '../utils';
import GeometryBuffer from './geometry-buffer';
import { BufferDefaultParameters } from './buffer';
const scale = new Vector3();
const target = new Vector3();
const up = new Vector3();
const eye = new Vector3(0, 0, 0);
export const TorusBufferDefaultParameters = Object.assign({
    radiusRatio: 0.2,
    radialSegments: 16,
    tubularSegments: 32
}, BufferDefaultParameters);
/**
 * Torus geometry buffer. Draws torii.
 *
 * @example
 * var torusBuffer = new TorusBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ]),
 *   majorAxis: new Float32Array([ 1, 1, 0 ]),
 *   minorAxis: new Float32Array([ 0.5, 0, 0.5 ]),
 * });
 */
class TorusBuffer extends GeometryBuffer {
    constructor(data, params = {}) {
        super(data, params, new TorusBufferGeometry(1, defaults(params.radiusRatio, 0.2), defaults(params.radialSegments, 16), defaults(params.tubularSegments, 32)));
        this.updateNormals = true;
        this.setAttributes(data, true);
    }
    get defaultParameters() { return TorusBufferDefaultParameters; }
    applyPositionTransform(matrix, i, i3) {
        target.fromArray(this._majorAxis, i3);
        up.fromArray(this._minorAxis, i3);
        matrix.lookAt(eye, target, up);
        const r = this._radius[i];
        scale.set(r, r, r);
        matrix.scale(scale);
    }
    setAttributes(data = {}, initNormals) {
        if (data.radius)
            this._radius = data.radius;
        if (data.majorAxis)
            this._majorAxis = data.majorAxis;
        if (data.minorAxis)
            this._minorAxis = data.minorAxis;
        super.setAttributes(data, initNormals);
    }
}
BufferRegistry.add('torus', TorusBuffer);
export default TorusBuffer;
