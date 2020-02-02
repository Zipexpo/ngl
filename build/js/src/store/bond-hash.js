/**
 * @file Bond Hash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { createAdjacencyList } from '../utils/adjacency-list';
class BondHash {
    constructor(bondStore, atomCount) {
        const al = createAdjacencyList({
            nodeArray1: bondStore.atomIndex1,
            nodeArray2: bondStore.atomIndex2,
            edgeCount: bondStore.count,
            nodeCount: atomCount
        });
        this.countArray = al.countArray;
        this.offsetArray = al.offsetArray;
        this.indexArray = al.indexArray;
    }
}
export default BondHash;
