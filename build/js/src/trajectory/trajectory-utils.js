/**
 * @file Trajectory Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Frames from './frames';
import FramesTrajectory from './frames-trajectory';
import StructureTrajectory from './structure-trajectory';
import RemoteTrajectory from './remote-trajectory';
export function makeTrajectory(trajSrc, structure, params) {
    let traj;
    if (trajSrc && trajSrc instanceof Frames) {
        traj = new FramesTrajectory(trajSrc, structure, params);
    }
    else if (!trajSrc && structure.frames) {
        traj = new StructureTrajectory(trajSrc, structure, params);
    }
    else {
        traj = new RemoteTrajectory(trajSrc, structure, params);
    }
    return traj;
}
