/**
 * @file Component Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Collection from './collection.js';
class RepresentationCollection extends Collection {
    setParameters(params) {
        return this.forEach((repr) => repr.setParameters(params));
    }
    setVisibility(value) {
        return this.forEach((repr) => repr.setVisibility(value));
    }
    setSelection(string) {
        return this.forEach((repr) => repr.setSelection(string));
    }
    setColor(color) {
        return this.forEach((repr) => repr.setColor(color));
    }
    update(what) {
        return this.forEach((repr) => repr.update(what));
    }
    build(params) {
        return this.forEach((repr) => repr.build(params));
    }
    dispose(params) {
        return this.forEach((repr) => repr.dispose());
    }
}
export default RepresentationCollection;
