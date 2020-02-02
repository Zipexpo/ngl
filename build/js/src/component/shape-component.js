/**
 * @file Shape Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ComponentRegistry } from '../globals';
import Component from './component';
/**
 * Component wrapping a {@link Shape} object
 *
 * @example
 * // get a shape component by adding a shape object to the stage
 * var shape = new NGL.Shape( "shape" );
 * shape.addSphere( [ 0, 0, 0 ], [ 1, 0, 0 ], 1.5 );
 * var shapeComponent = stage.addComponentFromObject( shape );
 * shapeComponent.addRepresentation( "buffer" );
 */
class ShapeComponent extends Component {
    constructor(stage, shape, params = {}) {
        super(stage, shape, Object.assign({ name: shape.name }, params));
        this.shape = shape;
    }
    /**
     * Component type
     * @type {String}
     */
    get type() { return 'shape'; }
    /**
     * Add a new shape representation to the component
     * @param {String} type - the name of the representation, one of:
     *                        buffer.
     * @param {BufferRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation(type, params = {}) {
        return this._addRepresentation(type, this.shape, params);
    }
    getBoxUntransformed() {
        return this.shape.boundingBox;
    }
    getCenterUntransformed() {
        return this.shape.center;
    }
    dispose() {
        this.shape.dispose();
        super.dispose();
    }
}
ComponentRegistry.add('shape', ShapeComponent);
export default ShapeComponent;
