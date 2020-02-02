import SpatialHash from '../geometry/spatial-hash';
import { ValenceModel } from '../chemistry/valence-model';
export function createData(structure) {
    return {
        structure,
        '@spatialLookup': undefined,
        '@valenceModel': undefined
    };
}
export function spatialLookup(data) {
    if (data['@spatialLookup'])
        return data['@spatialLookup'];
    const lookup = new SpatialHash(data.structure.atomStore, data.structure.boundingBox);
    data['@spatialLookup'] = lookup;
    return lookup;
}
export function valenceModel(data) {
    if (data['@valenceModel'])
        return data['@valenceModel'];
    const valenceModel = ValenceModel(data, { assignCharge: 'auto', assignH: 'auto' });
    data['@valenceModel'] = valenceModel;
    return valenceModel;
}
