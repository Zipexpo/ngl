/**
 * @file Resname Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
// protein colors from Jmol http://jmol.sourceforge.net/jscolors/
const ResidueColors = {
    'ALA': 0x8CFF8C,
    'ARG': 0x00007C,
    'ASN': 0xFF7C70,
    'ASP': 0xA00042,
    'CYS': 0xFFFF70,
    'GLN': 0xFF4C4C,
    'GLU': 0x660000,
    'GLY': 0xFFFFFF,
    'HIS': 0x7070FF,
    'ILE': 0x004C00,
    'LEU': 0x455E45,
    'LYS': 0x4747B8,
    'MET': 0xB8A042,
    'PHE': 0x534C52,
    'PRO': 0x525252,
    'SER': 0xFF7042,
    'THR': 0xB84C00,
    'TRP': 0x4F4600,
    'TYR': 0x8C704C,
    'VAL': 0xFF8CFF,
    'ASX': 0xFF00FF,
    'GLX': 0xFF00FF,
    'ASH': 0xFF00FF,
    'GLH': 0xFF00FF,
    'A': 0xDC143C,
    'G': 0x32CD32,
    'I': 0x9ACD32,
    'X': 0x7CFC00,
    'C': 0xFFD700,
    'T': 0x4169E1,
    'U': 0x40E0D0,
    'D': 0x008B8B,
    'DA': 0xDC143C,
    'DG': 0x32CD32,
    'DI': 0x9ACD32,
    'DX': 0x7CFC00,
    'DC': 0xFFD700,
    'DT': 0x4169E1,
    'DU': 0x40E0D0,
    'DD': 0x008B8B
};
const DefaultResidueColor = 0xFF00FF;
/**
 * Color by residue name
 */
class ResnameColormaker extends Colormaker {
    atomColor(a) {
        return ResidueColors[a.resname] || DefaultResidueColor;
    }
}
ColormakerRegistry.add('resname', ResnameColormaker);
export default ResnameColormaker;
