/**
 * @file Randomcoilindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
/**
 * Color by random coil index
 */
class RandomcoilindexColormaker extends Colormaker {
    constructor(params) {
        super(params);
        this.rciDict = {};
        if (!params.scale) {
            this.parameters.scale = 'RdYlBu';
        }
        this.rciScale = this.getScale({ domain: [0.6, 0] });
        const val = params.structure.validation;
        if (val)
            this.rciDict = val.rciDict;
    }
    atomColor(atom) {
        let sele = `[${atom.resname}]${atom.resno}`;
        if (atom.chainname)
            sele += ':' + atom.chainname;
        const rci = this.rciDict[sele];
        return rci !== undefined ? this.rciScale(rci) : 0x909090;
    }
}
ColormakerRegistry.add('randomcoilindex', RandomcoilindexColormaker);
export default RandomcoilindexColormaker;
