/**
 * @file Writer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { defaults, download } from '../utils';
/**
 * Base class for writers
 * @interface
 */
class Writer {
    /**
     * Get a blob with the written data
     * @return {Blob} the blob
     */
    getBlob() {
        return new Blob([this.getData()], { type: this.mimeType });
    }
    /**
     * Trigger a download of the
     * @param  {[type]} name [description]
     * @param  {[type]} ext  [description]
     * @return {[type]}      [description]
     */
    download(name, ext) {
        name = defaults(name, this.defaultName);
        ext = defaults(ext, this.defaultExt);
        download(this.getBlob(), `${name}.${ext}`);
    }
}
export default Writer;
