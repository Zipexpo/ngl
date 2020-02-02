/**
 * @file Pass Through Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { DatasourceRegistry } from '../globals';
import { getFileInfo } from '../loader/loader-utils';
import Datasource from './datasource';
class PassThroughDatasource extends Datasource {
    getUrl(path) {
        return path;
    }
    getExt(path) {
        return getFileInfo(path).ext;
    }
}
DatasourceRegistry.add('ftp', new PassThroughDatasource());
DatasourceRegistry.add('http', new PassThroughDatasource());
DatasourceRegistry.add('https', new PassThroughDatasource());
export default PassThroughDatasource;
