/**
 * @file Picking Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
const tmpVec = new Vector3();
function closer(x, a, b) {
    return x.distanceTo(a) < x.distanceTo(b);
}
/**
 * Picking proxy class.
 */
class PickingProxy {
    /**
     * Create picking proxy object
     * @param  {PickingData} pickingData - picking data
     * @param  {Stage} stage - stage object
     */
    constructor(pickingData, stage) {
        this.stage = stage;
        this.pid = pickingData.pid;
        this.picker = pickingData.picker;
        /**
         * @type {Object}
         */
        this.instance = pickingData.instance;
        /**
         * @type {Stage}
         */
        this.stage = stage;
        /**
         * @type {ViewerControls}
         */
        this.controls = stage.viewerControls;
        /**
         * @type {MouseObserver}
         */
        this.mouse = stage.mouseObserver;
    }
    /**
     * Kind of the picked data
     * @type {String}
     */
    get type() { return this.picker.type; }
    /**
     * If the `alt` key was pressed
     * @type {Boolean}
     */
    get altKey() { return this.mouse.altKey; }
    /**
     * If the `ctrl` key was pressed
     * @type {Boolean}
     */
    get ctrlKey() { return this.mouse.ctrlKey; }
    /**
     * If the `meta` key was pressed
     * @type {Boolean}
     */
    get metaKey() { return this.mouse.metaKey; }
    /**
     * If the `shift` key was pressed
     * @type {Boolean}
     */
    get shiftKey() { return this.mouse.shiftKey; }
    /**
     * Position of the mouse on the canvas
     * @type {Vector2}
     */
    get canvasPosition() { return this.mouse.canvasPosition; }
    /**
     * The component the picked data is part of
     * @type {Component}
     */
    get component() {
        return this.stage.getComponentsByObject(this.picker.data).list[0]; // TODO
    }
    /**
     * The picked object data
     * @type {Object}
     */
    get object() {
        return this.picker.getObject(this.pid);
    }
    /**
     * The 3d position in the scene of the picked object
     * @type {Vector3}
     */
    get position() {
        return this.picker.getPosition(this.pid, this.instance, this.component);
    }
    /**
     * The atom of a picked bond that is closest to the mouse
     * @type {AtomProxy}
     */
    get closestBondAtom() {
        if (this.type !== 'bond' || !this.bond)
            return undefined;
        const bond = this.bond;
        const controls = this.controls;
        const cp = this.canvasPosition;
        const acp1 = controls.getPositionOnCanvas(bond.atom1); // TODO
        const acp2 = controls.getPositionOnCanvas(bond.atom2); // TODO
        return closer(cp, acp1, acp2) ? bond.atom1 : bond.atom2;
    }
    /**
     * Close-by atom
     * @type {AtomProxy}
     */
    get closeAtom() {
        const cp = this.canvasPosition;
        const ca = this.closestBondAtom;
        if (!ca)
            return undefined;
        const acp = this.controls.getPositionOnCanvas(ca); // TODO
        ca.positionToVector3(tmpVec);
        if (this.instance)
            tmpVec.applyMatrix4(this.instance.matrix);
        tmpVec.applyMatrix4(this.component.matrix);
        const viewer = this.controls.viewer;
        tmpVec.add(viewer.translationGroup.position);
        tmpVec.applyMatrix4(viewer.rotationGroup.matrix);
        const scaleFactor = this.controls.getCanvasScaleFactor(tmpVec.z);
        const sc = this.component;
        const radius = sc.getMaxRepresentationRadius(ca.index);
        //console.log(scaleFactor, cp.distanceTo(acp), radius/scaleFactor, radius)
        if (cp.distanceTo(acp) <= radius / scaleFactor) {
            return ca;
        }
        else {
            return undefined;
        }
    }
    /**
     * @type {Object}
     */
    get arrow() { return this._objectIfType('arrow'); }
    /**
     * @type {AtomProxy}
     */
    get atom() { return this._objectIfType('atom'); }
    /**
     * @type {Object}
     */
    get axes() { return this._objectIfType('axes'); }
    /**
     * @type {BondProxy}
     */
    get bond() { return this._objectIfType('bond'); }
    /**
     * @type {Object}
     */
    get box() { return this._objectIfType('box'); }
    /**
     * @type {Object}
     */
    get cone() { return this._objectIfType('cone'); }
    /**
     * @type {Object}
     */
    get clash() { return this._objectIfType('clash'); }
    /**
     * @type {BondProxy}
     */
    get contact() { return this._objectIfType('contact'); }
    /**
     * @type {Object}
     */
    get cylinder() { return this._objectIfType('cylinder'); }
    /**
     * @type {BondProxy}
     */
    get distance() { return this._objectIfType('distance'); }
    /**
     * @type {Object}
     */
    get ellipsoid() { return this._objectIfType('ellipsoid'); }
    /**
     * @type {Object}
     */
    get octahedron() { return this._objectIfType('octahedron'); }
    /**
     * @type {Object}
     */
    get point() { return this._objectIfType('point'); }
    /**
     * @type {Object}
     */
    get mesh() { return this._objectIfType('mesh'); }
    /**
     * @type {Object}
     */
    get slice() { return this._objectIfType('slice'); }
    /**
     * @type {Object}
     */
    get sphere() { return this._objectIfType('sphere'); }
    /**
     * @type {Object}
     */
    get tetrahedron() { return this._objectIfType('tetrahedron'); }
    /**
     * @type {Object}
     */
    get torus() { return this._objectIfType('torus'); }
    /**
     * @type {Object}
     */
    get surface() { return this._objectIfType('surface'); }
    /**
     * @type {Object}
     */
    get unitcell() { return this._objectIfType('unitcell'); }
    /**
     * @type {Object}
     */
    get unknown() { return this._objectIfType('unknown'); }
    /**
     * @type {Object}
     */
    get volume() { return this._objectIfType('volume'); }
    /**
     * @type {Object}
     */
    get wideline() { return this._objectIfType('wideline'); }
    _objectIfType(type) {
        return this.type === type ? this.object : undefined;
    }
    getLabel() {
        const atom = this.atom || this.closeAtom;
        let msg = 'nothing';
        if (this.arrow) {
            msg = this.arrow.name;
        }
        else if (atom) {
            msg = `atom: ${atom.qualifiedName()} (${atom.structure.name})`;
        }
        else if (this.axes) {
            msg = 'axes';
        }
        else if (this.bond) {
            msg = `bond: ${this.bond.atom1.qualifiedName()} - ${this.bond.atom2.qualifiedName()} (${this.bond.structure.name})`;
        }
        else if (this.box) {
            msg = this.box.name;
        }
        else if (this.cone) {
            msg = this.cone.name;
        }
        else if (this.clash) {
            msg = `clash: ${this.clash.clash.sele1} - ${this.clash.clash.sele2}`;
        }
        else if (this.contact) {
            msg = `${this.contact.type}: ${this.contact.atom1.qualifiedName()} - ${this.contact.atom2.qualifiedName()} (${this.contact.atom1.structure.name})`;
        }
        else if (this.cylinder) {
            msg = this.cylinder.name;
        }
        else if (this.distance) {
            msg = `distance: ${this.distance.atom1.qualifiedName()} - ${this.distance.atom2.qualifiedName()} (${this.distance.structure.name})`;
        }
        else if (this.ellipsoid) {
            msg = this.ellipsoid.name;
        }
        else if (this.octahedron) {
            msg = this.octahedron.name;
        }
        else if (this.point) {
            msg = this.point.name;
        }
        else if (this.mesh) {
            msg = `mesh: ${this.mesh.name || this.mesh.serial} (${this.mesh.shape.name})`;
        }
        else if (this.slice) {
            msg = `slice: ${this.slice.value.toPrecision(3)} (${this.slice.volume.name})`;
        }
        else if (this.sphere) {
            msg = this.sphere.name;
        }
        else if (this.surface) {
            msg = `surface: ${this.surface.surface.name}`;
        }
        else if (this.tetrahedron) {
            msg = this.tetrahedron.name;
        }
        else if (this.torus) {
            msg = this.torus.name;
        }
        else if (this.unitcell) {
            msg = `unitcell: ${this.unitcell.unitcell.spacegroup} (${this.unitcell.structure.name})`;
        }
        else if (this.unknown) {
            msg = 'unknown';
        }
        else if (this.volume) {
            msg = `volume: ${this.volume.value.toPrecision(3)} (${this.volume.volume.name})`;
        }
        else if (this.wideline) {
            msg = this.wideline.name;
        }
        return msg;
    }
}
export default PickingProxy;
