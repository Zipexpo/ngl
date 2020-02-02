/**
 * @file Volume Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ComponentRegistry } from '../globals';
import Component from './component';
/**
 * Component wrapping a {@link Volume} object
 *
 * @example
 * // get a volume component by loading a volume file into the stage
 * stage.loadFile( "url/for/volume" ).then(function(volumeComponent){
 *   volumeComponent.addRepresentation('surface');
 *   volumeComponent.autoView();
 * });
 */
class VolumeComponent extends Component {
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {Volume} volume - volume object to wrap
     * @param {ComponentParameters} params - component parameters
     */
    constructor(stage, volume, params = {}) {
        super(stage, volume, Object.assign({ name: volume.name }, params));
        this.volume = volume;
    }
    /**
     * Component type
     * @type {String}
     */
    get type() { return 'volume'; }
    /**
     * Add a new volume representation to the component
     */
    addRepresentation(type, params = {}) {
        return this._addRepresentation(type, this.volume, params);
    }
    getBoxUntransformed() {
        return this.volume.boundingBox;
    }
    getCenterUntransformed() {
        return this.volume.center;
    }
    dispose() {
        this.volume.dispose();
        super.dispose();
    }
}
ComponentRegistry.add('volume', VolumeComponent);
export default VolumeComponent;
