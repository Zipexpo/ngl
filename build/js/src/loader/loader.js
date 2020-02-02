/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ParserRegistry } from '../globals';
import { createParams } from '../utils';
import FileStreamer from '../streamer/file-streamer';
import NetworkStreamer from '../streamer/network-streamer';
/**
 * Loader parameter object.
 * @typedef {Object} LoaderParameters - loader parameters
 * @property {String} ext - file extension, determines file type
 * @property {Boolean} compressed - flag data as compressed
 * @property {Boolean} binary - flag data as binary
 * @property {String} name - set data name
 */
/**
 * Loader base class
 */
class Loader {
    /**
     * Construct a loader object
     * @param  {String|File|Blob} src - data source, string is interpreted as an URL
     * @param  {LoaderParameters} params - parameters object
     */
    constructor(src, params = {}) {
        this.parameters = createParams(params, {
            ext: '',
            compressed: false,
            binary: ParserRegistry.isBinary(params.ext || ''),
            name: '',
            dir: '',
            path: '',
            protocol: ''
        });
        const streamerParams = {
            compressed: this.parameters.compressed,
            binary: this.parameters.binary,
            json: ParserRegistry.isJson(this.parameters.ext),
            xml: ParserRegistry.isXml(this.parameters.ext)
        };
        if ((typeof File !== 'undefined' && src instanceof File) ||
            (typeof Blob !== 'undefined' && src instanceof Blob)) {
            this.streamer = new FileStreamer(src, streamerParams);
        }
        else {
            this.streamer = new NetworkStreamer(src, streamerParams);
        }
    }
}
export default Loader;
