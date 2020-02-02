/**
 * @file Key Actions
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
/**
 * Key actions provided as static methods
 */
class KeyActions {
    /**
     * Stage auto view
     */
    static autoView(stage) {
        stage.autoView(1000);
    }
    /**
     * Toggle stage animations
     */
    static toggleAnimations(stage) {
        stage.animationControls.toggle();
    }
    /**
     * Toggle stage rocking
     */
    static toggleRock(stage) {
        stage.toggleRock();
    }
    /**
     * Toggle stage spinning
     */
    static toggleSpin(stage) {
        stage.toggleSpin();
    }
    /**
     * Toggle anti-aliasing
     */
    static toggleAntialiasing(stage) {
        const p = stage.getParameters();
        stage.setParameters({ sampleLevel: p.sampleLevel === -1 ? 0 : -1 });
    }
}
export const KeyActionPresets = {
    default: [
        ['i', KeyActions.toggleSpin],
        ['k', KeyActions.toggleRock],
        ['p', KeyActions.toggleAnimations],
        ['a', KeyActions.toggleAntialiasing],
        ['r', KeyActions.autoView]
    ]
};
export default KeyActions;
