/**
 * @file Hydrogen Bonds
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 */
import { defaults } from '../../utils';
import { degToRad } from '../../math/math-utils';
import { valenceModel } from '../../structure/data';
import { Angles, calcAngles, calcPlaneAngle } from '../geometry';
import { addAtom, addFeature, createFeatureState, } from './features';
import { ContactDefaultParams, invalidAtomContact } from './contact';
// Geometric characteristics of hydrogen bonds involving sulfur atoms in proteins
// https://doi.org/10.1002/prot.22327
// Satisfying Hydrogen Bonding Potential in Proteins (HBPLUS)
// https://doi.org/10.1006/jmbi.1994.1334
// http://www.csb.yale.edu/userguides/datamanip/hbplus/hbplus_descrip.html
/**
 * Potential hydrogen donor
 */
export function addHydrogenDonors(structure, features) {
    const { totalH } = valenceModel(structure.data);
    structure.eachAtom(a => {
        const state = createFeatureState(4 /* HydrogenDonor */);
        const an = a.number;
        if (isHistidineNitrogen(a)) {
            // include both nitrogen atoms in histidine due to
            // their often ambiguous protonation assignment
            addAtom(state, a);
            addFeature(features, state);
        }
        else if (totalH[a.index] > 0 &&
            (an === 7 /* N */ || an === 8 /* O */ || an === 16 /* S */)) {
            addAtom(state, a);
            addFeature(features, state);
        }
    });
}
/**
 * Weak hydrogen donor.
 */
export function addWeakHydrogenDonors(structure, features) {
    const { totalH } = valenceModel(structure.data);
    structure.eachAtom(a => {
        if (a.number === 6 /* C */ &&
            totalH[a.index] > 0 &&
            (a.bondToElementCount(7 /* N */) > 0 ||
                a.bondToElementCount(8 /* O */) > 0 ||
                inAromaticRingWithElectronNegativeElement(a))) {
            const state = createFeatureState(9 /* WeakHydrogenDonor */);
            addAtom(state, a);
            addFeature(features, state);
        }
    });
}
function inAromaticRingWithElectronNegativeElement(a) {
    if (!a.isAromatic())
        return false;
    const ringData = a.residueType.getRings();
    if (!ringData)
        return false;
    let hasElement = false;
    const rings = ringData.rings;
    rings.forEach(ring => {
        if (hasElement)
            return; // already found one
        if (ring.some(idx => (a.index - a.residueAtomOffset) === idx)) { // in ring
            hasElement = ring.some(idx => {
                const atomTypeId = a.residueType.atomTypeIdList[idx];
                const number = a.atomMap.get(atomTypeId).number;
                return number === 7 /* N */ || number === 8 /* O */;
            });
        }
    });
    return hasElement;
}
/**
 * Potential hydrogen acceptor
 */
export function addHydrogenAcceptors(structure, features) {
    const { charge, implicitH, idealGeometry } = valenceModel(structure.data);
    structure.eachAtom(a => {
        const state = createFeatureState(5 /* HydrogenAcceptor */);
        const an = a.number;
        if (an === 8 /* O */) {
            // Basically assume all oxygen atoms are acceptors!
            addAtom(state, a);
            addFeature(features, state);
        }
        else if (an === 7 /* N */) {
            if (isHistidineNitrogen(a)) {
                // include both nitrogen atoms in histidine due to
                // their often ambiguous protonation assignment
                addAtom(state, a);
                addFeature(features, state);
            }
            else if (charge[a.index] < 1) {
                // Neutral nitrogen might be an acceptor
                // It must have at least one lone pair not conjugated
                const totalBonds = a.bondCount + implicitH[a.index];
                const ig = idealGeometry[a.index];
                if ((ig === 4 /* Tetrahedral */ && totalBonds < 4) ||
                    (ig === 3 /* Trigonal */ && totalBonds < 3) ||
                    (ig === 2 /* Linear */ && totalBonds < 2)) {
                    addAtom(state, a);
                    addFeature(features, state);
                }
            }
        }
        else if (an === 16) { // S
            if (a.resname === 'CYS' || a.resname === 'MET' || a.formalCharge === -1) {
                addAtom(state, a);
                addFeature(features, state);
            }
        }
    });
}
/**
 * Atom that is only bound to carbon or hydrogen
 */
// function isHydrocarbon (atom: AtomProxy) {
//   let flag = true
//   atom.eachBondedAtom(ap => {
//     const e = ap.element
//     if (e !== 'C' && e !== 'H') flag = false
//   })
//   return flag
// }
function isHistidineNitrogen(ap) {
    return ap.resname === 'HIS' && ap.number == 7 /* N */ && ap.isRing();
}
function isBackboneHydrogenBond(ap1, ap2) {
    return ap1.isBackbone() && ap2.isBackbone();
}
function isWaterHydrogenBond(ap1, ap2) {
    return ap1.isWater() && ap2.isWater();
}
function isHydrogenBond(ti, tj) {
    return ((ti === 5 /* HydrogenAcceptor */ && tj === 4 /* HydrogenDonor */) ||
        (ti === 4 /* HydrogenDonor */ && tj === 5 /* HydrogenAcceptor */));
}
function isWeakHydrogenBond(ti, tj) {
    return ((ti === 9 /* WeakHydrogenDonor */ && tj === 5 /* HydrogenAcceptor */) ||
        (ti === 5 /* HydrogenAcceptor */ && tj === 9 /* WeakHydrogenDonor */));
}
function getHydrogenBondType(ap1, ap2) {
    if (isWaterHydrogenBond(ap1, ap2)) {
        return 9 /* WaterHydrogenBond */;
    }
    else if (isBackboneHydrogenBond(ap1, ap2)) {
        return 10 /* BackboneHydrogenBond */;
    }
    else {
        return 4 /* HydrogenBond */;
    }
}
/**
 * All pairs of hydrogen donor and acceptor atoms
 */
export function addHydrogenBonds(structure, contacts, params = {}) {
    const maxHbondDist = defaults(params.maxHbondDist, ContactDefaultParams.maxHbondDist);
    const maxHbondSulfurDist = defaults(params.maxHbondSulfurDist, ContactDefaultParams.maxHbondSulfurDist);
    const maxHbondAccAngle = degToRad(defaults(params.maxHbondAccAngle, ContactDefaultParams.maxHbondAccAngle));
    const maxHbondDonAngle = degToRad(defaults(params.maxHbondDonAngle, ContactDefaultParams.maxHbondDonAngle));
    const maxHbondAccPlaneAngle = degToRad(defaults(params.maxHbondAccPlaneAngle, ContactDefaultParams.maxHbondAccPlaneAngle));
    const maxHbondDonPlaneAngle = degToRad(defaults(params.maxHbondDonPlaneAngle, ContactDefaultParams.maxHbondDonPlaneAngle));
    const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
    const maxDist = Math.max(maxHbondDist, maxHbondSulfurDist);
    const maxHbondDistSq = maxHbondDist * maxHbondDist;
    const { features, spatialHash, contactStore, featureSet } = contacts;
    const { types, centers, atomSets } = features;
    const { x, y, z } = centers;
    const n = types.length;
    const { idealGeometry } = valenceModel(structure.data);
    const donor = structure.getAtomProxy();
    const acceptor = structure.getAtomProxy();
    for (let i = 0; i < n; ++i) {
        spatialHash.eachWithin(x[i], y[i], z[i], maxDist, (j, dSq) => {
            if (j <= i)
                return;
            const ti = types[i];
            const tj = types[j];
            const isWeak = isWeakHydrogenBond(ti, tj);
            if (!isWeak && !isHydrogenBond(ti, tj))
                return;
            const [l, k] = tj === 5 /* HydrogenAcceptor */ ? [i, j] : [j, i];
            donor.index = atomSets[l][0];
            acceptor.index = atomSets[k][0];
            if (acceptor.index === donor.index)
                return; // DA to self
            if (invalidAtomContact(donor, acceptor, masterIdx))
                return;
            if (donor.number !== 16 /* S */ && acceptor.number !== 16 /* S */ && dSq > maxHbondDistSq)
                return;
            if (donor.connectedTo(acceptor))
                return;
            const donorAngles = calcAngles(donor, acceptor);
            const idealDonorAngle = Angles.get(idealGeometry[donor.index]) || degToRad(120);
            if (donorAngles.some(donorAngle => {
                return Math.abs(idealDonorAngle - donorAngle) > maxHbondDonAngle;
            }))
                return;
            if (idealGeometry[donor.index] === 3 /* Trigonal */) {
                const outOfPlane = calcPlaneAngle(donor, acceptor);
                if (outOfPlane !== undefined && outOfPlane > maxHbondDonPlaneAngle)
                    return;
            }
            const acceptorAngles = calcAngles(acceptor, donor);
            const idealAcceptorAngle = Angles.get(idealGeometry[acceptor.index]) || degToRad(120);
            if (acceptorAngles.some(acceptorAngle => {
                // Do not limit large acceptor angles
                return idealAcceptorAngle - acceptorAngle > maxHbondAccAngle;
            }))
                return;
            if (idealGeometry[acceptor.index] === 3 /* Trigonal */) {
                const outOfPlane = calcPlaneAngle(acceptor, donor);
                if (outOfPlane !== undefined && outOfPlane > maxHbondAccPlaneAngle)
                    return;
            }
            featureSet.setBits(l, k);
            const bondType = isWeak ? 8 /* WeakHydrogenBond */ : getHydrogenBondType(donor, acceptor);
            contactStore.addContact(l, k, bondType);
        });
    }
}
