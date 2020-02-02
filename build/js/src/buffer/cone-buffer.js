/**
 * @file Cone Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Vector3, ConeBufferGeometry } from 'three';
import { BufferRegistry } from '../globals';
import { defaults } from '../utils';
import { calculateCenterArray } from '../math/array-utils';
import GeometryBuffer from './geometry-buffer';
import { BufferDefaultParameters } from './buffer';
const scale = new Vector3();
const eye = new Vector3();
const target = new Vector3();
const up = new Vector3(0, 1, 0);
function getGeo(params = {}) {
    const geo = new ConeBufferGeometry(1, // radius
    1, // height
    defaults(params.radialSegments, 60), // radialSegments
    1, // heightSegments
    defaults(params.openEnded, false) // openEnded
    );
    geo.applyMatrix(new Matrix4().makeRotationX(-Math.PI / 2));
    return geo;
}
export const ConeBufferDefaultParameters = Object.assign({
    radialSegments: 60,
    openEnded: false
}, BufferDefaultParameters);
/**
 * Cone geometry buffer.
 *
 * @example
 * var coneBuffer = new ConeBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
class ConeBuffer extends GeometryBuffer {
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position1 - from positions
     * @param {Float32Array} data.position2 - to positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     */
    constructor(data, params = {}) {
        super({
            position: new Float32Array(data.position1.length),
            color: data.color,
            picking: data.picking
        }, params, getGeo(params));
        this.updateNormals = true;
        this._position = new Float32Array(data.position1.length);
        this.setAttributes(data, true);
    }
    get defaultParameters() { return ConeBufferDefaultParameters; }
    applyPositionTransform(matrix, i, i3) {
        eye.fromArray(this._position1, i3);
        target.fromArray(this._position2, i3);
        matrix.lookAt(eye, target, up);
        const r = this._radius[i];
        scale.set(r, r, eye.distanceTo(target));
        matrix.scale(scale);
    }
    setAttributes(data = {}, initNormals) {
        if (data.position1 && data.position2) {
            calculateCenterArray(data.position1, data.position2, this._position);
            this._position1 = data.position1;
            this._position2 = data.position2;
            data.position = this._position;
        }
        if (data.radius)
            this._radius = data.radius;
        super.setAttributes(data, initNormals);
    }
}
BufferRegistry.add('cone', ConeBuffer);
export default ConeBuffer;
