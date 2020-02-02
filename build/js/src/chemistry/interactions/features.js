/**
 * @file Features
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export function createFeatures() {
    return {
        types: [],
        groups: [],
        centers: { x: [], y: [], z: [] },
        atomSets: []
    };
}
export function createFeatureState(type = 0 /* Unknown */, group = 0 /* Unknown */) {
    return { type, group, x: 0, y: 0, z: 0, atomSet: [] };
}
export function addAtom(state, atom) {
    state.x += atom.x;
    state.y += atom.y;
    state.z += atom.z;
    state.atomSet.push(atom.index);
}
export function addFeature(features, state) {
    const n = state.atomSet.length;
    if (n > 0) {
        const { types, groups, centers, atomSets } = features;
        types.push(state.type);
        groups.push(state.group);
        centers.x.push(state.x / n);
        centers.y.push(state.y / n);
        centers.z.push(state.z / n);
        atomSets.push(state.atomSet);
    }
}
