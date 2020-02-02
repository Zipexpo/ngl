/**
 * @file Geometry
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vector3 } from 'three';
import { degToRad } from '../math/math-utils';
export function assignGeometry(totalCoordination) {
    switch (totalCoordination) {
        case 0:
            return 0 /* Spherical */;
        case 1:
            return 1 /* Terminal */;
        case 2:
            return 2 /* Linear */;
        case 3:
            return 3 /* Trigonal */;
        case 4:
            return 4 /* Tetrahedral */;
        default:
            return 8 /* Unknown */;
    }
}
export const Angles = new Map([
    [2 /* Linear */, degToRad(180)],
    [3 /* Trigonal */, degToRad(120)],
    [4 /* Tetrahedral */, degToRad(109.4721)],
    [6 /* Octahedral */, degToRad(90)]
]);
/**
 * Calculate the angles x-1-2 for all x where x is a heavy atom bonded to ap1.
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom
 * @return {number[]}        Angles in radians
 */
export function calcAngles(ap1, ap2) {
    let angles = [];
    const d1 = new Vector3();
    const d2 = new Vector3();
    d1.subVectors(ap2, ap1);
    ap1.eachBondedAtom(x => {
        if (x.number !== 1 /* H */) {
            d2.subVectors(x, ap1);
            angles.push(d1.angleTo(d2));
        }
    });
    return angles;
}
/**
 * Find two neighbours of ap1 to define a plane (if possible) and
 * measure angle out of plane to ap2
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom (out-of-plane)
 * @return {number}        Angle from plane to second atom
 */
export function calcPlaneAngle(ap1, ap2) {
    const x1 = ap1.clone();
    const v12 = new Vector3();
    v12.subVectors(ap2, ap1);
    const neighbours = [new Vector3(), new Vector3()];
    let ni = 0;
    ap1.eachBondedAtom(x => {
        if (ni > 1) {
            return;
        }
        if (x.number !== 1 /* H */) {
            x1.index = x.index;
            neighbours[ni++].subVectors(x, ap1);
        }
    });
    if (ni === 1) {
        x1.eachBondedAtom(x => {
            if (ni > 1) {
                return;
            }
            if (x.number !== 1 /* H */ && x.index !== ap1.index) {
                neighbours[ni++].subVectors(x, ap1);
            }
        });
    }
    if (ni !== 2) {
        return;
    }
    const cp = neighbours[0].cross(neighbours[1]);
    return Math.abs((Math.PI / 2) - cp.angleTo(v12));
}
