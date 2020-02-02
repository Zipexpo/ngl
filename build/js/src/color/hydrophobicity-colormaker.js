/**
 * @file Hydrophobicity Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
import { ResidueHydrophobicity, DefaultResidueHydrophobicity } from '../structure/structure-constants';
/**
 * Color by hydrophobicity
 */
class HydrophobicityColormaker extends Colormaker {
    constructor(params) {
        super(params);
        this.resHF = {};
        if (!params.scale) {
            this.parameters.scale = 'RdYlGn';
        }
        const idx = 0; // 0: DGwif, 1: DGwoct, 2: Oct-IF
        for (const name in ResidueHydrophobicity) {
            this.resHF[name] = ResidueHydrophobicity[name][idx];
        }
        this.defaultResidueHydrophobicity = DefaultResidueHydrophobicity[idx];
        if (!params.domain) {
            let min = Infinity;
            let max = -Infinity;
            for (const name in this.resHF) {
                const val = this.resHF[name];
                min = Math.min(min, val);
                max = Math.max(max, val);
            }
            this.parameters.domain = [min, 0, max];
        }
        this.hfScale = this.getScale();
    }
    atomColor(a) {
        return this.hfScale(this.resHF[a.resname] || this.defaultResidueHydrophobicity);
    }
}
ColormakerRegistry.add('hydrophobicity', HydrophobicityColormaker);
export default HydrophobicityColormaker;
