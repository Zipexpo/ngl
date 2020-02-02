/**
 * @file Radius Factory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { defaults } from '../utils';
import { NucleicBackboneAtoms } from '../structure/structure-constants';
export const RadiusFactoryTypes = {
    '': '',
    'vdw': 'by vdW radius',
    'covalent': 'by covalent radius',
    'sstruc': 'by secondary structure',
    'bfactor': 'by bfactor',
    'size': 'size',
    'data': 'data',
    'explicit': 'explicit'
};
class RadiusFactory {
    constructor(params = {}) {
        this.max = 10;
        this.type = defaults(params.type, 'size');
        this.scale = defaults(params.scale, 1);
        this.size = defaults(params.size, 1);
        this.data = defaults(params.data, {});
    }
    atomRadius(a) {
        let r;
        switch (this.type) {
            case 'vdw':
                r = a.vdw;
                break;
            case 'covalent':
                r = a.covalent;
                break;
            case 'bfactor':
                r = a.bfactor || 1.0;
                break;
            case 'sstruc':
                const sstruc = a.sstruc;
                if (sstruc === 'h') {
                    r = 0.25;
                }
                else if (sstruc === 'g') {
                    r = 0.25;
                }
                else if (sstruc === 'i') {
                    r = 0.25;
                }
                else if (sstruc === 'e') {
                    r = 0.25;
                }
                else if (sstruc === 'b') {
                    r = 0.25;
                }
                else if (NucleicBackboneAtoms.includes(a.atomname)) {
                    r = 0.4;
                }
                else {
                    r = 0.1;
                }
                break;
            case 'data':
                r = defaults(this.data[a.index], 1.0);
                break;
            case 'explicit':
                // defaults is inappropriate as AtomProxy.radius returns
                // null for missing radii
                r = a.radius;
                if (r === null)
                    r = this.size;
                break;
            default:
                r = this.size;
                break;
        }
        return Math.min(r * this.scale, this.max);
    }
}
RadiusFactory.types = RadiusFactoryTypes;
export default RadiusFactory;
