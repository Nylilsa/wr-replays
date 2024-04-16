"use strict";

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const readline = require('readline-sync');

const Replay06 = require("D:/GitHub/replay-reader/Replay06.js");
const Replay10 = require("D:/GitHub/replay-reader/Replay10.js");
const Replay11 = require("D:/GitHub/replay-reader/Replay11.js");
const Replay12 = require("D:/GitHub/replay-reader/Replay12.js");
const Replay13 = require("D:/GitHub/replay-reader/Replay13.js");
const Replay14 = require("D:/GitHub/replay-reader/Replay14.js");
const Replay15 = require("D:/GitHub/replay-reader/Replay15.js");
const Replay16 = require("D:/GitHub/replay-reader/Replay16.js");
const Replay18 = require("D:/GitHub/replay-reader/Replay18.js");
const { match } = require('assert');
const path = require('path');


// const testpath = "D:/GitHub/wr-replays/replays/MAIN/th18/Easy/Reimu/th18_easy_reimu_954243810.rpy"
// const replayData2 = fs.readFileSync(testpath);
// const replay = new Replay18(replayData2);
// console.log(replay)
// console.log(replay.getStageData(7))
// console.log(replay)

const GAME = "th16";
const PATH_WRPROGRESSION_JSON = `D:/GitHub/nylilsa.github.io/json/wrprogression.json`;
const PATH_DATA_JSON = `D:/GitHub/nylilsa.github.io/json/gameinfo-new.json`;
const PATH_VERIFIED_JSON = `D:/GitHub/nylilsa.github.io/json/wr/verified/${GAME}.json`;
const PATH_UNVERIFIED_JSON = `D:/GitHub/nylilsa.github.io/json/wr/unverified/${GAME}.json`;
const PATH_NEW_REPLAYS = `D:/GitHub/wr-replays/new-replays/${GAME}`;
const PATH_WR_REPLAYS = `D:/GitHub/wr-replays/${GAME}`;
const PATH_GAME_REPLAYS = `D:/GitHub/wr-replays/replays/MAIN/${GAME}`;
const PATH_REMOVED_REPLAYS = `D:/GitHub/wr-replays/removed-replays/${GAME}`;
const WR_DATA = fetchJson(PATH_WRPROGRESSION_JSON);
const GAME_DATA = fetchJson(PATH_DATA_JSON);
const DIFFICULTY_LIST = Object.keys(GAME_DATA["DifficultyCharacters"][GAME]);

function getShottypes(difficulty) {
    return GAME_DATA["DifficultyCharacters"][GAME][difficulty];
}

init();

function fetchJson(url) {
    let temp = fs.readFileSync(url, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading the file: ${err}`);
            return;
        }
    });
    return JSON.parse(temp);
}

function init() {
    // createDirectory(PATH_WR_REPLAYS);
    // copyReplaysToPath();
    // createUnverifiedVerifiedJson();
    // moveVerifiedReplays();

    // checkReplayValidity();
    // replaysMatchJson();
    addEntries();
    // convertJson();
    // convertVerifiedJsonAccurateDate();
}

// function goes through every verified json entry of GAME, then looks if the date is written correctly in the format 2013-08-16T19:44:15.000Z and not just 2016-08-16
function convertVerifiedJsonAccurateDate() {
    let counter = 0;
    const verifiedJson = fetchJson(PATH_VERIFIED_JSON);
    for (let i = 0; i < DIFFICULTY_LIST.length; i++) {
        const difficulty = DIFFICULTY_LIST[i];
        const playerList = getShottypes(difficulty);
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            const category = verifiedJson[difficulty][player];
            for (let k = 0; k < category.length; k++) {
                const entry = category[k];
                if (entry[2].length < 15) { // so it follows the format yyyy-mm-dd and not yyyy-mm-ddThh:m:ss.000Z
                    const score = entry[0];
                    const fileName = `${GAME}_${difficulty}_${player}_${score}.rpy`.toLowerCase();
                    const pathToFile = `${PATH_WR_REPLAYS}/${difficulty}/${player}/${fileName}`;
                    const replayData = fs.readFileSync(pathToFile);
                    const rpy = mapGame(replayData);
                    const date = rpy.getDate().toISOString();
                    verifiedJson[difficulty][player][k][2] = date;
                    counter++;
                }
            }
        }
    }
    fs.writeFileSync(PATH_VERIFIED_JSON, JSON.stringify(verifiedJson));
    console.log(`Successfully changed ${counter} dates at ${PATH_VERIFIED_JSON} !`);
}



// function checks if all replays in the WR folder are valid. Prints statements if it is not
function checkReplayValidity() {
    for (let i = 0; i < DIFFICULTY_LIST.length; i++) {
        const difficulty = DIFFICULTY_LIST[i];
        const playerList = getShottypes(difficulty);
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            const path = `${PATH_WR_REPLAYS}/${difficulty}/${player}`;
            const files = fs.readdirSync(path);
            files.forEach((file) => {
                const pathToFile = `${path}/${file}`;
                const replayData = fs.readFileSync(pathToFile);
                const rpy = mapGame(replayData);
                const bool = rpy.isValid();
                if (!bool) {
                    console.log(`${pathToFile} is not valid`);
                }
            })
        }
    }
    console.log("All replay have been checked for their invalidity");
}

// function converts the existing format of [score, name, date] to { score: score, name: name, date: date } for both verified and unverified jsons
function convertJson() {
    // TODO, actually implement it
    console.log(1)
}


// this function looks at the replays in PATH_NEW_REPLAYS, then checks if those replays are valid WR replays or not.
// if not, console.log it
// if score matches entry in UNVERIFIED json, then warn user about it and ask user if they want to remove unverified entry to add verified entry and more to correct folder
// if valid, ask to update the .json file and move to correct folder.
function addEntries() {
    createDirIfNotExist(PATH_NEW_REPLAYS);
    const unverifiedData = fetchJson(PATH_UNVERIFIED_JSON);
    const verifiedData = fetchJson(PATH_VERIFIED_JSON);
    const newFiles = fs.readdirSync(PATH_NEW_REPLAYS);
    for (let j = 0; j < newFiles.length; j++) {
        const file = newFiles[j];
        let isUnverifiedEntry = false;
        const pathToFile = `${PATH_NEW_REPLAYS}/${file}`;
        const replayData = fs.readFileSync(pathToFile);
        const rpy = mapGame(replayData);
        const difficulty = rpy.getDifficulty();
        const character = rpy.getShot();
        const score = rpy.getScore();
        const date = rpy.getDate();
        const name = rpy.getName();
        const unverifiedCategory = unverifiedData[difficulty][character];
        const verifiedCategory = verifiedData[difficulty][character];
        const pathToCopyAt = `${PATH_WR_REPLAYS}/${difficulty}/${character}`;
        const rpyName = `${GAME}_${difficulty}_${character}_${score}.rpy`.toLowerCase();
        const replayAlreadyExistsInVerified = isDuplicateEntry(verifiedCategory, score);
        if (replayAlreadyExistsInVerified[0]) {
            console.log("\x1b[33m", `Replay ${file} category ${character + difficulty} is already verified with ${replayAlreadyExistsInVerified[1]}!`, "\x1b[0m");
            continue;
        }
        for (let i = 0; i < unverifiedCategory.length; i++) {
            const unverifiedEntry = unverifiedCategory[i];
            if (score == unverifiedEntry[0]) { // replay matches unverified entry
                replayMatchesUnverifiedEntry(i, pathToFile, `${pathToCopyAt}/${rpyName}`, unverifiedData, difficulty, character, file, date, unverifiedEntry);
                isUnverifiedEntry = true;
                break;
            }
        }
        if (!isUnverifiedEntry) {
            const category = verifiedData[difficulty][character];
            const tempCopy = structuredClone(category);
            const newEntry = [score, name, date.toISOString()];
            category.push(newEntry);
            sortArrayDate(category);
            reduceByScore(category);
            const bool = doesEntryExistInArray(category, newEntry);
            const removedReplays = differenceArray(tempCopy, category)
            // there is a flaw with this
            // intended logic: newEntry is merged with category then its sorted by date
            // the array gets reduced if the next score is less than the current score
            // the code is supposed to check if the newEntry is actually valid,
            // and code removes entry if entry is not valid
            // if this happens 0 times then code in if statement below is run
            // issue: supposed newEntry is valid, then statement above can still be run
            // this is because removing existing entries also increments counter
            // solution: array is reduced by score, then after reduction check if newEntry still exists
            // if it doesn't exist, it's removed so invalid
            // if it does exist it is a new entry and is valid
            // two cases:
            // 1. no replays are removed (e.g. missing entry or new WR)
            // 2. replays are removed (the replays we thought were WR were actually not WR)
            // Case 1: merge entry with array and update json and add rpy to folder
            // Case 2: merge entry with array and update json and add rpy to folder
            // and also remove n entries from json, and ask to move all non-WR replays to a separate folder 
            if (bool) {
                while (true) {
                    const check = readline.question(`${file} seems to be a new entry. Approve of entry ${newEntry}? [Y/N]\n > `);
                    if (check.toLowerCase() === "y") {
                        console.log("\x1b[32m", `Approved entry ${newEntry}`);
                        console.log("\x1b[0m");
                        fs.copyFileSync(pathToFile, `${pathToCopyAt}/${rpyName}`);
                        console.log(`Copied file at ${pathToFile} to ${pathToCopyAt}/${rpyName}`);
                        fs.unlinkSync(pathToFile);
                        console.log(`Deleted file at ${pathToFile}`);
                        fs.writeFileSync(PATH_VERIFIED_JSON, JSON.stringify(verifiedData));
                        console.log(`Updated JSON at ${PATH_VERIFIED_JSON}`);
                        if (removedReplays.length > 0) { // if exists
                            createDirIfNotExist(PATH_REMOVED_REPLAYS);
                            console.log(`The following outdated replays have been moved to the folder ${PATH_REMOVED_REPLAYS}`);
                            removedReplays.forEach((replay) => {
                                const replayName = `${GAME}_${difficulty}_${character}_${replay[0]}.rpy`.toLowerCase();
                                fs.renameSync(`${pathToCopyAt}/${replayName}`, `${PATH_REMOVED_REPLAYS}/${replayName}`);
                                console.log(`Moved ${pathToCopyAt}/${replayName} to ${PATH_REMOVED_REPLAYS}/${replayName}`);
                            })
                        }
                        break;
                    } else if (check.toLowerCase() === "n") {
                        console.log("\x1b[31m", `Denied entry ${newEntry}`);
                        fs.unlinkSync(pathToFile);
                        console.log(`Deleted file at ${pathToFile}`);
                        console.log("\x1b[0m");
                        break;
                    } else {
                        console.warn("\x1b[33m", "Invalid input! Please enter 'Y' for yes or 'N' for no.");
                    }
                }

            } else {
                console.log("\x1b[31m", `File ${file} category ${character + difficulty} with ${newEntry} is not a missing/new WR entry nor is it unverified. Please remove this from the folder.`, "\x1b[0m");
            }
        }
    }
}

// todo: implement binary search
function doesEntryExistInArray(array, entry) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] == entry[0]) { // score match
            return true;
        }
    }
    return false;
}

function isDuplicateEntry(array, score) {
    for (let i = 0; i < array.length; i++) {
        const entryScore = array[i][0];
        if (entryScore == score) {
            return [true, array[i]];
        }
    }
    return [false, null];
}

function approveNewEntry(i, pathToFile, destination, unverifiedData, difficulty, character, date) {
    // copies file to folder
    fs.copyFileSync(pathToFile, destination);
    console.log(`Copied file at ${pathToFile} to ${destination}`);
    // removes file
    fs.unlinkSync(pathToFile);
    console.log(`Deleted file at ${pathToFile}`);
    // updates date to be more accurate
    unverifiedData[difficulty][character][i][2] = date.toISOString();
    // adds entry to verified json;
    const verifiedJson = fetchJson(PATH_VERIFIED_JSON);
    verifiedJson[difficulty][character].push(unverifiedData[difficulty][character][i]);
    sortArrayScore(verifiedJson[difficulty][character]);
    fs.writeFileSync(PATH_VERIFIED_JSON, JSON.stringify(verifiedJson));
    console.log(`Updated JSON at ${PATH_VERIFIED_JSON}`);
    // removes entry from unverified json
    console.log(`Removed entry ${unverifiedData[difficulty][character][i]} from unverified records`);
    unverifiedData[difficulty][character].splice(i, 1);
    fs.writeFileSync(PATH_UNVERIFIED_JSON, JSON.stringify(unverifiedData));
    console.log(`Updated JSON at ${PATH_UNVERIFIED_JSON}`);
}

function replayMatchesUnverifiedEntry(i, pathToFile, destination, unverifiedData, difficulty, character, file, date, unverifiedEntry) {
    console.log(`Found a match between replay \x1b[33m${file}\x1b[0m and unverified entry ${unverifiedEntry}`)
    while (true) {
        const check = readline.question(`Approve of entry ${unverifiedEntry}? [Y/N]\n > `);
        if (check.toLowerCase() === "y") {
            console.log("\x1b[32m", `Approved entry ${unverifiedEntry}`);
            console.log("\x1b[0m");
            approveNewEntry(i, pathToFile, destination, unverifiedData, difficulty, character, date);
            break;
        } else if (check.toLowerCase() === "n") {
            console.log("\x1b[31m", `Denied entry ${unverifiedEntry}`);
            fs.unlinkSync(pathToFile);
            console.log(`Deleted file at ${pathToFile}`);
            console.log("\x1b[0m");
            break;
        } else {
            console.warn("\x1b[33m", "Invalid input! Please enter 'Y' for yes or 'N' for no.");
        }
    }
}

function createDirectory(parent) {
    createDirIfNotExist(parent);
    createDifficultyPlayerDir(parent);
}

function createDifficultyPlayerDir(parent) {
    for (let i = 0; i < DIFFICULTY_LIST.length; i++) {
        const difficulty = DIFFICULTY_LIST[i];
        createDirIfNotExist(`${parent}/${difficulty}`);
        const playerList = getShottypes(difficulty);
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            createDirIfNotExist(`${parent}/${difficulty}/${player}`);
        }
    }
}

function createDirIfNotExist(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
        console.log(`Created folder at ${path}`);
    }
}

function moveVerifiedReplays() {
    let counter = 0;
    const verifiedJson = fetchJson(PATH_VERIFIED_JSON);
    for (let i = 0; i < DIFFICULTY_LIST.length; i++) {
        const difficulty = DIFFICULTY_LIST[i];
        const playerList = getShottypes(difficulty);
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            const categoryData = verifiedJson[difficulty][player];
            for (let k = 0; k < categoryData.length; k++) {
                counter++;
                const entry = categoryData[k];
                const score = entry[0];
                const rpyName = `${GAME}_${difficulty}_${player}_${score}.rpy`.toLowerCase();
                const fileToCheck = `${PATH_GAME_REPLAYS}/${difficulty}/${player}/${rpyName}`;
                const pathToSaveFile = `${PATH_WR_REPLAYS}/${difficulty}/${player}/${rpyName}`;
                fs.copyFileSync(fileToCheck, pathToSaveFile);
            }
        }
    }
    console.log("\x1b[32m", `Successfully copied ${counter} file(s) to ${PATH_WR_REPLAYS} !`)
}

function createUnverifiedVerifiedJson() {
    const unverifiedJson = {};
    const verifiedJson = {}
    for (let i = 0; i < DIFFICULTY_LIST.length; i++) {
        const difficulty = DIFFICULTY_LIST[i];
        unverifiedJson[difficulty] = {};
        verifiedJson[difficulty] = {};
        const playerList = getShottypes(difficulty);
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            const categoryData = WR_DATA[GAME][difficulty][player]
            const categoryPath = `${PATH_GAME_REPLAYS}/${difficulty}/${player}`
            const files = fs.readdirSync(categoryPath);
            const arr = [];
            files.forEach(function (file) {
                const replayPath = `${categoryPath}/${file}`;
                const replayData = fs.readFileSync(replayPath);
                const rpy = mapGame(replayData);
                const score = rpy.getScore();
                const date = rpy.getDate();
                const name = rpy.getName();
                arr.push([score, name, date])
            })
            sortArrayDate(arr);
            // Check for any matches between entries in the .json and the replay files. The object now makes a distinction between verified and unverified replays.
            // Split the object into two objects. One object has the unverified data, the other has the verified data.
            const jsonVerified = intersectionArray(categoryData, arr); // gets all replays from categoryData that has a replay
            let jsonUnverified = differenceArray(categoryData, jsonVerified); //unverified = total - verified
            // Merge the verified data with the new replays. Sort by score and then reduce it by score. The product is a functional verified WR history of the category.
            let verified = mergeArray(jsonVerified, arr);
            const invalidReplays = [];
            outerLoop: while (true) {
                console.log(invalidReplays)
                // remove all replays that are in invalidReplays from verified
                verified = differenceArray(verified, invalidReplays);
                sortArrayDate(verified);
                reduceByScore(verified);
                const newVerified = differenceArray(verified, jsonVerified);
                if (newVerified.length > 0) {
                    console.log(newVerified)
                    console.warn("\x1b[33m", `New WR entries detected for category ${difficulty + player}!`)
                    for (let i = 0; i < newVerified.length; i++) {
                        const entry = newVerified[i];
                        let check;
                        while (true) {
                            check = readline.question(`Approve of entry ${entry}? Y/N\n > `);
                            if (check.toLowerCase() === "y") {
                                console.log("\x1b[32m", `Approved entry ${entry}`);
                                console.log("\x1b[0m");
                                break;
                            } else if (check.toLowerCase() === "n") {
                                console.log("\x1b[31m", `Denied entry ${entry}`);
                                console.log("\x1b[0m");
                                invalidReplays.push(newVerified[i]);
                                newVerified.splice(i, 1);
                                i--;
                                continue outerLoop;
                            } else {
                                console.warn("\x1b[33m", "Invalid input! Please enter 'Y' for yes or 'N' for no.");
                            }
                        }
                    }
                }
                break;
            }
            //the above: loop through every entry in verified, and manually approve/disapprove of new replays. If replay R is disapproved, remove R from verified, add R to invalidReplays, and loop 

            // We merge the category at verified category with unverified json and we then reduce it. We then look at the **if any unverified entries have been removed**, and we are **NOT** looking at the verified entries. The unverified entries that were reduced are then removed from the object with the unverified entries (because those entries are not considered to be WR anymore).
            const temp = mergeArray(verified, jsonUnverified);
            sortArrayDate(temp);
            const removedEntries = reduceByScore(temp); // removedEntries contains array of elements that are removed, which could contain a mix of both verified and unverified entries
            const removedUnverified = intersectionArray(removedEntries, jsonUnverified); // only get unverified entries that have been removed from temp from removedEntries
            jsonUnverified = differenceArray(jsonUnverified, removedUnverified); // update jsonUnverified by removing the invalid unverified entry 

            unverifiedJson[difficulty][player] = jsonUnverified;
            verifiedJson[difficulty][player] = verified;
        }
    }
    writeJsonToFolder(verifiedJson, unverifiedJson, true);
}

function removeArray(arr, score) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] == score) {
            arr.splice(i, 1);
            return;
        }
    }
}

function logArrays(arr) {
    for (let i = 0; i < arr.length; i++) {
        const entry = arr[i];
        let check;
        while (true) {
            check = readline.question(`Approve of entry ${entry}? Y/N\n > `);
            if (check.toLowerCase() === "y") {
                console.log("\x1b[32m", `Approved entry ${entry}`);
                console.log("\x1b[0m");
                break;
            } else if (check.toLowerCase() === "n") {
                console.log("\x1b[31m", `Denied entry ${entry}`);
                console.log("\x1b[0m");
                arr.splice(i, 1);
                i--;
                break;
            } else {
                console.warn("\x1b[33m", "Invalid input! Please enter 'Y' for yes or 'N' for no.");
            }
        }
    }
}

function writeJsonToFolder(verifiedJson, unverifiedJson, production = false) {
    if (production) {
        fs.writeFileSync(PATH_UNVERIFIED_JSON, JSON.stringify(unverifiedJson));
        console.log("\x1b[32m", `Successfully created file ${PATH_UNVERIFIED_JSON}`);
        fs.writeFileSync(PATH_VERIFIED_JSON, JSON.stringify(verifiedJson));
        console.log("\x1b[32m", `Successfully created file ${PATH_VERIFIED_JSON}`);
    } else {
        fs.writeFileSync(`unverified-test-${GAME}.json`, JSON.stringify(unverifiedJson));
        fs.writeFileSync(`verified-test-${GAME}.json`, JSON.stringify(verifiedJson));
    }
}

function copyReplaysToPath() {
    const files = fs.readdirSync(PATH_GAME_REPLAYS);
    let counter = 0;
    createDifficultyPlayerDir(PATH_GAME_REPLAYS)
    files.forEach(function (file) {
        if (isRpy(file)) {
            const replayData = fs.readFileSync(`${PATH_GAME_REPLAYS}/${file}`);
            const rpy = mapGame(replayData);
            const difficulty = rpy.getDifficulty();
            const character = rpy.getShot();
            const score = rpy.getScore();
            const pathToCopyAt = `${PATH_GAME_REPLAYS}/${difficulty}/${character}`;
            const rpyName = `${GAME}_${difficulty}_${character}_${score}.rpy`.toLowerCase();
            const valid = rpy.isValid();
            if (valid) {
                fs.copyFileSync(`${PATH_GAME_REPLAYS}/${file}`, `${pathToCopyAt}/${rpyName}`);
                counter++;
            } else {
                console.log(`Replay ${PATH_GAME_REPLAYS}/${file} is not valid.`)
            }
        }
    });
    console.log(`Successfully copied ${counter} replay(s) to ${PATH_GAME_REPLAYS}`)
}

function isRpy(str) {
    return str.slice(str.length - 4) === ".rpy";
}

function replaysMatchJson() {
    const verifiedData = fetchJson(PATH_VERIFIED_JSON);
    for (let i = 0; i < DIFFICULTY_LIST.length; i++) {
        const difficulty = DIFFICULTY_LIST[i];
        const playerList = getShottypes(difficulty);
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            const categoryData = verifiedData[difficulty][player];
            const pathToFiles = `${PATH_WR_REPLAYS}/${difficulty}/${player}`;
            const categoryFiles = fs.readdirSync(pathToFiles);
            for (let k = 0; k < categoryData.length; k++) {
                const score = categoryData[k][0];
                const rpyName = `${GAME}_${difficulty}_${player}_${score}.rpy`.toLowerCase();
                const fileToCheck = `${PATH_WR_REPLAYS}/${difficulty}/${player}/${rpyName}`;
                const boolJsonToReplay = fs.existsSync(fileToCheck);
                // checks if json entry does not have a corresponding replay
                if (boolJsonToReplay) {
                    const index = categoryFiles.indexOf(rpyName);
                    categoryFiles.splice(index, 1);
                } else {
                    console.warn("\x1b[31m", `${fileToCheck} does not exist but is in the json! \n Score: ${score}`, "\x1b[0m")
                }
            }

            if (categoryFiles.length > 0) {
                categoryFiles.forEach(element => {
                    while (true) {
                        console.warn("\x1b[31m", `${pathToFiles}/${element} exists but is not an entry in the JSON!`, "\x1b[0m")
                        const check = readline.question(`Do you want to remove it? [Y/N]\n > `);
                        if (check.toLowerCase() === "y") {
                            createDirIfNotExist(PATH_REMOVED_REPLAYS);
                            fs.renameSync(`${pathToFiles}/${element}`, `${PATH_REMOVED_REPLAYS}/${element}`);
                            console.log(`Moved ${pathToFiles}/${element} to ${PATH_REMOVED_REPLAYS}/${element}`);
                            break;
                        } else if (check.toLowerCase() === "n") {
                            console.log("\x1b[31m", `Did nothing`);
                            break;
                        } else {
                            console.warn("\x1b[33m", "Invalid input! Please enter 'Y' for yes or 'N' for no.");
                        }
                    }
                })
            }
        }
    }

}

function mergeArray(arr1, arr2) {
    return [...arr1, ...arr2];
}

function sortArrayDate(arr) {
    arr.sort((a, b) => new Date(a[2]) - new Date(b[2]));
}

function sortArrayScore(arr) {
    arr.sort((a, b) => a[0] - b[0]);
}

function reduceByScore(arr) {
    let highest = 0;
    let removedElements = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] > highest) {
            highest = arr[i][0];
        } else {
            removedElements.push(arr[i]);
            arr.splice(i, 1);
            i--;
        }
    }
    return removedElements;
}

function sortByScore(arrReplays, arrJson, removedElements) {
    const matchingEntries = intersectionArray(arrReplays, arrJson); // array of replays that are already a WR and have a valid replay and their date is good but name isnt
    const intersectionJsonNames = intersectionArray(arrJson, arrReplays); // array of replays that are already a WR and have a valid replay and their name is good
    const newEntries = differenceArray(arrReplays, matchingEntries); // basically does the following: arrReplays = intersection
    const unverifiedEntries = differenceArray(arrJson, mergeArray(matchingEntries, removedElements));
    for (let i = 0; i < matchingEntries.length; i++) {
        matchingEntries[i][1] = intersectionJsonNames[i][1]; // changes replay name to already existing name in arrJson
    }
    return [newEntries, unverifiedEntries, matchingEntries]
}

function intersectionArray(arr1, arr2) {
    return arr1.filter(tempArr1 => arr2.some(tempArr2 => tempArr1[0] === tempArr2[0]));
}
function differenceArray(arr1, arr2) {
    return arr1.filter(tempArr1 => !arr2.some(tempArr2 => tempArr1[0] === tempArr2[0]));
}

function mapGame(replayData) {
    let replayClass;
    switch (GAME) {
        case "th06":
            replayClass = Replay06;
            break;
        case "th10":
            replayClass = Replay10;
            break;
        case "th11":
            replayClass = Replay11;
            break;
        case "th12":
            replayClass = Replay12;
            break;
        case "th13":
            replayClass = Replay13;
            break;
        case "th14":
            replayClass = Replay14;
            break;
        case "th15":
            replayClass = Replay15;
            break;
        case "th16":
            replayClass = Replay16;
            break;
        case "th18":
            replayClass = Replay18;
            break;
        default:
            console.log(`Input ${GAME} is not valid.`);
            return;
    }
    if (replayData === undefined) {
        return replayClass;
    } else {
        return new replayClass(replayData);
    }
}
