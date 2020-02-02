/**
 * @file Entity
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { UnknownEntity, PolymerEntity, NonPolymerEntity, MacrolideEntity, WaterEntity } from './structure-constants.js';
function entityTypeFromString(string) {
    string = string.toLowerCase();
    switch (string) {
        case 'polymer':
            return PolymerEntity;
        case 'non-polymer':
            return NonPolymerEntity;
        case 'macrolide':
            return MacrolideEntity;
        case 'water':
            return WaterEntity;
        default:
            return UnknownEntity;
    }
}
function entityFromType(type) {
    switch (type) {
        case PolymerEntity:
            return 'polymer';
        case NonPolymerEntity:
            return 'non-polymer';
        case MacrolideEntity:
            return 'macrolide';
        case WaterEntity:
            return 'water';
        default:
            return undefined;
    }
}
export const EntityTypeString = {
    'polymer': PolymerEntity,
    'non-polymer': NonPolymerEntity,
    'macrolide': MacrolideEntity,
    'water': WaterEntity,
};
/**
 * Entity of a {@link Structure}
 */
export default class Entity {
    /**
     * @param {Structure} structure - structure the entity belongs to
     * @param {Integer} index - index within structure.entityList
     * @param {String} description - entity description
     * @param {String} type - entity type
     * @param {Array} chainIndexList - entity chainIndexList
     */
    constructor(structure, index, description = '', type, chainIndexList = []) {
        this.structure = structure;
        this.index = index;
        this.description = description;
        this.entityType = entityTypeFromString(type || '');
        this.chainIndexList = chainIndexList;
        chainIndexList.forEach(function (ci) {
            structure.chainStore.entityIndex[ci] = index;
        });
    }
    get type() { return entityFromType(this.entityType); }
    getEntityType() {
        return this.entityType;
    }
    isPolymer() {
        return this.entityType === PolymerEntity;
    }
    isNonPolymer() {
        return this.entityType === NonPolymerEntity;
    }
    isMacrolide() {
        return this.entityType === MacrolideEntity;
    }
    isWater() {
        return this.entityType === WaterEntity;
    }
    eachChain(callback) {
        const cp = this.structure.getChainProxy();
        this.chainIndexList.forEach(function (index) {
            cp.index = index;
            callback(cp);
        });
    }
}
