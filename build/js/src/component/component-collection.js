/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Collection from './collection';
class ComponentCollection extends Collection {
    addRepresentation(name, params) {
        return this.forEach((comp) => comp.addRepresentation(name, params));
    }
    autoView(duration) {
        return this.forEach((comp) => comp.autoView(duration));
    }
}
export default ComponentCollection;
