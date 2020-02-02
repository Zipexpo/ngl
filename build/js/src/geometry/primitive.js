/**
 * @file Primitive
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Color } from 'three';
import { BufferRegistry, PickerRegistry } from '../globals';
import { getFixedLengthDashData } from './dash';
function addElement(elm, array) {
    if (elm.toArray !== undefined) {
        elm = elm.toArray();
    }
    else if (elm.x !== undefined) {
        elm = [elm.x, elm.y, elm.z];
    }
    else if (elm.r !== undefined) {
        elm = [elm.r, elm.g, elm.b];
    }
    array.push.apply(array, elm);
}
const tmpVec = new Vector3();
/**
 * Base class for geometry primitives
 * @interface
 */
export class Primitive {
    static get Picker() { return PickerRegistry.get(this.type); }
    static get Buffer() { return BufferRegistry.get(this.type); }
    static getShapeKey(name) {
        return this.type + name[0].toUpperCase() + name.substr(1);
    }
    static expandBoundingBox(box, data) { }
    static valueToShape(shape, name, value) {
        const data = shape._primitiveData[this.getShapeKey(name)];
        const type = this.fields[name];
        switch (type) {
            case 'v3':
            case 'c':
                addElement(value, data);
                break;
            default:
                data.push(value);
        }
    }
    static objectToShape(shape, data) {
        Object.keys(this.fields).forEach(name => {
            this.valueToShape(shape, name, data[name]);
        });
        this.valueToShape(shape, 'name', data.name);
        this.expandBoundingBox(shape.boundingBox, data);
    }
    static valueFromShape(shape, pid, name) {
        const data = shape._primitiveData[this.getShapeKey(name)];
        const type = this.fields[name];
        switch (type) {
            case 'v3':
                return new Vector3().fromArray(data, 3 * pid);
            case 'c':
                return new Color().fromArray(data, 3 * pid);
            default:
                return data[pid];
        }
    }
    static objectFromShape(shape, pid) {
        let name = this.valueFromShape(shape, pid, 'name');
        if (name === undefined) {
            name = `${this.type}: ${pid} (${shape.name})`;
        }
        const o = { shape, name };
        Object.keys(this.fields).forEach(name => {
            o[name] = this.valueFromShape(shape, pid, name);
        });
        return o;
    }
    static arrayFromShape(shape, name) {
        const data = shape._primitiveData[this.getShapeKey(name)];
        const type = this.fields[name];
        switch (type) {
            case 's':
                return data;
            default:
                return new Float32Array(data);
        }
    }
    static dataFromShape(shape) {
        const data = {};
        if (this.Picker) {
            data.picking = new this.Picker(shape);
        }
        Object.keys(this.fields).forEach(name => {
            data[name] = this.arrayFromShape(shape, name);
        });
        return data;
    }
    static bufferFromShape(shape, params) {
        return new this.Buffer(this.dataFromShape(shape), params);
    }
}
Primitive.type = '';
Primitive.fields = {};
/**
 * Sphere geometry primitive
 */
export class SpherePrimitive extends Primitive {
    static positionFromShape(shape, pid) {
        return this.valueFromShape(shape, pid, 'position');
    }
    static expandBoundingBox(box, data) {
        box.expandByPoint(tmpVec.fromArray(data.position));
    }
}
SpherePrimitive.type = 'sphere';
SpherePrimitive.fields = {
    position: 'v3',
    color: 'c',
    radius: 'f'
};
/**
 * Box geometry primitive
 */
export class BoxPrimitive extends Primitive {
    static positionFromShape(shape, pid) {
        return this.valueFromShape(shape, pid, 'position');
    }
    static expandBoundingBox(box, data) {
        box.expandByPoint(tmpVec.fromArray(data.position));
    }
}
BoxPrimitive.type = 'box';
BoxPrimitive.fields = {
    position: 'v3',
    color: 'c',
    size: 'f',
    heightAxis: 'v3',
    depthAxis: 'v3'
};
/**
 * Octahedron geometry primitive
 */
export class OctahedronPrimitive extends BoxPrimitive {
}
OctahedronPrimitive.type = 'octahedron';
/**
 * Tetrahedron geometry primitive
 */
export class TetrahedronPrimitive extends BoxPrimitive {
}
TetrahedronPrimitive.type = 'tetrahedron';
/**
 * Cylinder geometry primitive
 */
export class CylinderPrimitive extends Primitive {
    static positionFromShape(shape, pid) {
        const p1 = this.valueFromShape(shape, pid, 'position1');
        const p2 = this.valueFromShape(shape, pid, 'position2');
        return p1.add(p2).multiplyScalar(0.5);
    }
    static expandBoundingBox(box, data) {
        box.expandByPoint(tmpVec.fromArray(data.position1));
        box.expandByPoint(tmpVec.fromArray(data.position2));
    }
    static bufferFromShape(shape, params = {}) {
        let data = this.dataFromShape(shape);
        if (this.type === 'cylinder' && params.dashedCylinder) {
            data = getFixedLengthDashData(data);
        }
        return new this.Buffer(data, params);
    }
}
CylinderPrimitive.type = 'cylinder';
CylinderPrimitive.fields = {
    position1: 'v3',
    position2: 'v3',
    color: 'c',
    radius: 'f'
};
/**
 * Arrow geometry primitive
 */
export class ArrowPrimitive extends CylinderPrimitive {
}
ArrowPrimitive.type = 'arrow';
/**
 * Cone geometry primitive
 */
export class ConePrimitive extends CylinderPrimitive {
}
ConePrimitive.type = 'cone';
/**
 * Ellipsoid geometry primitive
 */
export class EllipsoidPrimitive extends SpherePrimitive {
}
EllipsoidPrimitive.type = 'ellipsoid';
EllipsoidPrimitive.fields = {
    position: 'v3',
    color: 'c',
    radius: 'f',
    majorAxis: 'v3',
    minorAxis: 'v3'
};
/**
 * Torus geometry primitive
 */
export class TorusPrimitive extends EllipsoidPrimitive {
}
TorusPrimitive.type = 'torus';
/**
 * Text geometry primitive
 */
export class TextPrimitive extends Primitive {
    static positionFromShape(shape, pid) {
        return this.valueFromShape(shape, pid, 'position');
    }
    static expandBoundingBox(box, data) {
        box.expandByPoint(tmpVec.fromArray(data.position));
    }
}
TextPrimitive.type = 'text';
TextPrimitive.fields = {
    position: 'v3',
    color: 'c',
    size: 'f',
    text: 's'
};
/**
 * Point primitive
 */
export class PointPrimitive extends Primitive {
    static positionFromShape(shape, pid) {
        return this.valueFromShape(shape, pid, 'position');
    }
    static expandBoundingBox(box, data) {
        box.expandByPoint(tmpVec.fromArray(data.position));
    }
}
PointPrimitive.type = 'point';
PointPrimitive.fields = {
    position: 'v3',
    color: 'c',
};
/**
 * Wideline geometry primitive
 */
export class WidelinePrimitive extends Primitive {
    static positionFromShape(shape, pid) {
        const p1 = this.valueFromShape(shape, pid, 'position1');
        const p2 = this.valueFromShape(shape, pid, 'position2');
        return p1.add(p2).multiplyScalar(0.5);
    }
    static expandBoundingBox(box, data) {
        box.expandByPoint(tmpVec.fromArray(data.position1));
        box.expandByPoint(tmpVec.fromArray(data.position2));
    }
}
WidelinePrimitive.type = 'wideline';
WidelinePrimitive.fields = {
    position1: 'v3',
    position2: 'v3',
    color: 'c'
};
