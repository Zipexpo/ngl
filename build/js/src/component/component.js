/**
 * @file Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Quaternion, Matrix4, Euler, Box3 } from 'three';
import { Signal } from 'signals';
import { defaults, createParams } from '../utils';
import { generateUUID } from '../math/math-utils';
import Annotation from '../component/annotation';
import ComponentControls from '../controls/component-controls';
import { makeRepresentation } from '../representation/representation-utils';
import RepresentationElement from './representation-element';
const _m = new Matrix4();
const _v = new Vector3();
export const ComponentDefaultParameters = {
    name: '',
    status: '',
    visible: true
};
/**
 * Base class for components
 */
class Component {
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {ComponentParameters} params - parameter object
     */
    constructor(stage, object, params = {}) {
        this.stage = stage;
        this.object = object;
        /**
         * Events emitted by the component
         */
        this.signals = {
            representationAdded: new Signal(),
            representationRemoved: new Signal(),
            visibilityChanged: new Signal(),
            matrixChanged: new Signal(),
            statusChanged: new Signal(),
            nameChanged: new Signal(),
            disposed: new Signal()
        };
        this.reprList = [];
        this.annotationList = [];
        this.matrix = new Matrix4();
        this.position = new Vector3();
        this.quaternion = new Quaternion();
        this.scale = new Vector3(1, 1, 1);
        this.transform = new Matrix4();
        this.parameters = createParams(params, this.defaultParameters);
        this.uuid = generateUUID();
        this.viewer = stage.viewer;
        this.controls = new ComponentControls(this);
    }
    get defaultParameters() { return ComponentDefaultParameters; }
    get name() { return this.parameters.name; }
    get status() { return this.parameters.status; }
    get visible() { return this.parameters.visible; }
    /**
     * Set position transform
     *
     * @example
     * // translate by 25 angstrom along x axis
     * component.setPosition([ 25, 0, 0 ]);
     *
     * @param {Vector3|Array} p - the coordinates
     * @return {Component} this object
     */
    setPosition(p) {
        if (Array.isArray(p)) {
            this.position.fromArray(p);
        }
        else {
            this.position.copy(p);
        }
        this.updateMatrix();
        return this;
    }
    /**
     * Set rotation transform
     *
     * @example
     * // rotate by 2 degree radians on x axis
     * component.setRotation( [ 2, 0, 0 ] );
     *
     * @param {Quaternion|Euler|Array} r - the rotation
     * @return {Component} this object
     */
    setRotation(r) {
        if (Array.isArray(r)) {
            if (r.length === 3) {
                const e = new Euler().fromArray(r);
                this.quaternion.setFromEuler(e);
            }
            else {
                this.quaternion.fromArray(r);
            }
        }
        else if (r instanceof Euler) {
            this.quaternion.setFromEuler(r);
        }
        else {
            this.quaternion.copy(r);
        }
        this.updateMatrix();
        return this;
    }
    /**
     * Set scale transform
     *
     * @example
     * // scale by factor of two
     * component.setScale( 2 );
     *
     * @param {Number} s - the scale
     * @return {Component} this object
     */
    setScale(s) {
        this.scale.set(s, s, s);
        this.updateMatrix();
        return this;
    }
    /**
     * Set general transform. Is applied before and in addition
     * to the position, rotation and scale transformations
     *
     * @example
     * component.setTransform( matrix );
     *
     * @param {Matrix4} m - the matrix
     * @return {Component} this object
     */
    setTransform(m) {
        this.transform.copy(m);
        this.updateMatrix();
        return this;
    }
    updateMatrix() {
        const c = this.getCenterUntransformed(_v);
        this.matrix.makeTranslation(-c.x, -c.y, -c.z);
        _m.makeRotationFromQuaternion(this.quaternion);
        this.matrix.premultiply(_m);
        _m.makeScale(this.scale.x, this.scale.y, this.scale.z);
        this.matrix.premultiply(_m);
        const p = this.position;
        _m.makeTranslation(p.x + c.x, p.y + c.y, p.z + c.z);
        this.matrix.premultiply(_m);
        this.matrix.premultiply(this.transform);
        this.reprList.forEach(repr => {
            repr.setParameters({ matrix: this.matrix });
        });
        this.stage.viewer.updateBoundingBox();
        this.signals.matrixChanged.dispatch(this.matrix);
    }
    /**
     * Add an anotation object
     * @param {Vector3} position - the 3d position
     * @param {String|Element} content - the HTML content
     * @param {Object} [params] - parameters
     * @param {Integer} params.offsetX - 2d offset in x direction
     * @param {Integer} params.offsetY - 2d offset in y direction
     * @return {Annotation} the added annotation object
     */
    addAnnotation(position, content, params) {
        const annotation = new Annotation(this, position, content, params);
        this.annotationList.push(annotation);
        return annotation;
    }
    /**
     * Iterator over each annotation and executing the callback
     * @param  {Function} callback - function to execute
     * @return {undefined}
     */
    eachAnnotation(callback) {
        this.annotationList.slice().forEach(callback);
    }
    /**
     * Remove the give annotation from the component
     * @param {Annotation} annotation - the annotation to remove
     * @return {undefined}
     */
    removeAnnotation(annotation) {
        const idx = this.annotationList.indexOf(annotation);
        if (idx !== -1) {
            this.annotationList.splice(idx, 1);
            annotation.dispose();
        }
    }
    /**
     * Remove all annotations from the component
     * @return {undefined}
     */
    removeAllAnnotations() {
        this.eachAnnotation(annotation => annotation.dispose());
        this.annotationList.length = 0;
    }
    /**
     * Add a new representation to the component
     * @param {String} type - the name of the representation
     * @param {Object} object - the object on which the representation should be based
     * @param {RepresentationParameters} [params] - representation parameters
     * @return {RepresentationElement} the created representation wrapped into
     *                                   a representation element object
     */
    _addRepresentation(type, object, params, hidden = false) {
        const p = params || {};
        const sp = this.stage.getParameters(); // TODO
        p.matrix = this.matrix.clone();
        p.quality = p.quality || sp.quality;
        p.disableImpostor = defaults(p.disableImpostor, !sp.impostor);
        p.useWorker = defaults(p.useWorker, sp.workerDefault);
        p.visible = defaults(p.visible, true);
        const p2 = Object.assign({}, p, { visible: this.parameters.visible && p.visible });
        const repr = makeRepresentation(type, object, this.viewer, p2);
        const reprElem = new RepresentationElement(this.stage, repr, p, this);
        if (!hidden) {
            this.reprList.push(reprElem);
            this.signals.representationAdded.dispatch(reprElem);
        }
        return reprElem;
    }
    addBufferRepresentation(buffer, params) {
        return this._addRepresentation.call(this, 'buffer', buffer, params);
    }
    hasRepresentation(repr) {
        return this.reprList.indexOf(repr) !== -1;
    }
    /**
     * Iterator over each representation and executing the callback
     * @param  {Function} callback - function to execute
     * @return {undefined}
     */
    eachRepresentation(callback) {
        this.reprList.slice().forEach(callback);
    }
    /**
     * Removes a representation component
     * @param {RepresentationElement} repr - the representation element
     * @return {undefined}
     */
    removeRepresentation(repr) {
        const idx = this.reprList.indexOf(repr);
        if (idx !== -1) {
            this.reprList.splice(idx, 1);
            repr.dispose();
            this.signals.representationRemoved.dispatch(repr);
        }
    }
    updateRepresentations(what) {
        this.reprList.forEach(repr => repr.update(what));
        this.stage.viewer.requestRender();
    }
    /**
     * Removes all representation components
     * @return {undefined}
     */
    removeAllRepresentations() {
        this.eachRepresentation(repr => repr.dispose());
    }
    dispose() {
        this.removeAllAnnotations();
        this.removeAllRepresentations();
        delete this.annotationList;
        delete this.reprList;
        this.signals.disposed.dispatch();
    }
    /**
     * Set the visibility of the component, including added representations
     * @param {Boolean} value - visibility flag
     * @return {Component} this object
     */
    setVisibility(value) {
        this.parameters.visible = value;
        this.eachRepresentation((repr) => repr.updateVisibility());
        this.eachAnnotation((annotation) => annotation.updateVisibility());
        this.signals.visibilityChanged.dispatch(value);
        return this;
    }
    setStatus(value) {
        this.parameters.status = value;
        this.signals.statusChanged.dispatch(value);
        return this;
    }
    setName(value) {
        this.parameters.name = value;
        this.signals.nameChanged.dispatch(value);
        return this;
    }
    /**
     * @return {Box3} the component's bounding box
     */
    getBox(...args) {
        return this.getBoxUntransformed(...args)
            .clone().applyMatrix4(this.matrix);
    }
    /**
     * @return {Vector3} the component's center position
     */
    getCenter(...args) {
        return this.getCenterUntransformed(...args)
            .clone().applyMatrix4(this.matrix);
    }
    getZoom(...args) {
        return this.stage.getZoomForBox(this.getBox(...args));
    }
    /**
     * @abstract
     * @return {Box3} the untransformed component's bounding box
     */
    getBoxUntransformed(...args) {
        return new Box3();
    }
    getCenterUntransformed(...args) {
        return this.getBoxUntransformed().getCenter(new Vector3());
    }
    /**
     * Automatically center and zoom the component
     * @param  {Integer} [duration] - duration of the animation, defaults to 0
     * @return {undefined}
     */
    autoView(duration) {
        this.stage.animationControls.zoomMove(this.getCenter(), this.getZoom(), defaults(duration, 0));
    }
}
export default Component;
