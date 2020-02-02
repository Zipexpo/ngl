/**
 * @file Label Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { RepresentationRegistry, ColormakerRegistry } from '../globals';
import { defaults } from '../utils';
import LabelFactory from '../utils/label-factory';
import RadiusFactory from '../utils/radius-factory';
import StructureRepresentation from './structure-representation';
import TextBuffer from '../buffer/text-buffer';
/**
 * Label representation
 */
class LabelRepresentation extends StructureRepresentation {
    /**
     * Create Label representation object
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {LabelRepresentationParameters} params - label representation parameters
     */
    constructor(structure, viewer, params) {
        super(structure, viewer, params);
        this.type = 'label';
        this.parameters = Object.assign({
            labelType: {
                type: 'select', options: LabelFactory.types, rebuild: true
            },
            labelText: {
                type: 'hidden', rebuild: true
            },
            labelFormat: {
                type: 'text', rebuild: true
            },
            labelGrouping: {
                type: 'select',
                options: {
                    'atom': 'atom',
                    'residue': 'residue'
                },
                rebuild: true
            },
            fontFamily: {
                type: 'select',
                options: {
                    'sans-serif': 'sans-serif',
                    'monospace': 'monospace',
                    'serif': 'serif'
                },
                buffer: true
            },
            fontStyle: {
                type: 'select',
                options: {
                    'normal': 'normal',
                    'italic': 'italic'
                },
                buffer: true
            },
            fontWeight: {
                type: 'select',
                options: {
                    'normal': 'normal',
                    'bold': 'bold'
                },
                buffer: true
            },
            xOffset: {
                type: 'number', precision: 1, max: 20, min: -20, buffer: true
            },
            yOffset: {
                type: 'number', precision: 1, max: 20, min: -20, buffer: true
            },
            zOffset: {
                type: 'number', precision: 1, max: 20, min: -20, buffer: true
            },
            attachment: {
                type: 'select',
                options: {
                    'bottom-left': 'bottom-left',
                    'bottom-center': 'bottom-center',
                    'bottom-right': 'bottom-right',
                    'middle-left': 'middle-left',
                    'middle-center': 'middle-center',
                    'middle-right': 'middle-right',
                    'top-left': 'top-left',
                    'top-center': 'top-center',
                    'top-right': 'top-right'
                },
                rebuild: true
            },
            showBorder: {
                type: 'boolean', buffer: true
            },
            borderColor: {
                type: 'color', buffer: true
            },
            borderWidth: {
                type: 'number', precision: 2, max: 0.3, min: 0, buffer: true
            },
            showBackground: {
                type: 'boolean', rebuild: true
            },
            backgroundColor: {
                type: 'color', buffer: true
            },
            backgroundMargin: {
                type: 'number', precision: 2, max: 2, min: 0, rebuild: true
            },
            backgroundOpacity: {
                type: 'range', step: 0.01, max: 1, min: 0, buffer: true
            },
            fixedSize: {
                type: 'boolean', buffer: true
            }
        }, this.parameters, {
            side: null,
            flatShaded: null,
            wireframe: null,
            linewidth: null,
            roughness: null,
            metalness: null,
            diffuse: null
        });
        this.init(params);
    }
    init(params) {
        const p = params || {};
        this.labelType = defaults(p.labelType, 'res');
        this.labelText = defaults(p.labelText, {});
        this.labelFormat = defaults(p.labelFormat, '');
        this.labelGrouping = defaults(p.labelGrouping, 'atom');
        this.fontFamily = defaults(p.fontFamily, 'sans-serif');
        this.fontStyle = defaults(p.fontStyle, 'normal');
        this.fontWeight = defaults(p.fontWeight, 'bold');
        this.xOffset = defaults(p.xOffset, 0.0);
        this.yOffset = defaults(p.yOffset, 0.0);
        this.zOffset = defaults(p.zOffset, 0.5);
        this.attachment = defaults(p.attachment, 'bottom-left');
        this.showBorder = defaults(p.showBorder, false);
        this.borderColor = defaults(p.borderColor, 'lightgrey');
        this.borderWidth = defaults(p.borderWidth, 0.15);
        this.showBackground = defaults(p.showBackground, false);
        this.backgroundColor = defaults(p.backgroundColor, 'lightgrey');
        this.backgroundMargin = defaults(p.backgroundMargin, 0.5);
        this.backgroundOpacity = defaults(p.backgroundOpacity, 1.0);
        this.fixedSize = defaults(p.fixedSize, false);
        super.init(p);
    }
    getTextData(sview, what) {
        const p = this.getAtomParams(what);
        const labelFactory = new LabelFactory(this.labelType, this.labelText, this.labelFormat);
        let position, size, color, text, positionN, sizeN, colorN;
        if (this.labelGrouping === 'atom') {
            const atomData = sview.getAtomData(p);
            position = atomData.position;
            size = atomData.radius;
            color = atomData.color;
            if (!what || what.text) {
                text = [];
                sview.eachAtom(ap => text.push(labelFactory.atomLabel(ap)));
            }
        }
        else if (this.labelGrouping === 'residue') {
            if (!what || what.position)
                positionN = [];
            if (!what || what.color)
                colorN = [];
            if (!what || what.radius)
                sizeN = [];
            if (!what || what.text)
                text = [];
            if (p.colorParams)
                p.colorParams.structure = sview.getStructure();
            const colormaker = ColormakerRegistry.getScheme(p.colorParams);
            const radiusFactory = new RadiusFactory(p.radiusParams);
            const ap1 = sview.getAtomProxy();
            let i = 0;
            sview.eachResidue(rp => {
                const i3 = i * 3;
                if (rp.isProtein() || rp.isNucleic()) {
                    ap1.index = rp.traceAtomIndex;
                    if (!what || what.position) {
                        ap1.positionToArray(positionN, i3);
                    }
                }
                else {
                    ap1.index = rp.atomOffset;
                    if (!what || what.position) {
                        rp.positionToArray(positionN, i3);
                    }
                }
                if (!what || what.color) {
                    colormaker.atomColorToArray(ap1, colorN, i3);
                }
                if (!what || what.radius) {
                    sizeN[i] = radiusFactory.atomRadius(ap1);
                }
                if (!what || what.text) {
                    text.push(labelFactory.atomLabel(ap1));
                }
                ++i;
            });
            if (!what || what.position)
                position = new Float32Array(positionN);
            if (!what || what.color)
                color = new Float32Array(colorN);
            if (!what || what.radius)
                size = new Float32Array(sizeN);
        }
        return { position: position, size: size, color: color, text: text };
    }
    createData(sview) {
        const what = { position: true, color: true, radius: true, text: true };
        const textBuffer = new TextBuffer(this.getTextData(sview, what), this.getBufferParams({
            fontFamily: this.fontFamily,
            fontStyle: this.fontStyle,
            fontWeight: this.fontWeight,
            xOffset: this.xOffset,
            yOffset: this.yOffset,
            zOffset: this.zOffset,
            attachment: this.attachment,
            showBorder: this.showBorder,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth,
            showBackground: this.showBackground,
            backgroundColor: this.backgroundColor,
            backgroundMargin: this.backgroundMargin,
            backgroundOpacity: this.backgroundOpacity,
            fixedSize: this.fixedSize
        }));
        return { bufferList: [textBuffer] };
    }
    updateData(what, data) {
        data.bufferList[0].setAttributes(this.getTextData(data.sview, what));
    }
    getAtomRadius() {
        return 0;
    }
}
RepresentationRegistry.add('label', LabelRepresentation);
export default LabelRepresentation;
