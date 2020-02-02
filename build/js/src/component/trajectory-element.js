/**
 * @file Trajectory Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import Element, { ElementDefaultParameters } from './element';
/**
 * Trajectory component parameter object.
 * @typedef {Object} TrajectoryComponentParameters - component parameters
 *
 * @property {String} name - component name
 * @property {Integer} initialFrame - initial frame the trajectory is set to
 * @property {Integer} defaultStep - default step size to be used by trajectory players
 * @property {Integer} defaultTimeout - default timeout to be used by trajectory players
 * @property {String} defaultInterpolateType - one of "" (empty string), "linear" or "spline"
 * @property {Integer} defaultInterpolateStep - window size used for interpolation
 * @property {String} defaultMode - either "loop" or "once"
 * @property {String} defaultDirection - either "forward" or "backward"
 */
export const TrajectoryElementDefaultParameters = Object.assign({
    defaultStep: 1,
    defaultTimeout: 50,
    defaultInterpolateType: '',
    defaultInterpolateStep: 5,
    defaultMode: 'loop',
    defaultDirection: 'forward',
    initialFrame: 0
}, ElementDefaultParameters);
/**
 * Component wrapping a {@link Trajectory} object
 */
class TrajectoryElement extends Element {
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {Trajectory} trajectory - the trajectory object
     * @param {TrajectoryComponentParameters} params - component parameters
     * @param {StructureComponent} parent - the parent structure
     */
    constructor(stage, trajectory, params = {}) {
        super(stage, Object.assign({ name: trajectory.name }, params));
        this.trajectory = trajectory;
        this.signals = Object.assign(this.signals, {
            frameChanged: new Signal(),
            playerChanged: new Signal(),
            countChanged: new Signal(),
            parametersChanged: new Signal()
        });
        // signals
        trajectory.signals.frameChanged.add((i) => {
            this.signals.frameChanged.dispatch(i);
        });
        trajectory.signals.playerChanged.add((player) => {
            this.signals.playerChanged.dispatch(player);
        });
        trajectory.signals.countChanged.add((n) => {
            this.signals.countChanged.dispatch(n);
        });
        //
        if (params.initialFrame !== undefined) {
            this.setFrame(params.initialFrame);
        }
    }
    get defaultParameters() { return TrajectoryElementDefaultParameters; }
    /**
     * Component type
     * @type {String}
     */
    get type() { return 'trajectory'; }
    /**
     * Set the frame of the trajectory
     * @param {Integer} i - frame number
     * @return {undefined}
     */
    setFrame(i) {
        this.trajectory.setFrame(i);
    }
    /**
     * Set trajectory parameters
     * @param {TrajectoryParameters} params - trajectory parameters
     * @return {undefined}
     */
    setParameters(params = {}) {
        this.trajectory.setParameters(params);
        this.signals.parametersChanged.dispatch(params);
    }
    dispose() {
        this.trajectory.dispose();
        super.dispose();
    }
}
export default TrajectoryElement;
