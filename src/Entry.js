class Entry {
    static ERR_STATIC_CLASS = "Entry is a static class and cannot be instantiated.";
    static ERR_NOT_OBJECT = "Entry is not an object, but instead is of type ";
    static ERR_MISSING_KEYS = "Entry is missing key: ";
    static ERR_INVALID_KEY_VALUE = "Entry has invalid key-value pair: ";
    static ERR_ID_NOT_INTEGER = "Entry has non-integer id: ";
    static ERR_ID_IS_NEGATIVE = "Entry has negative id: ";
    static ERR_SCORE_NOT_INTEGER = "Entry has non-integer score: ";
    static ERR_SCORE_NOT_DIVISIBLE_BY_FIVE = "Entry has score that's not divisible by 5: ";
    static ERR_SCORE_IS_NEGATIVE = "Entry has negative score: ";
    static ERR_DATE_VALUE_INVALID = "Entry has invalid date value: ";
    static ERR_DATE_FORMAT_INVALID = "Entry follows invalid date formatting: ";
    constructor() {
        throw new Error(Entry.ERR_STATIC_CLASS);
    }
    static fetchJson(url) {
        let temp = fs.readFileSync(url, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading the file: ${err}`);
                return;
            }
        });
        return JSON.parse(temp);
    }
    // has date, score, id
    /**
     * Determines if entry is object, and if
     * entry has keys "id", "score", and "date", and if
     * id is non-negative integer, and if
     * score is non-negative integer divisible by 5, and if
     * date follows ISO of yyyy-mm-dd format
     * @param {object} entry 
     * @example {"id": 12, "score": 535286680, "date": "2021-03-06T10:40:30.000Z"}
     * @returns boolean
     */
    // note to self tbd wip: instead of returning a boolean,
    // i want it to return nothing,
    // but if a condition fails i want it to throw an error
    // want to do this for all functions
    // this should avoid the scoping hell {{{{{{}}}}}}
    static isValidEntry(entry) {
        const isObject = !Array.isArray(entry) && entry instanceof Object;
        const hasKeys = ["id", "score", "date"].every(key => entry.hasOwnProperty(key));
        const hasValidValue = ["id", "score", "date"].every(key => entry[key] !== null && entry[key] !== undefined);
        const isIdInteger = Number.isInteger(entry.id);
        const isIdNonNegative = entry.id >= 0;
        const isScoreInteger = Number.isInteger(entry.score);
        // Every valid Touhou 1cc's score ends with a 0, expect for HRtP, which can end with a 5.
        const isScoreDivisibleByFive = entry.score % 5 === 0;
        const isScoreNegative = entry.score >= 0;
        const isDateValid = Entry.#isDateValid(entry.date);
        return [isObject, hasKeys, hasValidValue, isIdInteger, isIdNonNegative, isScoreInteger, isScoreDivisibleByFive, isScoreNegative, isDateValid].every(bool => bool);
    }
    /**
     * Determines if a date string is a valid date
     * Must follow yyyy-mm-dd format
     * or ISO format
     * @param {string} dateStr 
     * @returns boolean
     */
    static #isDateValid(dateStr) {
        // Parse the date
        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) {
            return false; // Not a valid date
        }
        // matches yyyy-mm-dd or ISO format
        const regex = /^\d{4}-\d{2}-\d{2}(T.*Z)?$/;
        return regex.test(dateStr);
    };
    /**
     * Checks if category is array, and if all its elements are an entry.
     * @param {array} category 
     * @returns boolean
     */
    static isCategory(category) {
        return Array.isArray(category) && category.every((entry) => {return Entry.isValidEntry(entry)});
    }
    static sortCategoryDate(category) {
        category.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    static sortCategoryScore(category) {
        category.sort((a, b) => a.score - b.score);
    }
    static isCategorySortedDate(category) {
        return true
    }
    static isCategorySortedScore(category) {
        return true
    }
    static mergeArrays(...arrays) {
        // Validate that all arguments are arrays
        if (!arrays.every(Array.isArray)) {
            throw new Error("All parameters must be arrays");
        }
        return arrays.flat();
    }
    static intersectionArray(arr1, arr2) {
        return arr1.filter(tempArr1 => arr2.some(tempArr2 => tempArr1.score === tempArr2.score));
    }
    static differenceArray(arr1, arr2) {
        return arr1.filter(tempArr1 => !arr2.some(tempArr2 => tempArr1.score === tempArr2.score));
    }
    static sortByScore(arrReplays, arrJson, removedElements) {
        const matchingEntries = intersectionArray(arrReplays, arrJson); // array of replays that are already a WR and have a valid replay and their date is good but name isnt
        const intersectionJsonNames = intersectionArray(arrJson, arrReplays); // array of replays that are already a WR and have a valid replay and their name is good
        const newEntries = differenceArray(arrReplays, matchingEntries); // basically does the following: arrReplays = intersection
        const unverifiedEntries = differenceArray(arrJson, mergeArray(matchingEntries, removedElements));
        for (let i = 0; i < matchingEntries.length; i++) {
            matchingEntries[i][1] = intersectionJsonNames[i][1]; // changes replay name to already existing name in arrJson
        }
        return [newEntries, unverifiedEntries, matchingEntries]
    }
    static reduceByScore(arr) {
        let highest = 0;
        let removedElements = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].score > highest) {
                highest = arr[i].score;
            } else {
                removedElements.push(arr[i]);
                arr.splice(i, 1);
                i--;
            }
        }
        return removedElements;
    }
}

module.exports = Entry;
