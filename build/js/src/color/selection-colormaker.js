/**
 * @file Selection Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Color } from 'three';
import { ColormakerRegistry } from '../globals';
import Selection from '../selection/selection';
import Colormaker from './colormaker';
/**
 * Color based on {@link Selection}
 */
class SelectionColormaker extends Colormaker {
    constructor(params) {
        super(params);
        this.colormakerList = []; // TODO
        this.selectionList = [];
        const dataList = params.dataList || [];
        dataList.forEach((data) => {
            const [scheme, sele, params = {}] = data;
            if (ColormakerRegistry.hasScheme(scheme)) {
                Object.assign(params, {
                    scheme: scheme,
                    structure: this.parameters.structure
                });
            }
            else {
                Object.assign(params, {
                    scheme: 'uniform',
                    value: new Color(scheme).getHex()
                });
            }
            this.colormakerList.push(ColormakerRegistry.getScheme(params));
            this.selectionList.push(new Selection(sele));
        });
    }
    atomColor(a) {
        for (let i = 0, n = this.selectionList.length; i < n; ++i) {
            const test = this.selectionList[i].test;
            if (test && test(a)) {
                return this.colormakerList[i].atomColor(a);
            }
        }
        return 0xFFFFFF;
    }
}
export default SelectionColormaker;
