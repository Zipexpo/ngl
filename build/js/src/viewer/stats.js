/**
 * @file Stats
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import * as signalsWrapper from 'signals';
export default class Stats {
    constructor() {
        this.signals = {
            updated: new signalsWrapper.Signal()
        };
        this.maxDuration = -Infinity;
        this.minDuration = Infinity;
        this.avgDuration = 14;
        this.lastDuration = Infinity;
        this.prevFpsTime = 0;
        this.lastFps = Infinity;
        this.lastFrames = 1;
        this.frames = 0;
        this.count = 0;
        this.begin();
    }
    update() {
        this.startTime = this.end();
        this.currentTime = this.startTime;
        this.signals.updated.dispatch();
    }
    begin() {
        this.startTime = window.performance.now();
        this.lastFrames = this.frames;
    }
    end() {
        const time = window.performance.now();
        this.count += 1;
        this.frames += 1;
        this.lastDuration = time - this.startTime;
        this.minDuration = Math.min(this.minDuration, this.lastDuration);
        this.maxDuration = Math.max(this.maxDuration, this.lastDuration);
        this.avgDuration -= this.avgDuration / 30;
        this.avgDuration += this.lastDuration / 30;
        if (time > this.prevFpsTime + 1000) {
            this.lastFps = this.frames;
            this.prevFpsTime = time;
            this.frames = 0;
        }
        return time;
    }
}
