/**
 * @file Chainname Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
/**
 * Color by chain name
 */
class ChainnameColormaker extends Colormaker {
    constructor(params) {
        super(params);
        this.chainnameDictPerModel = {};
        this.scalePerModel = {};
        if (!params.scale) {
            this.parameters.scale = 'Spectral';
        }
        params.structure.eachModel((mp) => {
            let i = 0;
            const chainnameDict = {};
            mp.eachChain(function (cp) {
                if (chainnameDict[cp.chainname] === undefined) {
                    chainnameDict[cp.chainname] = i;
                    i += 1;
                }
            });
            this.parameters.domain = [0, i - 1];
            this.chainnameDictPerModel[mp.index] = chainnameDict;
            this.scalePerModel[mp.index] = this.getScale();
        });
    }
    atomColor(a) {
        const chainnameDict = this.chainnameDictPerModel[a.modelIndex];
        return this.scalePerModel[a.modelIndex](chainnameDict[a.chainname]);
    }
}
ColormakerRegistry.add('chainname', ChainnameColormaker);
export default ChainnameColormaker;
