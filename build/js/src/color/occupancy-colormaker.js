/**
 * @file Occupancy Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
/**
 * Color by occupancy
 */
class OccupancyColormaker extends Colormaker {
    constructor(params) {
        super(params);
        if (!params.scale) {
            this.parameters.scale = 'PuBu';
        }
        if (!params.domain) {
            this.parameters.domain = [0.0, 1.0];
        }
        this.occupancyScale = this.getScale();
    }
    atomColor(a) {
        return this.occupancyScale(a.occupancy);
    }
}
ColormakerRegistry.add('occupancy', OccupancyColormaker);
export default OccupancyColormaker;
