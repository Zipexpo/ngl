/**
 * @file Residueindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import { defaults } from '../utils';
import Colormaker from './colormaker';
/**
 * Color by residue index
 */
class ResidueindexColormaker extends Colormaker {
    constructor(params) {
        super(params);
        this.scalePerChain = {};
        if (!params.scale) {
            this.parameters.scale = 'rainbow';
            this.parameters.reverse = defaults(params.reverse, true);
        }
        params.structure.eachChain((cp) => {
            this.parameters.domain = [cp.residueOffset, cp.residueEnd];
            this.scalePerChain[cp.index] = this.getScale();
        });
    }
    atomColor(a) {
        return this.scalePerChain[a.chainIndex](a.residueIndex);
    }
}
ColormakerRegistry.add('residueindex', ResidueindexColormaker);
export default ResidueindexColormaker;
