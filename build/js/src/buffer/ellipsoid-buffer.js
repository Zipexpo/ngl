/**
 * @file Ellipsoid Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { IcosahedronBufferGeometry, Vector3 } from 'three';
import { BufferRegistry } from '../globals';
import { defaults } from '../utils';
import GeometryBuffer from './geometry-buffer';
import { BufferDefaultParameters } from './buffer';
const scale = new Vector3();
const target = new Vector3();
const up = new Vector3();
const eye = new Vector3(0, 0, 0);
export const EllipsoidBufferDefaultParameters = Object.assign({
    sphereDetail: 2,
}, BufferDefaultParameters);
/**
 * Ellipsoid buffer. Draws ellipsoids.
 *
 * @example
 * var ellipsoidBuffer = new EllipsoidBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ]),
 *   majorAxis: new Float32Array([ 1, 1, 0 ]),
 *   minorAxis: new Float32Array([ 0.5, 0, 0.5 ]),
 * });
 */
class EllipsoidBuffer extends GeometryBuffer {
    constructor(data, params = {}) {
        super(data, params, new IcosahedronBufferGeometry(1, defaults(params.sphereDetail, 2)));
        this.updateNormals = true;
        this.setAttributes(data, true);
    }
    get defaultParameters() { return EllipsoidBufferDefaultParameters; }
    applyPositionTransform(matrix, i, i3) {
        target.fromArray(this._majorAxis, i3);
        up.fromArray(this._minorAxis, i3);
        matrix.lookAt(eye, target, up);
        scale.set(this._radius[i], up.length(), target.length());
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
BufferRegistry.add('ellipsoid', EllipsoidBuffer);
export default EllipsoidBuffer;
