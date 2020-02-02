/**
 * @file Mesh Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import '../shader/Mesh.vert';
import '../shader/Mesh.frag';
import Buffer from './buffer';
/**
 * Mesh buffer. Draws a triangle mesh.
 *
 * @example
 * var meshBuffer = new MeshBuffer({
 *   position: new Float32Array(
 *     [ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ]
 *   ),
 *   color: new Float32Array(
 *     [ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ]
 *   )
 * });
 */
class MeshBuffer extends Buffer {
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} [data.index] - triangle indices
     * @param  {Float32Array} [data.normal] - radii
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data, params = {}) {
        super(data, params);
        this.vertexShader = 'Mesh.vert';
        this.fragmentShader = 'Mesh.frag';
        this.addAttributes({
            'normal': { type: 'v3', value: data.normal }
        });
        if (data.normal === undefined) {
            this.geometry.computeVertexNormals();
        }
    }
}
export default MeshBuffer;
