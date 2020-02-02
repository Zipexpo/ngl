/**
 * @file Contour Buffer
 * @author Fred ludlow <fred.ludlow@gmail.com>
 * @private
 */
import '../shader/Line.vert';
import '../shader/Line.frag';
import Buffer from './buffer';
/**
 * Contour buffer. A buffer that draws lines (instead of triangle meshes).
 */
class ContourBuffer extends Buffer {
    constructor() {
        super(...arguments);
        this.isLine = true;
        this.vertexShader = 'Line.vert';
        this.fragmentShader = 'Line.frag';
    }
}
export default ContourBuffer;
