/**
 * @file Metal Binding
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { defaults } from '../../utils';
// import { valenceModel } from '../../structure/data'
import { AA3, Bases } from '../../structure/structure-constants';
// import { hasAromaticNeighbour } from '../functional-groups'
import { addAtom, addFeature, createFeatureState, } from './features';
import { ContactDefaultParams, invalidAtomContact } from './contact';
const IonicTypeMetals = [
    3 /* LI */, 11 /* NA */, 19 /* K */, 37 /* RB */, 55 /* CS */,
    12 /* MG */, 20 /* CA */, 38 /* SR */, 56 /* BA */, 13 /* AL */,
    31 /* GA */, 49 /* IN */, 81 /* TL */, 21 /* SC */, 50 /* SN */,
    82 /* PB */, 83 /* BI */, 51 /* SB */, 80 /* HG */
];
/**
 * Metal binding partners (dative bond or ionic-type interaction)
 */
export function addMetalBinding(structure, features) {
    structure.eachAtom(a => {
        let dative = false;
        let ionic = false;
        const isStandardAminoacid = AA3.includes(a.resname);
        const isStandardBase = Bases.includes(a.resname);
        if (!isStandardAminoacid && !isStandardBase) {
            if (a.isHalogen() || a.number === 8 /* O */ || a.number === 16 /* S */) {
                dative = true;
                ionic = true;
            }
            else if (a.number === 7 /* N */) {
                dative = true;
            }
        }
        else if (isStandardAminoacid) {
            // main chain oxygen atom or oxygen, nitrogen and sulfur from specific amino acids
            if (a.number === 8 /* O */) {
                if (['ASP', 'GLU', 'SER', 'THR', 'TYR', 'ASN', 'GLN'].includes(a.resname) && a.isSidechain()) {
                    dative = true;
                    ionic = true;
                }
                else if (a.isBackbone()) {
                    dative = true;
                    ionic = true;
                }
            }
            else if (a.number === 16 /* S */ && 'CYS' === a.resname) {
                dative = true;
                ionic = true;
            }
            else if (a.number === 7 /* N */) {
                if (a.resname === 'HIS' && a.isSidechain()) {
                    dative = true;
                }
            }
        }
        else if (isStandardBase) {
            // http://pubs.acs.org/doi/pdf/10.1021/acs.accounts.6b00253
            // http://onlinelibrary.wiley.com/doi/10.1002/anie.200900399/full
            if (a.number === 8 /* O */ && a.isBackbone()) {
                dative = true;
                ionic = true;
            }
            else if (['N3', 'N4', 'N7'].includes(a.atomname)) {
                dative = true;
            }
            else if (['O2', 'O4', 'O6'].includes(a.atomname)) {
                dative = true;
                ionic = true;
            }
        }
        if (dative) {
            const state = createFeatureState(11 /* DativeBondPartner */);
            addAtom(state, a);
            addFeature(features, state);
        }
        if (ionic) {
            const state = createFeatureState(10 /* IonicTypePartner */);
            addAtom(state, a);
            addFeature(features, state);
        }
    });
}
/**
 * Metal Pi complexation partner
 */
// export function addMetalPiPartners (structure: Structure, features: Features) {
//   const { charge } = valenceModel(structure.data)
//   structure.eachAtom(a => {
//     const state = createFeatureState(FeatureType.MetalPiPartner)
//     const resname = a.resname
//     const element = a.element
//     const atomname = a.atomname
//     if (!a.isPolymer()) {
//       // water oxygen, as well as oxygen from carboxylate, phosphoryl, phenolate, alcohol;
//       // nitrogen from imidazole; sulfur from thiolate
//       if (element === 'O') {
//         // Water oxygen
//         if (a.bondCount === 0 || a.isWater()) {
//           addAtom(state, a)
//           addFeature(features, state)
//           return
//         }
//         // Oxygen in alcohol (R-[O]-H)
//         if (a.bondCount === 2 && charge[ a.index ] || a.hasBondToElement('H')) {
//           addAtom(state, a)
//           addFeature(features, state)
//           return
//         }
//         // Phenolate oxygen
//         if (hasAromaticNeighbour(a) && !a.aromatic) {
//           addAtom(state, a)
//           addFeature(features, state)
//           return
//         }
//         // Carboxylic acid oxygen
//         if (a.bondToElementCount('C') === 1) {
//           let flag = false
//           a.eachBondedAtom(ba => {
//             if (ba.element === 'C' && ba.bondToElementCount('O') === 2 && ba.bondToElementCount('C') === 1) {
//               flag = true
//             }
//           })
//           if (flag) {
//             addAtom(state, a)
//             addFeature(features, state)
//             return
//           }
//         }
//         // Phosphoryl oxygen
//         if (a.bondToElementCount('P') === 1) {
//           let flag = false
//           a.eachBondedAtom(ba => {
//             if (ba.element === 'P' && ba.bondToElementCount('O') >= 3) {
//               flag = true
//             }
//           })
//           if (flag) {
//             addAtom(state, a)
//             addFeature(features, state)
//             return
//           }
//         }
//       } else if (element === 'N') {
//         // Imidazole/pyrrole or similar
//         if (a.bondToElementCount('C') === 2) {
//           addAtom(state, a)
//           addFeature(features, state)
//           return
//         }
//       } else if (element === 'S') {
//         // Thiolate
//         if (hasAromaticNeighbour(a) && !a.aromatic) {
//           addAtom(state, a)
//           addFeature(features, state)
//           return
//         }
//         // Sulfur in Iron sulfur cluster
//         const ironCount = a.bondToElementCount('FE')
//         if (ironCount > 0 && ironCount === a.bondCount) {
//           addAtom(state, a)
//           addFeature(features, state)
//           return
//         }
//       }
//     }
//   })
// }
export function addMetals(structure, features) {
    structure.eachAtom(a => {
        if (a.isTransitionMetal() || a.number === 30 /* ZN */ || a.number === 48 /* CD */) {
            const state = createFeatureState(12 /* TransitionMetal */);
            addAtom(state, a);
            addFeature(features, state);
        }
        else if (IonicTypeMetals.includes(a.number)) {
            const state = createFeatureState(13 /* IonicTypeMetal */);
            addAtom(state, a);
            addFeature(features, state);
        }
    });
}
function isMetalComplex(ti, tj) {
    if (ti === 12 /* TransitionMetal */) {
        return (tj === 11 /* DativeBondPartner */ ||
            tj === 12 /* TransitionMetal */);
    }
    else if (ti === 13 /* IonicTypeMetal */) {
        return (tj === 10 /* IonicTypePartner */);
    }
}
/**
 * Metal complexes of metals and appropriate groups in protein and ligand, including water
 */
export function addMetalComplexation(structure, contacts, params = {}) {
    const maxMetalDist = defaults(params.maxMetalDist, ContactDefaultParams.maxMetalDist);
    const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex);
    const { features, spatialHash, contactStore, featureSet } = contacts;
    const { types, centers, atomSets } = features;
    const { x, y, z } = centers;
    const n = types.length;
    const ap1 = structure.getAtomProxy();
    const ap2 = structure.getAtomProxy();
    for (let i = 0; i < n; ++i) {
        spatialHash.eachWithin(x[i], y[i], z[i], maxMetalDist, (j, dSq) => {
            if (j <= i)
                return;
            ap1.index = atomSets[i][0];
            ap2.index = atomSets[j][0];
            if (invalidAtomContact(ap1, ap2, masterIdx))
                return;
            const m1 = ap1.isMetal();
            const m2 = ap2.isMetal();
            if (!m1 && !m2)
                return;
            const [ti, tj] = m1 ? [types[i], types[j]] : [types[j], types[i]];
            if (isMetalComplex(ti, tj)) {
                featureSet.setBits(i, j);
                contactStore.addContact(i, j, 7 /* MetalCoordination */);
            }
        });
    }
}
