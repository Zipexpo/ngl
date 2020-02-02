/**
 * @file Math Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export function degToRad(deg) {
    return deg * 0.01745; // deg * Math.PI / 180
}
export function radToDeg(rad) {
    return rad * 57.29578; // rad * 180 / Math.PI
}
// http://www.broofa.com/Tools/Math.uuid.htm
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
const uuid = new Array(36);
export function generateUUID() {
    let rnd = 0;
    let r;
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            uuid[i] = '-';
        }
        else if (i === 14) {
            uuid[i] = '4';
        }
        else {
            if (rnd <= 0x02)
                rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('');
}
export function countSetBits(i) {
    i = i - ((i >> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
    return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}
export function normalize(value, min, max) {
    return (value - min) / (max - min);
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function pclamp(value) {
    return clamp(value, 0, 100);
}
export function saturate(value) {
    return clamp(value, 0, 1);
}
export function lerp(start, stop, alpha) {
    return start + (stop - start) * alpha;
}
export function spline(p0, p1, p2, p3, t, tension) {
    const v0 = (p2 - p0) * tension;
    const v1 = (p3 - p1) * tension;
    const t2 = t * t;
    const t3 = t * t2;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 +
        (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
        v0 * t + p1;
}
export function smoothstep(min, max, x) {
    x = saturate(normalize(x, min, max));
    return x * x * (3 - 2 * x);
}
export function smootherstep(min, max, x) {
    x = saturate(normalize(x, min, max));
    return x * x * x * (x * (x * 6 - 15) + 10);
}
export function smootheststep(min, max, x) {
    x = saturate(normalize(x, min, max));
    return (-20 * Math.pow(x, 7) +
        70 * Math.pow(x, 6) -
        84 * Math.pow(x, 5) +
        35 * Math.pow(x, 4));
}
export function almostIdentity(value, start, stop) {
    if (value > start)
        return value;
    const a = 2 * stop - start;
    const b = 2 * start - 3 * stop;
    const t = value / start;
    return (a * t + b) * t * t + stop;
}
