/**
 * @file Selection Constants
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export var kwd;
(function (kwd) {
    kwd[kwd["PROTEIN"] = 1] = "PROTEIN";
    kwd[kwd["NUCLEIC"] = 2] = "NUCLEIC";
    kwd[kwd["RNA"] = 3] = "RNA";
    kwd[kwd["DNA"] = 4] = "DNA";
    kwd[kwd["POLYMER"] = 5] = "POLYMER";
    kwd[kwd["WATER"] = 6] = "WATER";
    kwd[kwd["HELIX"] = 7] = "HELIX";
    kwd[kwd["SHEET"] = 8] = "SHEET";
    kwd[kwd["TURN"] = 9] = "TURN";
    kwd[kwd["BACKBONE"] = 10] = "BACKBONE";
    kwd[kwd["SIDECHAIN"] = 11] = "SIDECHAIN";
    kwd[kwd["ALL"] = 12] = "ALL";
    kwd[kwd["HETERO"] = 13] = "HETERO";
    kwd[kwd["ION"] = 14] = "ION";
    kwd[kwd["SACCHARIDE"] = 15] = "SACCHARIDE";
    kwd[kwd["SUGAR"] = 15] = "SUGAR";
    kwd[kwd["BONDED"] = 16] = "BONDED";
    kwd[kwd["RING"] = 17] = "RING";
    kwd[kwd["AROMATICRING"] = 18] = "AROMATICRING";
    kwd[kwd["METAL"] = 19] = "METAL";
    kwd[kwd["NONE"] = 20] = "NONE";
})(kwd || (kwd = {}));
export const SelectAllKeyword = ['*', '', 'ALL'];
export const SelectNoneKeyword = ['NONE'];
export const AtomOnlyKeywords = [
    kwd.BACKBONE, kwd.SIDECHAIN, kwd.BONDED, kwd.RING, kwd.AROMATICRING, kwd.METAL
];
export const ChainKeywords = [
    kwd.POLYMER, kwd.WATER
];
export const SmallResname = ['ALA', 'GLY', 'SER'];
export const NucleophilicResname = ['CYS', 'SER', 'THR'];
export const HydrophobicResname = ['ALA', 'ILE', 'LEU', 'MET', 'PHE', 'PRO', 'TRP', 'VAL'];
export const AromaticResname = ['PHE', 'TRP', 'TYR', 'HIS'];
export const AmideResname = ['ASN', 'GLN'];
export const AcidicResname = ['ASP', 'GLU'];
export const BasicResname = ['ARG', 'HIS', 'LYS'];
export const ChargedResname = ['ARG', 'ASP', 'GLU', 'HIS', 'LYS'];
export const PolarResname = ['ASN', 'ARG', 'ASP', 'CYS', 'GLY', 'GLN', 'GLU', 'HIS', 'LYS', 'SER', 'THR', 'TYR'];
export const NonpolarResname = ['ALA', 'ILE', 'LEU', 'MET', 'PHE', 'PRO', 'TRP', 'VAL'];
export const CyclicResname = ['HIS', 'PHE', 'PRO', 'TRP', 'TYR'];
export const AliphaticResname = ['ALA', 'GLY', 'ILE', 'LEU', 'VAL'];
