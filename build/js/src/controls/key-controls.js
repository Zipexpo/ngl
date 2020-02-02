/**
 * @file Key Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { KeyActionPresets } from './key-actions';
/**
 * Mouse controls
 */
class KeyControls {
    /**
     * @param {Stage} stage - the stage object
     * @param {Object} [params] - the parameters
     * @param {String} params.preset - one of "default"
     * @param {String} params.disabled - flag to disable all actions
     */
    constructor(stage, params = {}) {
        this.stage = stage;
        this.actionList = [];
        this.disabled = params.disabled || false;
        this.preset(params.preset || 'default');
    }
    run(key) {
        if (this.disabled)
            return;
        this.actionList.forEach(a => {
            if (a.key === key) {
                a.callback(this.stage);
            }
        });
    }
    /**
     * Add a key action triggered by pressing the given character.
     * The {@link KeyActions} class provides a number of static methods for
     * use as callback functions.
     *
     * @example
     * // call KeyActions.toggleRock when "k" is pressed
     * stage.keyControls.remove( "k", KeyActions.toggleRock );
     *
     * @param {Char} char - the key/character
     * @param {Function} callback - the callback function for the action
     * @return {undefined}
     */
    add(char, callback) {
        this.actionList.push({ key: char, callback });
    }
    /**
     * Remove a key action. When the callback function
     * is given, only actions that call that function are removed.
     *
     * @example
     * // remove all actions triggered by pressing "k"
     * stage.keyControls.remove( "k" );
     *
     * @example
     * // remove action `toggleRock` triggered by pressing "k"
     * stage.keyControls.remove( "k", toggleRock );
     *
     * @param {Char} char - the key/character
     * @param {Function} [callback] - the callback function for the action
     * @return {undefined}
     */
    remove(char, callback) {
        const actionList = this.actionList.filter(function (a) {
            return !((a.key === char) &&
                (a.callback === callback || callback === undefined));
        });
        this.actionList = actionList;
    }
    /**
     * Set key action preset
     * @param  {String} name - one of "default"
     * @return {undefined}
     */
    preset(name) {
        this.clear();
        const list = KeyActionPresets[name] || [];
        list.forEach(action => this.add(action[0], action[1]));
    }
    /**
     * Remove all key actions
     * @return {undefined}
     */
    clear() {
        this.actionList.length = 0;
    }
}
export default KeyControls;
