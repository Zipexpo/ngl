/**
 * @file Parser Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ParserRegistry } from '../globals';
import Loader from './loader';
/**
 * Parser loader class
 * @extends Loader
 */
class ParserLoader extends Loader {
    constructor(src, params = {}) {
        super(src, params);
        this.parserParams = {
            voxelSize: params.voxelSize,
            firstModelOnly: params.firstModelOnly,
            asTrajectory: params.asTrajectory,
            cAlphaOnly: params.cAlphaOnly,
            name: this.parameters.name,
            path: this.parameters.path
        };
    }
    /**
     * Load parsed object
     * @return {Promise} resolves to the loaded & parsed {@link Structure},
     *                   {@link Volume}, {@link Surface} or data object
     */
    load() {
        var ParserClass = ParserRegistry.get(this.parameters.ext);
        var parser = new ParserClass(this.streamer, this.parserParams);
        return parser.parse();
    }
}
export default ParserLoader;
