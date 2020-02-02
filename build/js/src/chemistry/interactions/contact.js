/**
 * @file Contact
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from 'three';
import { Debug, Log } from '../../globals';
import { createParams } from '../../utils';
import SpatialHash from '../../geometry/spatial-hash';
import { calculateCenterArray, calculateDirectionArray, uniformArray } from '../../math/array-utils';
import ContactStore from '../../store/contact-store';
import BitArray from '../../utils/bitarray';
import Selection from '../../selection/selection';
import { ContactPicker } from '../../utils/picker';
import { createAdjacencyList } from '../../utils/adjacency-list';
import { createFeatures } from './features';
import { addAromaticRings, addNegativeCharges, addPositiveCharges, addChargedContacts } from './charged';
import { addHydrogenAcceptors, addHydrogenDonors, addHydrogenBonds, addWeakHydrogenDonors } from './hydrogen-bonds';
import { addMetalBinding, addMetals, addMetalComplexation } from './metal-binding';
import { addHydrophobic, addHydrophobicContacts } from './hydrophobic';
import { addHalogenAcceptors, addHalogenDonors, addHalogenBonds } from './halogen-bonds';
import { refineLineOfSight, refineHydrophobicContacts, refineSaltBridges, refinePiStacking, refineMetalCoordination } from './refine-contacts';
export const ContactDefaultParams = {
    maxHydrophobicDist: 4.0,
    maxHbondDist: 3.5,
    maxHbondSulfurDist: 4.1,
    maxHbondAccAngle: 45,
    maxHbondDonAngle: 45,
    maxHbondAccPlaneAngle: 90,
    maxHbondDonPlaneAngle: 30,
    maxPiStackingDist: 5.5,
    maxPiStackingOffset: 2.0,
    maxPiStackingAngle: 30,
    maxCationPiDist: 6.0,
    maxCationPiOffset: 2.0,
    maxIonicDist: 5.0,
    maxHalogenBondDist: 4.0,
    maxHalogenBondAngle: 30,
    maxMetalDist: 3.0,
    refineSaltBridges: true,
    masterModelIndex: -1,
    lineOfSightDistFactor: 1.0
};
export function isMasterContact(ap1, ap2, masterIdx) {
    return ((ap1.modelIndex === masterIdx && ap2.modelIndex !== masterIdx) ||
        (ap2.modelIndex === masterIdx && ap1.modelIndex !== masterIdx));
}
export function invalidAtomContact(ap1, ap2, masterIdx) {
    return !isMasterContact(ap1, ap2, masterIdx) && (ap1.modelIndex !== ap2.modelIndex ||
        ap1.residueIndex === ap2.residueIndex ||
        (ap1.altloc && ap2.altloc && ap1.altloc !== ap2.altloc));
}
export function createContacts(features) {
    const { types, centers } = features;
    const spatialHash = new SpatialHash(centers);
    const contactStore = new ContactStore();
    const featureSet = new BitArray(types.length, false);
    return { features, spatialHash, contactStore, featureSet };
}
export function createFrozenContacts(contacts) {
    const { index1, index2, count } = contacts.contactStore;
    const adjacencyList = createAdjacencyList({
        nodeArray1: index1,
        nodeArray2: index2,
        edgeCount: count,
        nodeCount: contacts.featureSet.length
    });
    const contactSet = new BitArray(contacts.contactStore.count, true);
    return Object.assign({ adjacencyList, contactSet }, contacts);
}
function calculateFeatures(structure) {
    const features = createFeatures();
    if (Debug)
        Log.time('calculateFeatures');
    addPositiveCharges(structure, features);
    addNegativeCharges(structure, features);
    addAromaticRings(structure, features);
    addHydrogenAcceptors(structure, features);
    addHydrogenDonors(structure, features);
    addWeakHydrogenDonors(structure, features);
    addMetalBinding(structure, features);
    addMetals(structure, features);
    addHydrophobic(structure, features);
    addHalogenAcceptors(structure, features);
    addHalogenDonors(structure, features);
    if (Debug)
        Log.timeEnd('calculateFeatures');
    return features;
}
export function calculateContacts(structure, params = ContactDefaultParams) {
    const features = calculateFeatures(structure);
    const contacts = createContacts(features);
    if (Debug)
        Log.time('calculateContacts');
    addChargedContacts(structure, contacts, params);
    addHydrogenBonds(structure, contacts, params);
    addMetalComplexation(structure, contacts, params);
    addHydrophobicContacts(structure, contacts, params);
    addHalogenBonds(structure, contacts, params);
    const frozenContacts = createFrozenContacts(contacts);
    refineLineOfSight(structure, frozenContacts, params);
    refineHydrophobicContacts(structure, frozenContacts);
    if (params.refineSaltBridges)
        refineSaltBridges(structure, frozenContacts);
    refinePiStacking(structure, frozenContacts);
    refineMetalCoordination(structure, frozenContacts);
    if (Debug)
        Log.timeEnd('calculateContacts');
    return frozenContacts;
}
export function contactTypeName(type) {
    switch (type) {
        case 4 /* HydrogenBond */:
        case 9 /* WaterHydrogenBond */:
        case 10 /* BackboneHydrogenBond */:
            return 'hydrogen bond';
        case 6 /* Hydrophobic */:
            return 'hydrophobic contact';
        case 5 /* HalogenBond */:
            return 'halogen bond';
        case 1 /* IonicInteraction */:
            return 'ionic interaction';
        case 7 /* MetalCoordination */:
            return 'metal coordination';
        case 2 /* CationPi */:
            return 'cation-pi interaction';
        case 3 /* PiStacking */:
            return 'pi-pi stacking';
        case 8 /* WeakHydrogenBond */:
            return 'weak hydrogen bond';
        default:
            return 'unknown contact';
    }
}
export const ContactDataDefaultParams = {
    hydrogenBond: true,
    hydrophobic: true,
    halogenBond: true,
    ionicInteraction: true,
    metalCoordination: true,
    cationPi: true,
    piStacking: true,
    weakHydrogenBond: true,
    waterHydrogenBond: true,
    backboneHydrogenBond: true,
    radius: 1,
    filterSele: ''
};
export const ContactLabelDefaultParams = {
    unit: '',
    size: 2.0
};
const tmpColor = new Color();
function contactColor(type) {
    switch (type) {
        case 4 /* HydrogenBond */:
        case 9 /* WaterHydrogenBond */:
        case 10 /* BackboneHydrogenBond */:
            return tmpColor.setHex(0x2B83BA).toArray();
        case 6 /* Hydrophobic */:
            return tmpColor.setHex(0x808080).toArray();
        case 5 /* HalogenBond */:
            return tmpColor.setHex(0x40FFBF).toArray();
        case 1 /* IonicInteraction */:
            return tmpColor.setHex(0xF0C814).toArray();
        case 7 /* MetalCoordination */:
            return tmpColor.setHex(0x8C4099).toArray();
        case 2 /* CationPi */:
            return tmpColor.setHex(0xFF8000).toArray();
        case 3 /* PiStacking */:
            return tmpColor.setHex(0x8CB366).toArray();
        case 8 /* WeakHydrogenBond */:
            return tmpColor.setHex(0xC5DDEC).toArray();
        default:
            return tmpColor.setHex(0xCCCCCC).toArray();
    }
}
export function getContactData(contacts, structure, params) {
    const p = createParams(params, ContactDataDefaultParams);
    const types = [];
    if (p.hydrogenBond)
        types.push(4 /* HydrogenBond */);
    if (p.hydrophobic)
        types.push(6 /* Hydrophobic */);
    if (p.halogenBond)
        types.push(5 /* HalogenBond */);
    if (p.ionicInteraction)
        types.push(1 /* IonicInteraction */);
    if (p.metalCoordination)
        types.push(7 /* MetalCoordination */);
    if (p.cationPi)
        types.push(2 /* CationPi */);
    if (p.piStacking)
        types.push(3 /* PiStacking */);
    if (p.weakHydrogenBond)
        types.push(8 /* WeakHydrogenBond */);
    if (p.waterHydrogenBond)
        types.push(9 /* WaterHydrogenBond */);
    if (p.backboneHydrogenBond)
        types.push(10 /* BackboneHydrogenBond */);
    const { features, contactSet, contactStore } = contacts;
    const { centers, atomSets } = features;
    const { x, y, z } = centers;
    const { index1, index2, type } = contactStore;
    const position1 = [];
    const position2 = [];
    const color = [];
    const radius = [];
    const picking = [];
    let filterSet;
    if (p.filterSele) {
        if (Array.isArray(p.filterSele)) {
            filterSet = p.filterSele.map(sele => {
                return structure.getAtomSet(new Selection(sele));
            });
        }
        else {
            filterSet = structure.getAtomSet(new Selection(p.filterSele));
        }
    }
    contactSet.forEach(i => {
        const ti = type[i];
        if (!types.includes(ti))
            return;
        if (filterSet) {
            const idx1 = atomSets[index1[i]][0];
            const idx2 = atomSets[index2[i]][0];
            if (Array.isArray(filterSet)) {
                if (!(filterSet[0].isSet(idx1) && filterSet[1].isSet(idx2) || (filterSet[1].isSet(idx1) && filterSet[0].isSet(idx2))))
                    return;
            }
            else {
                if (!filterSet.isSet(idx1) && !filterSet.isSet(idx2))
                    return;
            }
        }
        const k = index1[i];
        const l = index2[i];
        position1.push(x[k], y[k], z[k]);
        position2.push(x[l], y[l], z[l]);
        color.push(...contactColor(ti));
        radius.push(p.radius);
        picking.push(i);
    });
    return {
        position1: new Float32Array(position1),
        position2: new Float32Array(position2),
        color: new Float32Array(color),
        color2: new Float32Array(color),
        radius: new Float32Array(radius),
        picking: new ContactPicker(picking, contacts, structure)
    };
}
export function getLabelData(contactData, params) {
    const position = calculateCenterArray(contactData.position1, contactData.position2);
    const text = [];
    const direction = calculateDirectionArray(contactData.position1, contactData.position2);
    const n = direction.length / 3;
    for (let i = 0; i < n; i++) {
        const j = 3 * i;
        const d = Math.sqrt(Math.pow(direction[j], 2) + Math.pow(direction[j + 1], 2) + Math.pow(direction[j + 2], 2));
        switch (params.unit) {
            case 'angstrom':
                text[i] = d.toFixed(2) + ' ' + String.fromCharCode(0x212B);
                break;
            case 'nm':
                text[i] = (d / 10).toFixed(2) + ' nm';
                break;
            default:
                text[i] = d.toFixed(2);
                break;
        }
    }
    return {
        position,
        size: uniformArray(position.length / 3, params.size),
        color: contactData.color,
        text
    };
}
