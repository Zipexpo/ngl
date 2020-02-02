/**
 * @file Hydrophobic
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { defaults } from '../../utils';
import { addAtom, addFeature, createFeatureState, } from './features';
import { ContactDefaultParams, invalidAtomContact } from './contact';
/**
 * Hydrophobic carbon (only bonded to carbon or hydrogen); fluorine
 */
export function addHydrophobic(structure, features) {
    structure.eachAtom(a => {
        const state = createFeatureState(8 /* Hydrophobic */);
        let flag = false;
        if (a.number === 6 /* C */) {
            flag = true;
            a.eachBondedAtom(ap => {
                const an = ap.number;
                if (an !== 6 /* C */ && an !== 1 /* H */)
                    flag = false;
            });
        }
        else if (a.number === 9 /* F */) {
            flag = true;
        }
        if (flag) {
            addAtom(state, a);
            addFeature(features, state);
        }
    });
}
function isHydrophobicContact(ti, tj) {
    return ti === 8 /* Hydrophobic */ && tj === 8 /* Hydrophobic */;
}
/**
 * All hydrophobic contacts
 */
export function addHydrophobicContacts(structure, contacts, params = {}) {
    const maxHydrophobicDist = defaults(params.maxHydrophobicDist, ContactDefaultParams.maxHydrophobicDist);
    const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
    const { features, spatialHash, contactStore, featureSet } = contacts;
    const { types, centers, atomSets } = features;
    const { x, y, z } = centers;
    const n = types.length;
    const ap1 = structure.getAtomProxy();
    const ap2 = structure.getAtomProxy();
    for (let i = 0; i < n; ++i) {
        spatialHash.eachWithin(x[i], y[i], z[i], maxHydrophobicDist, (j, dSq) => {
            if (j <= i)
                return;
            ap1.index = atomSets[i][0];
            ap2.index = atomSets[j][0];
            if (invalidAtomContact(ap1, ap2, masterIdx))
                return;
            if (ap1.number === 9 /* F */ && ap2.number === 9 /* F */)
                return;
            if (ap1.connectedTo(ap2))
                return;
            if (isHydrophobicContact(types[i], types[j])) {
                featureSet.setBits(i, j);
                contactStore.addContact(i, j, 6 /* Hydrophobic */);
            }
        });
    }
}
