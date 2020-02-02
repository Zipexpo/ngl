/**
 * @file UI Parameters
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { MouseActionPresets } from '../controls/mouse-actions';
function BooleanParam() { return { type: 'boolean' }; }
function ColorParam() { return { type: 'color' }; }
function IntegerParam(max, min) {
    return { type: 'integer', max, min };
}
function NumberParam(precision, max, min) {
    return { type: 'number', precision, max, min };
}
function RangeParam(step, max, min) {
    return { type: 'range', step, max, min };
}
function SelectParam(...options) {
    return { type: 'select', options: options.reduce((o, k) => (Object.assign(Object.assign({}, o), { [k]: k })), {}) };
}
export const UIStageParameters = {
    backgroundColor: ColorParam(),
    quality: SelectParam('auto', 'low', 'medium', 'high'),
    sampleLevel: RangeParam(1, 5, -1),
    impostor: BooleanParam(),
    workerDefault: BooleanParam(),
    rotateSpeed: NumberParam(1, 10, 0),
    zoomSpeed: NumberParam(1, 10, 0),
    panSpeed: NumberParam(1, 10, 0),
    clipNear: RangeParam(1, 100, 0),
    clipFar: RangeParam(1, 100, 0),
    clipDist: IntegerParam(200, 0),
    clipMode: SelectParam('scene', 'camera'),
    clipScale: SelectParam('relative', 'absolute'),
    fogNear: RangeParam(1, 100, 0),
    fogFar: RangeParam(1, 100, 0),
    fogMode: SelectParam('scene', 'camera'),
    fogScale: SelectParam('relative', 'absolute'),
    cameraType: SelectParam('perspective', 'orthographic', 'stereo'),
    cameraEyeSep: NumberParam(3, 1.0, 0.01),
    cameraFov: RangeParam(1, 120, 15),
    lightColor: ColorParam(),
    lightIntensity: NumberParam(2, 10, 0),
    ambientColor: ColorParam(),
    ambientIntensity: NumberParam(2, 10, 0),
    hoverTimeout: IntegerParam(10000, -1),
    tooltip: BooleanParam(),
    mousePreset: SelectParam(...Object.keys(MouseActionPresets))
};
