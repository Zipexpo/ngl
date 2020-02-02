/**
 * @file Entityindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
/**
 * Color by entity index
 */
class EntityindexColormaker extends Colormaker {
    constructor(params) {
        super(params);
        if (!params.scale) {
            this.parameters.scale = 'Spectral';
        }
        if (!params.domain) {
            this.parameters.domain = [0, params.structure.entityList.length - 1];
        }
        this.entityindexScale = this.getScale();
    }
    atomColor(a) {
        return this.entityindexScale(a.entityIndex);
    }
}
ColormakerRegistry.add('entityindex', EntityindexColormaker);
export default EntityindexColormaker;
