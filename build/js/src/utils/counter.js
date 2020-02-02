/**
 * @file Counter
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Log } from '../globals';
import * as signalsWrapper from 'signals';
/**
 * Counter class for keeping track of counts
 */
class Counter {
    constructor() {
        this.count = 0;
        this.signals = {
            countChanged: new signalsWrapper.Signal()
        };
    }
    /**
     * Set the `count` to zero
     * @return {undefined}
     */
    clear() {
        this.change(-this.count);
    }
    /**
     * Change the `count`
     * @fires Counter#countChanged
     * @param {Integer} delta - count change
     * @return {undefined}
     */
    change(delta) {
        this.count += delta;
        this.signals.countChanged.dispatch(delta, this.count);
        if (this.count < 0) {
            Log.warn('Counter.count below zero', this.count);
        }
    }
    /**
     * Increments the `count` by one.
     * @return {undefined}
     */
    increment() {
        this.change(1);
    }
    /**
     * Decrements the `count` by one.
     * @return {undefined}
     */
    decrement() {
        this.change(-1);
    }
    /**
     * Listen to another counter object and change this `count` by the
     * same amount
     * @param  {Counter} counter - the counter object to listen to
     * @return {undefined}
     */
    listen(counter) {
        this.change(counter.count);
        counter.signals.countChanged.add(this.change, this);
    }
    /**
     * Stop listening to the other counter object
     * @param  {Counter} counter - the counter object to stop listening to
     * @return {undefined}
     */
    unlisten(counter) {
        const countChanged = counter.signals.countChanged;
        if (countChanged.has(this.change, this)) {
            countChanged.remove(this.change, this);
        }
    }
    /**
     * Invole the callback function once, when the `count` becomes zero
     * @param  {Function} callback - the callback function
     * @param  {Object}   context - the context for the callback function
     * @return {undefined}
     */
    onZeroOnce(callback, context) {
        if (this.count === 0) {
            callback.call(context);
        }
        else {
            const fn = () => {
                if (this.count === 0) {
                    this.signals.countChanged.remove(fn, this);
                    callback.call(context);
                }
            };
            this.signals.countChanged.add(fn, this);
        }
    }
    dispose() {
        this.clear();
        this.signals.countChanged.dispose();
    }
}
export default Counter;
