/**
 * @file Contact Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Store from './store';
/**
 * Bond store
 */
export default class ContactStore extends Store {
    get _defaultFields() {
        return [
            ['index1', 1, 'int32'],
            ['index2', 1, 'int32'],
            ['type', 1, 'int8']
        ];
    }
    addContact(index1, index2, type) {
        this.growIfFull();
        const i = this.count;
        if (index1 < index2) {
            this.index1[i] = index1;
            this.index2[i] = index2;
        }
        else {
            this.index2[i] = index1;
            this.index1[i] = index2;
        }
        if (type)
            this.type[i] = type;
        this.count += 1;
    }
}
