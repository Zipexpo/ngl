/**
 * @file Queue
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
class Queue {
    constructor(fn, argList) {
        this.fn = fn;
        this.queue = [];
        this.pending = false;
        this.next = this.next.bind(this);
        if (argList) {
            for (let i = 0, il = argList.length; i < il; ++i) {
                this.queue.push(argList[i]);
            }
            this.next();
        }
    }
    run(arg) {
        this.fn(arg, this.next);
    }
    next() {
        const arg = this.queue.shift();
        if (arg !== undefined) {
            this.pending = true;
            setTimeout(() => this.run(arg));
        }
        else {
            this.pending = false;
        }
    }
    push(arg) {
        this.queue.push(arg);
        if (!this.pending)
            this.next();
    }
    kill() {
        this.queue.length = 0;
    }
    length() {
        return this.queue.length;
    }
}
export default Queue;
