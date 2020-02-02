/**
 * @file Chainid Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
/**
 * Color by chain id
 */
class ChainidColormaker extends Colormaker {
    constructor(params) {
        super(params);
        this.chainidDictPerModel = {};
        this.scalePerModel = {};
        if (!params.scale) {
            this.parameters.scale = 'Spectral';
        }
        params.structure.eachModel((mp) => {
            let i = 0;
            const chainidDict = {};
            mp.eachChain(function (cp) {
                if (chainidDict[cp.chainid] === undefined) {
                    chainidDict[cp.chainid] = i;
                    i += 1;
                }
            });
            this.parameters.domain = [0, i - 1];
            this.chainidDictPerModel[mp.index] = chainidDict;
            this.scalePerModel[mp.index] = this.getScale();
        });
    }
    atomColor(a) {
        const chainidDict = this.chainidDictPerModel[a.modelIndex];
        return this.scalePerModel[a.modelIndex](chainidDict[a.chainid]);
    }
}
ColormakerRegistry.add('chainid', ChainidColormaker);
export default ChainidColormaker;
