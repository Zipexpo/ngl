/**
 * @file Unitcell Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { RepresentationRegistry } from '../globals';
import { defaults } from '../utils';
import StructureRepresentation from './structure-representation.js';
import SphereBuffer from '../buffer/sphere-buffer.js';
import CylinderBuffer from '../buffer/cylinder-buffer.js';
/**
 * Unitcell Representation
 */
class UnitcellRepresentation extends StructureRepresentation {
    constructor(structure, viewer, params) {
        super(structure, viewer, params);
        this.type = 'unitcell';
        this.parameters = Object.assign({
            radiusSize: {
                type: 'number', precision: 3, max: 10.0, min: 0.001
            },
            sphereDetail: true,
            radialSegments: true,
            disableImpostor: true
        }, this.parameters, {
            assembly: null
        });
        this.init(params);
    }
    init(params) {
        const p = params || {};
        let defaultRadius = 0.5;
        if (this.structure.unitcell) {
            defaultRadius = Math.cbrt(this.structure.unitcell.volume) / 200;
        }
        p.radiusSize = defaults(p.radiusSize, defaultRadius);
        p.colorValue = defaults(p.colorValue, 'orange');
        p.useInteriorColor = defaults(p.useInteriorColor, true);
        super.init(p);
    }
    getUnitcellData(structure) {
        return structure.unitcell.getData(structure);
    }
    create() {
        const structure = this.structureView.getStructure();
        if (!structure.unitcell)
            return;
        const unitcellData = this.getUnitcellData(structure);
        this.sphereBuffer = new SphereBuffer(unitcellData.vertex, this.getBufferParams({
            sphereDetail: this.sphereDetail,
            disableImpostor: this.disableImpostor,
            dullInterior: true
        }));
        this.cylinderBuffer = new CylinderBuffer(unitcellData.edge, this.getBufferParams({
            openEnded: true,
            radialSegments: this.radialSegments,
            disableImpostor: this.disableImpostor,
            dullInterior: true
        }));
        this.dataList.push({
            sview: this.structureView,
            bufferList: [this.sphereBuffer, this.cylinderBuffer]
        });
    }
    createData(sview) {
        return;
    }
    updateData(what, data) {
        const structure = data.sview.getStructure();
        if (!structure.unitcell)
            return;
        const unitcellData = this.getUnitcellData(structure);
        const sphereData = {};
        const cylinderData = {};
        if (!what || what.position) {
            Object.assign(sphereData, { position: unitcellData.vertex.position });
            Object.assign(cylinderData, {
                position1: unitcellData.edge.position1,
                position2: unitcellData.edge.position2
            });
        }
        if (!what || what.color) {
            Object.assign(sphereData, { color: unitcellData.vertex.color });
            Object.assign(cylinderData, {
                color: unitcellData.edge.color,
                color2: unitcellData.edge.color2
            });
        }
        if (!what || what.radius) {
            Object.assign(sphereData, { radius: unitcellData.vertex.radius });
            Object.assign(cylinderData, { radius: unitcellData.edge.radius });
        }
        this.sphereBuffer.setAttributes(sphereData);
        this.cylinderBuffer.setAttributes(cylinderData);
    }
}
RepresentationRegistry.add('unitcell', UnitcellRepresentation);
export default UnitcellRepresentation;
