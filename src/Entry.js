class Entry {
    static ERR_STATIC_CLASS() { return `Entry is a static class and cannot be instantiated.`; }
    static ERR_NOT_OBJECT(entry) { return `Invalid entry: ${entry}. Expected an object, got ${typeof entry}.`; }
    static ERR_MISSING_KEYS(key) { return `Missing required key: '${key}' in entry.`; }
    static ERR_INVALID_KEY_VALUE(key, value) { return `Invalid value for key '${key}': ${value}.`; }
    static ERR_ID_NOT_INTEGER(id) { return `Invalid ID: ${id}. Expected an integer.`; }
    static ERR_ID_IS_NEGATIVE(id) { return `Invalid ID: ${id}. Expected a non-negative value.`; }
    static ERR_SCORE_NOT_INTEGER(score) { return `Invalid score: ${score}. Expected an integer.`; }
    static ERR_SCORE_NOT_DIVISIBLE_BY_FIVE(score) { return `Invalid score: ${score}. Expected a multiple of 5.`; }
    static ERR_SCORE_IS_NEGATIVE(score) { return `Invalid score: ${score}. Expected a non-negative value.`; }
    static ERR_DATE_VALUE_INVALID(date) { return `Invalid date value: ${date}.`; }
    static ERR_DATE_FORMAT_INVALID(date) { return `Invalid date format: '${date}'. Expected a valid date string.`; }

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
     * @returns true
     */
    static validateEntry(entry) {
        if (Array.isArray(entry) || !(entry instanceof Object)) {
            throw new Error(Entry.ERR_NOT_OBJECT(entry));
        }
        const requiredKeys = ["id", "score", "date"];
        for (const key of requiredKeys) {
            if (!entry.hasOwnProperty(key)) {
                throw new Error(Entry.ERR_MISSING_KEYS(key));
            }
            if (entry[key] === null || entry[key] === undefined) {
                throw new Error(Entry.ERR_INVALID_KEY_VALUE(key, entry[key]));
            }
        }
        Entry.#validateId(entry.id);
        Entry.#validateScore(entry.score);
        Entry.#validateDate(entry.date);
        return true;
    }
    /**
     * Determines if a id is a valid id
     * @param {number} id 
     * @returns true
     */
    static #validateId(id) {
        if (!Number.isInteger(id)) {
            throw new Error(Entry.ERR_ID_NOT_INTEGER(id));
        }
        if (id < 0) {
            throw new Error(Entry.ERR_ID_IS_NEGATIVE(id));
        }
        return true;
    };
    /**
     * Determines if a score is a valid score
     * @param {number} score 
     * @returns true
     */
    static #validateScore(score) {
        if (!Number.isInteger(score)) {
            throw new Error(Entry.ERR_SCORE_NOT_INTEGER(score));
        }
        if (score % 5 !== 0) {
            throw new Error(Entry.ERR_SCORE_NOT_DIVISIBLE_BY_FIVE(score));
        }
        if (score < 0) {
            throw new Error(Entry.ERR_SCORE_IS_NEGATIVE(score));
        }
        return true;
    };
    /**
     * Determines if a date string is a valid date
     * Must follow yyyy-mm-dd format
     * or ISO format
     * @param {string} dateStr 
     * @returns true
     */
    static #validateDate(dateStr) {
        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) {
            throw new Error(Entry.ERR_DATE_VALUE_INVALID(dateStr));
        }
        // matches yyyy-mm-dd or ISO format
        const regex = /^\d{4}-\d{2}-\d{2}(T.*Z)?$/;
        if (!regex.test(dateStr)) {
            throw new Error(Entry.ERR_DATE_FORMAT_INVALID(dateStr));
        }
        return true;
    };
    /**
     * Checks if category is array, and if all its elements are an entry.
     * @param {array} category 
     * @returns boolean
     */
    static isCategory(category) {
        return Array.isArray(category) && category.every((entry) => { return Entry.validateEntry(entry) });
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
