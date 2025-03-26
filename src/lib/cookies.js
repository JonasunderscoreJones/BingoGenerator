/**
 * Functions to add the gameLock cookie
 * @module cookies
 */
export function addGameLockCookie() {
    document.cookie = `gameLock=;path=/;max-age=31536000`; // Cookie lasts for 1 year
}

/**
 * Function to check if the gameLock cookie is present
 * @returns {boolean} True if the gameLock cookie is present, false otherwise
 */
export function isGameLockCookiePresent() {
    return document.cookie.split('; ').some(cookie => cookie.startsWith('gameLock='));
}

/**
 * Function to delete the gameLock cookie
 */
export function deleteGameLockCookie() {
    document.cookie = `gameLock=;path=/;max-age=0`;
}


/**
 * @param {String} entries
 * @param {String} cookieName
 */
export function saveEntriesAsCookie(entries, cookieName = 'bingoEntries') {
    document.cookie = `${cookieName}=${encodeURIComponent(entries)};path=/;max-age=31536000`; // Cookie lasts for 1 year
}

/**
 * Function to retrieve the entries from
 * the cookie
 * @param {String} cookieName
 * @returns {String} The entries from the cookie
 */
export function getEntriesFromCookie(cookieName = 'bingoEntries') {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === cookieName) {
        return decodeURIComponent(value);
    }
    }
    return ""; // if the cookie is not found
}

/**
 * Function to delete the entries cookie
 * @param {String} cookieName
 */
export function deleteSavedEntriesCookie(cookieName = 'bingoEntries') {
    document.cookie = `${cookieName}=;path=/;max-age=0`;
}

/**
 * @param {Array<JSON>} grid
 */
export function saveGridAsCookie(grid, cookieName = 'bingoGrid') {
    const jsonString = JSON.stringify(grid);
    document.cookie = `${cookieName}=${encodeURIComponent(jsonString)};path=/;max-age=31536000`; // Cookie lasts for 1 year
}

/**
 * Function to retrieve the grid from the cookie
 * @param {String} cookieName
 * @returns {Array<JSON>} the grid from the cookie
 */
export function getGridFromCookie(cookieName = 'bingoGrid') {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === cookieName) {
            try {
                console.log(JSON.parse(decodeURIComponent(value)))
                return JSON.parse(decodeURIComponent(value));
            } catch (error) {
                console.error('Error parsing grid from cookie:', error);
            }
        }
    }
    return []; //if the cookie is not found
}

/**
 * Function to delete the grid cookie
 * @param {String} cookieName
 */
export function deleteSavedGridCookie(cookieName = 'bingoGrid') {
    document.cookie = `${cookieName}=;path=/;max-age=0`;
    deleteGameLockCookie();
}

/**
 * Delete all cookies and reload page
 */
export function deleteAllCookies() {
    deleteSavedEntriesCookie();
    deleteSavedGridCookie();
    deleteGameLockCookie();
    window.location.reload();
}