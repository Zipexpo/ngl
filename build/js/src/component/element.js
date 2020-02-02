/**
 * @file Element
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import { createParams } from '../utils';
import { generateUUID } from '../math/math-utils';
export const ElementDefaultParameters = {
    name: 'some element',
    status: ''
};
/**
 * Element base class
 */
class Element {
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {ElementParameters} params - component parameters
     */
    constructor(stage, params = {}) {
        this.stage = stage;
        /**
         * Events emitted by the element
         */
        this.signals = {
            statusChanged: new Signal(),
            nameChanged: new Signal(),
            disposed: new Signal()
        };
        this.parameters = createParams(params, this.defaultParameters);
        this.uuid = generateUUID();
    }
    get defaultParameters() { return ElementDefaultParameters; }
    get name() { return this.parameters.name; }
    setStatus(value) {
        this.parameters.status = value;
        this.signals.statusChanged.dispatch(value);
        return this;
    }
    setName(value) {
        this.parameters.name = value;
        this.signals.nameChanged.dispatch(value);
        return this;
    }
    dispose() {
        this.signals.disposed.dispatch();
    }
}
export default Element;
