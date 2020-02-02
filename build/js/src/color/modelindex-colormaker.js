/**
 * @file Modelindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
/**
 * Color by model index
 */
class ModelindexColormaker extends Colormaker {
    constructor(params) {
        super(params);
        if (!params.scale) {
            this.parameters.scale = 'rainbow';
        }
        if (!params.domain) {
            this.parameters.domain = [0, params.structure.modelStore.count];
        }
        this.modelindexScale = this.getScale();
    }
    atomColor(a) {
        return this.modelindexScale(a.modelIndex);
    }
}
ColormakerRegistry.add('modelindex', ModelindexColormaker);
export default ModelindexColormaker;
