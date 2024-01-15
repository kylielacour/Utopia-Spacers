// gets string name of root spacer size from negArray[napple]
export function negSizeLookup(napple: number) {
    if (napple !== 0) {
        let strapon = napple + 1;
        let bapple = strapon.toString();
        return bapple += 'xs';
    }
    else {
        return 'xs';
    }
}

// gets string name of root spacer size from posArray[napple]
export function posSizeLookup(napple: number) {
    if (napple === 0) {
        return 'm';
    }
    else if (napple === 1) {
        return 'l';
    }
    else if (napple === 2) {
        return 'xl';
    }
    else {
        let strapon = napple - 1;
        let bapple = strapon.toString();
        return bapple += 'xl';
    }
}