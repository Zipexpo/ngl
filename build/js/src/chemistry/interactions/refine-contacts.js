/**
 * @file Refine Contacts
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import { Debug, Log } from '../../globals';
import { defaults } from '../../utils';
import { ContactDefaultParams, isMasterContact } from './contact';
// also allows intra-residue contacts
export function invalidAtomContact(ap1, ap2, masterIdx) {
    return !isMasterContact(ap1, ap2, masterIdx) && (ap1.modelIndex !== ap2.modelIndex ||
        (ap1.altloc && ap2.altloc && ap1.altloc !== ap2.altloc));
}
export function refineLineOfSight(structure, contacts, params = {}) {
    if (Debug)
        Log.time('refineLineOfSight');
    const lineOfSightDistFactor = defaults(params.lineOfSightDistFactor, ContactDefaultParams.lineOfSightDistFactor);
    const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
    const spatialHash = structure.spatialHash;
    const { contactSet, contactStore, features } = contacts;
    const { index1, index2 } = contactStore;
    const { centers, atomSets } = features;
    const { x, y, z } = centers;
    const ac1 = structure.getAtomProxy();
    const ac2 = structure.getAtomProxy();
    const aw = structure.getAtomProxy();
    const c1 = new Vector3();
    const c2 = new Vector3();
    const lineOfSightDist = 3 * lineOfSightDistFactor;
    const lineOfSightDistFactorSq = lineOfSightDistFactor * lineOfSightDistFactor;
    contactSet.forEach(i => {
        c1.set(x[index1[i]], y[index1[i]], z[index1[i]]);
        c2.set(x[index2[i]], y[index2[i]], z[index2[i]]);
        const cx = (c1.x + c2.x) / 2;
        const cy = (c1.y + c2.y) / 2;
        const cz = (c1.z + c2.z) / 2;
        const as1 = atomSets[index1[i]];
        const as2 = atomSets[index2[i]];
        ac1.index = as1[0];
        ac2.index = as2[0];
        spatialHash.eachWithin(cx, cy, cz, lineOfSightDist, (j, dSq) => {
            aw.index = j;
            if (aw.number !== 1 /* H */ &&
                (aw.vdw * aw.vdw * lineOfSightDistFactorSq) > dSq &&
                !invalidAtomContact(ac1, aw, masterIdx) &&
                !invalidAtomContact(ac2, aw, masterIdx) &&
                !as1.includes(j) &&
                !as2.includes(j) &&
                // to ignore atoms in the center of functional groups
                c1.distanceToSquared(aw) > 1 &&
                c2.distanceToSquared(aw) > 1) {
                contactSet.clear(i);
                if (Debug)
                    Log.log('removing', ac1.qualifiedName(), ac2.qualifiedName(), 'because', aw.qualifiedName());
            }
        });
    });
    if (Debug)
        Log.timeEnd('refineLineOfSight');
}
/**
 * For atoms interacting with several atoms in the same residue
 * only the one with the closest distance is kept.
 */
export function refineHydrophobicContacts(structure, contacts) {
    const { contactSet, contactStore, features } = contacts;
    const { type, index1, index2 } = contactStore;
    const { atomSets } = features;
    const ap1 = structure.getAtomProxy();
    const ap2 = structure.getAtomProxy();
    const residueContactDict = {};
    /* keep only closest contact between residues */
    const handleResidueContact = function (dist, i, key) {
        const [minDist, minIndex] = residueContactDict[key] || [Infinity, -1];
        if (dist < minDist) {
            if (minIndex !== -1)
                contactSet.clear(minIndex);
            residueContactDict[key] = [dist, i];
        }
        else {
            contactSet.clear(i);
        }
    };
    contactSet.forEach(i => {
        if (type[i] !== 6 /* Hydrophobic */)
            return;
        ap1.index = atomSets[index1[i]][0];
        ap2.index = atomSets[index2[i]][0];
        const dist = ap1.distanceTo(ap2);
        handleResidueContact(dist, i, `${ap1.index}|${ap2.residueIndex}`);
        handleResidueContact(dist, i, `${ap2.index}|${ap1.residueIndex}`);
    });
}
function isHydrogenBondType(type) {
    return (type === 4 /* HydrogenBond */ ||
        type === 9 /* WaterHydrogenBond */ ||
        type === 10 /* BackboneHydrogenBond */);
}
/**
 * Remove weak hydrogen bonds when the acceptor is involved in
 * a normal/strong hydrogen bond
 */
export function refineWeakHydrogenBonds(structure, contacts) {
    const { contactSet, contactStore, features, adjacencyList } = contacts;
    const { type, index1, index2 } = contactStore;
    const { types } = features;
    contactSet.forEach(i => {
        if (type[i] !== 8 /* WeakHydrogenBond */)
            return;
        let accFeat;
        if (types[index1[i]] === 9 /* WeakHydrogenDonor */) {
            accFeat = index2[i];
        }
        else {
            accFeat = index1[i];
        }
        const n = adjacencyList.countArray[accFeat];
        const offset = adjacencyList.offsetArray[accFeat];
        for (let j = 0; j < n; ++j) {
            const ci = adjacencyList.indexArray[offset + j];
            if (isHydrogenBondType(type[ci])) {
                contactSet.clear(i);
                return;
            }
        }
    });
}
/**
 * Remove hydrogen bonds between groups that also form
 * a salt bridge between each other
 */
export function refineSaltBridges(structure, contacts) {
    const { contactSet, contactStore, features } = contacts;
    const { type, index1, index2 } = contactStore;
    const { atomSets } = features;
    const ionicInteractionDict = {};
    const add = function (idx, i) {
        if (!ionicInteractionDict[idx])
            ionicInteractionDict[idx] = [];
        ionicInteractionDict[idx].push(i);
    };
    contactSet.forEach(i => {
        if (type[i] !== 1 /* IonicInteraction */)
            return;
        atomSets[index1[i]].forEach(idx => add(idx, i));
        atomSets[index2[i]].forEach(idx => add(idx, i));
    });
    contactSet.forEach(i => {
        if (!isHydrogenBondType(type[i]))
            return;
        const iil1 = ionicInteractionDict[atomSets[index1[i]][0]];
        const iil2 = ionicInteractionDict[atomSets[index2[i]][0]];
        if (!iil1 || !iil2)
            return;
        const n = iil1.length;
        for (let j = 0; j < n; ++j) {
            if (iil2.includes(iil1[j])) {
                contactSet.clear(i);
                return;
            }
        }
    });
}
/**
 * Remove hydrophobic and cation-pi interactions between groups that also form
 * a pi-stacking interaction between each other
 */
export function refinePiStacking(structure, contacts) {
    const { contactSet, contactStore, features } = contacts;
    const { type, index1, index2 } = contactStore;
    const { atomSets } = features;
    const piStackingDict = {};
    const add = function (idx, i) {
        if (!piStackingDict[idx])
            piStackingDict[idx] = [];
        piStackingDict[idx].push(i);
    };
    contactSet.forEach(i => {
        if (type[i] !== 3 /* PiStacking */)
            return;
        atomSets[index1[i]].forEach(idx => add(idx, i));
        atomSets[index2[i]].forEach(idx => add(idx, i));
    });
    contactSet.forEach(i => {
        if (type[i] !== 6 /* Hydrophobic */ &&
            type[i] !== 2 /* CationPi */)
            return;
        const pil1 = piStackingDict[atomSets[index1[i]][0]];
        const pil2 = piStackingDict[atomSets[index2[i]][0]];
        if (!pil1 || !pil2)
            return;
        const n = pil1.length;
        for (let j = 0; j < n; ++j) {
            if (pil2.includes(pil1[j])) {
                contactSet.clear(i);
                return;
            }
        }
    });
}
/**
 * Remove ionic interactions between groups that also form
 * a metal coordination between each other
 */
export function refineMetalCoordination(structure, contacts) {
    const { contactSet, contactStore, features } = contacts;
    const { type, index1, index2 } = contactStore;
    const { atomSets } = features;
    const ionicInteractionDict = {};
    const add = function (idx, i) {
        if (!ionicInteractionDict[idx])
            ionicInteractionDict[idx] = [];
        ionicInteractionDict[idx].push(i);
    };
    contactSet.forEach(i => {
        if (type[i] !== 1 /* IonicInteraction */)
            return;
        atomSets[index1[i]].forEach(idx => add(idx, i));
        atomSets[index2[i]].forEach(idx => add(idx, i));
    });
    contactSet.forEach(i => {
        if (type[i] !== 7 /* MetalCoordination */)
            return;
        const iil1 = ionicInteractionDict[atomSets[index1[i]][0]];
        const iil2 = ionicInteractionDict[atomSets[index2[i]][0]];
        if (!iil1 || !iil2)
            return;
        const n = iil1.length;
        for (let j = 0; j < n; ++j) {
            if (iil2.includes(iil1[j])) {
                contactSet.clear(iil1[j]);
                return;
            }
        }
    });
}
// TODO: refactor refineSaltBridges, refinePiStacking and refineMetalCoordination to be DRY
