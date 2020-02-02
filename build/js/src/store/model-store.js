/**
 * @file Model Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Store from './store.js';
/**
 * Model store
 */
export default class ModelStore extends Store {
    get _defaultFields() {
        return [
            ['chainOffset', 1, 'uint32'],
            ['chainCount', 1, 'uint32']
        ];
    }
}
