/**
 * @file Image Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { 
// @ts-ignore: unused import Vector3, Matrix4 required for declaration only
Vector2, BufferAttribute, DataTexture, NormalBlending, NearestFilter, LinearFilter } from 'three';
import '../shader/Image.vert';
import '../shader/Image.frag';
import Buffer, { BufferDefaultParameters, BufferParameterTypes } from './buffer';
const quadIndices = new Uint16Array([
    0, 1, 2,
    1, 3, 2
]);
const quadUvs = new Float32Array([
    0, 1,
    0, 0,
    1, 1,
    1, 0
]);
export const ImageBufferDefaultParameters = Object.assign({
    filter: 'nearest',
    forceTransparent: true
}, BufferDefaultParameters);
export const ImageBufferParameterTypes = Object.assign({
    filter: { updateShader: true, uniform: true }
}, BufferParameterTypes);
/**
 * Image buffer. Draw a single image. Optionally interpolate.
 */
class ImageBuffer extends Buffer {
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position - image position
     * @param {Float32Array} data.imageData - image data, rgba channels
     * @param {Float32Array} data.width - image width
     * @param {Float32Array} data.height - image height
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     */
    constructor(data, params) {
        super({
            position: data.position,
            index: quadIndices,
            picking: data.picking
        }, params);
        this.parameterTypes = ImageBufferParameterTypes;
        this.alwaysTransparent = true;
        this.hasWireframe = false;
        this.vertexShader = 'Image.vert';
        this.fragmentShader = 'Image.frag';
        const { imageData, width, height } = data;
        const tex = new DataTexture(imageData, width, height);
        tex.flipY = true;
        this.tex = tex;
        const n = imageData.length;
        const pickingData = new Uint8Array(n);
        for (let i = 0; i < n; i += 4) {
            const j = i / 4;
            pickingData[i] = j >> 16 & 255;
            pickingData[i + 1] = j >> 8 & 255;
            pickingData[i + 2] = j & 255;
        }
        const pickingTex = new DataTexture(pickingData, width, height);
        pickingTex.flipY = true;
        pickingTex.minFilter = NearestFilter;
        pickingTex.magFilter = NearestFilter;
        this.pickingTex = pickingTex;
        this.addUniforms({
            'map': { value: tex },
            'pickingMap': { value: pickingTex },
            'mapSize': { value: new Vector2(width, height) }
        });
        this.geometry.addAttribute('uv', new BufferAttribute(quadUvs, 2));
    }
    get defaultParameters() { return ImageBufferDefaultParameters; }
    getDefines(type) {
        const defines = super.getDefines(type);
        const filter = this.parameters.filter;
        if (filter.startsWith('cubic')) {
            defines.CUBIC_INTERPOLATION = 1;
            if (filter.endsWith('bspline')) {
                defines.BSPLINE_FILTER = 1;
            }
            else if (filter.endsWith('catmulrom')) {
                defines.CATMULROM_FILTER = 1;
            }
            else if (filter.endsWith('mitchell')) {
                defines.MITCHELL_FILTER = 1;
            }
        }
        return defines;
    }
    updateTexture() {
        const tex = this.tex;
        const filter = this.parameters.filter;
        if (filter.startsWith('cubic')) {
            tex.minFilter = NearestFilter;
            tex.magFilter = NearestFilter;
        }
        else if (filter === 'linear') {
            tex.minFilter = LinearFilter;
            tex.magFilter = LinearFilter;
        }
        else { // filter === "nearest"
            tex.minFilter = NearestFilter;
            tex.magFilter = NearestFilter;
        }
        tex.needsUpdate = true;
        this.pickingTex.needsUpdate = true;
    }
    makeMaterial() {
        super.makeMaterial();
        this.updateTexture();
        const m = this.material;
        m.uniforms.map.value = this.tex;
        m.blending = NormalBlending;
        m.needsUpdate = true;
        const wm = this.wireframeMaterial;
        wm.uniforms.map.value = this.tex;
        wm.blending = NormalBlending;
        wm.needsUpdate = true;
        const pm = this.pickingMaterial;
        pm.uniforms.map.value = this.tex;
        pm.uniforms.pickingMap.value = this.pickingTex;
        pm.blending = NormalBlending;
        pm.needsUpdate = true;
    }
    setUniforms(data) {
        if (data && data.filter !== undefined) {
            this.updateTexture();
            data.map = this.tex;
        }
        super.setUniforms(data);
    }
}
export default ImageBuffer;
