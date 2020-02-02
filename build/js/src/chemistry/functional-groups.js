/**
 * @file Functional Groups
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/**
 * Nitrogen in a quaternary amine
 */
export function isQuaternaryAmine(a) {
    return (a.number === 7 &&
        a.bondCount === 4 &&
        a.bondToElementCount(1 /* H */) === 0);
}
/**
 * Nitrogen in a tertiary amine
 */
export function isTertiaryAmine(a, idealValence) {
    return (a.number === 7 &&
        a.bondCount >= 3 &&
        idealValence === 3);
}
/**
 * Nitrogen in an imide
 */
export function isImide(a) {
    let flag = false;
    if (a.number === 7 /* N */ && (a.bondCount - a.bondToElementCount(1 /* H */)) === 2) {
        let carbonylCount = 0;
        a.eachBondedAtom(ba => {
            if (isCarbonyl(ba))
                ++carbonylCount;
        });
        flag = carbonylCount === 2;
    }
    return flag;
}
/**
 * Nitrogen in an amide
 */
export function isAmide(a) {
    let flag = false;
    if (a.number === 7 /* N */ && (a.bondCount - a.bondToElementCount(1 /* H */)) === 2) {
        let carbonylCount = 0;
        a.eachBondedAtom(ba => {
            if (isCarbonyl(ba))
                ++carbonylCount;
        });
        flag = carbonylCount === 1;
    }
    return flag;
}
/**
 * Sulfur in a sulfonium group
 */
export function isSulfonium(a) {
    return (a.number === 16 &&
        a.bondCount === 3 &&
        a.bondToElementCount(1 /* H */) === 0);
}
/**
 * Sulfur in a sulfonic acid or sulfonate group
 */
export function isSulfonicAcid(a) {
    return (a.number === 16 &&
        a.bondToElementCount(8 /* O */) === 3);
}
/**
 * Sulfur in a sulfate group
 */
export function isSulfate(a) {
    return (a.number === 16 &&
        a.bondToElementCount(8 /* O */) === 4);
}
/**
 * Phosphor in a phosphate group
 */
export function isPhosphate(a) {
    return (a.number === 15 &&
        a.bondToElementCount(8 /* O */) === a.bondCount);
}
/**
 * Halogen with one bond to a carbon
 */
export function isHalocarbon(a) {
    return (a.isHalogen() &&
        a.bondCount === 1 &&
        a.bondToElementCount(6 /* C */) === 1);
}
/**
 * Carbon in a carbonyl/acyl group
 */
export function isCarbonyl(a) {
    let flag = false;
    if (a.number === 6 /* C */) {
        a.eachBond(b => {
            if (b.bondOrder === 2 && b.getOtherAtom(a).number === 8 /* O */) {
                flag = true;
            }
        });
    }
    return flag;
}
/**
 * Carbon in a carboxylate group
 */
export function isCarboxylate(a) {
    let terminalOxygenCount = 0;
    if (a.number === 6 &&
        a.bondToElementCount(8 /* O */) === 2 &&
        a.bondToElementCount(6 /* C */) === 1) {
        a.eachBondedAtom(ba => {
            if (ba.number === 8 && ba.bondCount - ba.bondToElementCount(1 /* H */) === 1) {
                ++terminalOxygenCount;
            }
        });
    }
    return terminalOxygenCount === 2;
}
/**
 * Carbon in a guanidine group
 */
export function isGuanidine(a) {
    let terminalNitrogenCount = 0;
    if (a.number === 6 &&
        a.bondCount === 3 &&
        a.bondToElementCount(7 /* N */) === 3) {
        a.eachBondedAtom(ba => {
            if (ba.bondCount - ba.bondToElementCount(1 /* H */) === 1) {
                ++terminalNitrogenCount;
            }
        });
    }
    return terminalNitrogenCount === 2;
}
/**
 * Carbon in a acetamidine group
 */
export function isAcetamidine(a) {
    let terminalNitrogenCount = 0;
    if (a.number === 6 &&
        a.bondCount === 3 &&
        a.bondToElementCount(7 /* N */) === 2 &&
        a.bondToElementCount(6 /* C */) === 1) {
        a.eachBondedAtom(ba => {
            if (ba.bondCount - ba.bondToElementCount(1 /* H */) === 1) {
                ++terminalNitrogenCount;
            }
        });
    }
    return terminalNitrogenCount === 2;
}
const PolarElements = [
    7 /* N */, 8 /* O */, 16 /* S */,
    9 /* F */, 17 /* CL */, 35 /* BR */, 53 /* I */
];
export function isPolar(a) {
    return PolarElements.includes(a.number);
}
export function hasPolarNeighbour(a) {
    let flag = false;
    a.eachBondedAtom(ba => {
        if (isPolar(ba))
            flag = true;
    });
    return flag;
}
export function hasAromaticNeighbour(a) {
    let flag = false;
    a.eachBondedAtom(function (bap) {
        if (bap.aromatic)
            flag = true;
    });
    return flag;
}
