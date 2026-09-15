let applicationStarted = false;
let inventoryOverloadChecker = () => false;

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
