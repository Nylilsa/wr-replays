class Entry {
    constructor() {
        throw new Error("Entry is a static class and cannot be instantiated.");
    }
    // has date, score, id
    isEntry() {
        return true;
    }
    isCategory() {
        return true;
    }
    sortArrayDate(arr) {
        arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    sortArrayScore(arr) {
        arr.sort((a, b) => a.score - b.score);
    }
    mergeArrays(...arrays) {
        // Validate that all arguments are arrays
        if (!arrays.every(Array.isArray)) {
            throw new Error("All parameters must be arrays");
        }
        return arrays.flat();
    }
    intersectionArray(arr1, arr2) {
        return arr1.filter(tempArr1 => arr2.some(tempArr2 => tempArr1.score === tempArr2.score));
    }
    differenceArray(arr1, arr2) {
        return arr1.filter(tempArr1 => !arr2.some(tempArr2 => tempArr1.score === tempArr2.score));
    }
    sortByScore(arrReplays, arrJson, removedElements) {
        const matchingEntries = intersectionArray(arrReplays, arrJson); // array of replays that are already a WR and have a valid replay and their date is good but name isnt
        const intersectionJsonNames = intersectionArray(arrJson, arrReplays); // array of replays that are already a WR and have a valid replay and their name is good
        const newEntries = differenceArray(arrReplays, matchingEntries); // basically does the following: arrReplays = intersection
        const unverifiedEntries = differenceArray(arrJson, mergeArray(matchingEntries, removedElements));
        for (let i = 0; i < matchingEntries.length; i++) {
            matchingEntries[i][1] = intersectionJsonNames[i][1]; // changes replay name to already existing name in arrJson
        }
        return [newEntries, unverifiedEntries, matchingEntries]
    }
    reduceByScore(arr) {
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
