let applicationStarted = false;
let inventoryOverloadChecker = () => false;
let restoringData = false;

export function setRestoringData(value) {
    restoringData = Boolean(value);
}

export function isRestoringData() {
    return restoringData;
}

export function startApplicationOnce() {
    if (applicationStarted) return false;

    applicationStarted = true;
    return true;
}

export function registerInventoryOverloadChecker(checker) {
    inventoryOverloadChecker = typeof checker === 'function' ? checker : () => false;
}

export function isCharacterOverloaded() {
    return inventoryOverloadChecker();
}
