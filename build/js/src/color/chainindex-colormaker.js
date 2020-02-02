/**
 * @file Chainindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
/**
 * Color by chain index
 */
class ChainindexColormaker extends Colormaker {
    constructor(params) {
        super(params);
        this.scalePerModel = {};
        if (!params.scale) {
            this.parameters.scale = 'Spectral';
        }
        params.structure.eachModel((mp) => {
            this.parameters.domain = [mp.chainOffset, mp.chainEnd];
            this.scalePerModel[mp.index] = this.getScale();
        });
    }
    atomColor(a) {
        return this.scalePerModel[a.modelIndex](a.chainIndex);
    }
}
ColormakerRegistry.add('chainindex', ChainindexColormaker);
export default ChainindexColormaker;
