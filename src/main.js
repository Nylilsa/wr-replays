"use strict";

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const readline = require('readline-sync');

const Replay06 = require("D:/GitHub/replay-reader/Replay06.js");
const Replay10 = require("D:/GitHub/replay-reader/Replay10.js");
const Replay15 = require("D:/GitHub/replay-reader/Replay15.js");
const Replay18 = require("D:/GitHub/replay-reader/Replay18.js");
const { match } = require('assert');
const path = require('path');


// const testpath = "D:/GitHub/wr-replays/replays/MAIN/th18/Easy/Reimu/th18_easy_reimu_954243810.rpy"
// const replayData2 = fs.readFileSync(testpath);
// const replay = new Replay18(replayData2);
// console.log(replay)
// console.log(replay.getStageData(7))
// console.log(replay)

const GAME = "th10";
const PATH_WRPROGRESSION_JSON = `D:/GitHub/nylilsa.github.io/json/wrprogression.json`;
const PATH_VERIFIED_JSON = `D:/GitHub/nylilsa.github.io/json/wr/verified/${GAME}.json`;
const PATH_UNVERIFIED_JSON = `D:/GitHub/nylilsa.github.io/json/wr/unverified/${GAME}.json`;
const PATH_NEW_REPLAYS = `D:/GitHub/wr-replays/new-replays/${GAME}`;
const PATH_WR_REPLAYS = `D:/GitHub/wr-replays/${GAME}`;
const PATH_GAME_REPLAYS = `D:/GitHub/wr-replays/replays/MAIN/${GAME}`;
const PATH_REMOVED_REPLAYS = `D:/GitHub/wr-replays/removed-replays/${GAME}`;
const WR_DATA = fetchJson(PATH_WRPROGRESSION_JSON);


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
    // // renameImpureFiles();
    // copyReplaysToPath();
    // createUnverifiedVerifiedJson();
    // moveVerifiedReplays();

    // replaysMatchJson();
    addEntries();
}

// function renameImpureFiles() {
//     const files = fs.readdirSync(PATH_GAME_REPLAYS);
//     files.forEach((file) => {
//         if (isRpy(file)) {
//             if (file.includes(" ") || file.substring(0, file.length - 4).includes(".") || file.includes("(") || file.includes(")")) {
//                 const oldFile = file;
//                 file = file.substring(0, file.length - 4).replaceAll(".", "a").replaceAll(" ", "b").replaceAll("(", "c").replaceAll(")", "d") + ".rpy";
//                 fs.renameSync(`${PATH_GAME_REPLAYS}/${oldFile}`, `${PATH_GAME_REPLAYS}/${file}`);
//                 console.log(`Renamed ${PATH_GAME_REPLAYS}/${oldFile} to ${PATH_GAME_REPLAYS}/${file}`);
//             }
//         }
//     })
// }

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
                replayMatchesUnverifiedEntry(i, pathToFile, `${pathToCopyAt}/${rpyName}`, unverifiedData, difficulty, character, file, date);
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
                        // fs.unlinkSync(pathToFile);
                        // console.log(`Deleted file at ${pathToFile}`);
                        // console.log("\x1b[0m");
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
    console.log(`Removed entry ${unverifiedData[difficulty][character][i]}`);
    unverifiedData[difficulty][character].splice(i, 1);
    fs.writeFileSync(PATH_UNVERIFIED_JSON, JSON.stringify(unverifiedData));
    console.log(`Updated JSON at ${PATH_UNVERIFIED_JSON}`);
}

function replayMatchesUnverifiedEntry(i, pathToFile, destination, unverifiedData, difficulty, character, file, date) {
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
    const playerList = mapGame().playerList;
    const difficultyList = mapGame().difficultyList;
    for (let i = 0; i < difficultyList.length; i++) {
        const difficulty = difficultyList[i];
        createDirIfNotExist(`${parent}/${difficulty}`);
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
    const playerList = mapGame().playerList;
    const difficultyList = mapGame().difficultyList;
    const verifiedJson = fetchJson(PATH_VERIFIED_JSON);
    for (let i = 0; i < difficultyList.length; i++) {
        const difficulty = difficultyList[i];
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
    const playerList = mapGame().playerList;
    const difficultyList = mapGame().difficultyList;
    const unverifiedJson = {};
    const verifiedJson = {};
    for (let i = 0; i < difficultyList.length; i++) {
        const difficulty = difficultyList[i];
        unverifiedJson[difficulty] = {};
        verifiedJson[difficulty] = {};
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
            sortArrayDate(arr)
            reduceByScore(arr);
            const [unmerged, unverifiedObject, verifiedUnmerged] = sortByScore(arr, categoryData)
            if (unmerged.length > 0) {
                console.warn("\x1b[33m", `New WR entries detected for category ${difficulty + player}!`)
                logArrays(unmerged)
            }
            const verifiedObject = mergeArray(unmerged, verifiedUnmerged);
            sortArrayScore(verifiedObject);
            unverifiedJson[difficulty][player] = unverifiedObject;
            verifiedJson[difficulty][player] = verifiedObject;
        }
    }
    writeJsonToFolder(verifiedJson, unverifiedJson, true);
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
        console.log("\x1b[32m", `Successfully created file ${pathToJson}/unverified/${GAME}.json`);
        fs.writeFileSync(PATH_VERIFIED_JSON, JSON.stringify(verifiedJson));
        console.log("\x1b[32m", `Successfully created file ${pathToJson}/verified/${GAME}.json`);
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
            fs.copyFileSync(`${PATH_GAME_REPLAYS}/${file}`, `${pathToCopyAt}/${rpyName}`);
            counter++;
        }
    });
    console.log(`Successfully copied ${counter} replay(s) to ${PATH_GAME_REPLAYS}`)
}

function isRpy(str) {
    return file.slice(file.length - 4) === ".rpy";
}

function replaysMatchJson() {
    const verifiedData = fetchJson(PATH_VERIFIED_JSON);
    const playerList = mapGame().playerList;
    const difficultyList = mapGame().difficultyList;
    for (let i = 0; i < difficultyList.length; i++) {
        const difficulty = difficultyList[i];
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
                    console.warn("\x1b[31m", `${pathToFiles}/${element} exists but is not an entry in the JSON!`, "\x1b[0m")
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
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] > highest) {
            highest = arr[i][0];
        } else {
            arr.splice(i, 1);
            i--;
        }
    }
}

function sortByScore(arrReplays, arrJson) {
    const matchingEntries = intersectionArray(arrReplays, arrJson); // array of replays that are already a WR and have a valid replay and their date is good but name isnt
    const intersectionJsonNames = intersectionArray(arrJson, arrReplays); // array of replays that are already a WR and have a valid replay and their name is good
    const newEntries = differenceArray(arrReplays, matchingEntries); // basically does the following: arrReplays = intersection
    const unverifiedEntries = differenceArray(arrJson, matchingEntries);
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
        case "th15":
            replayClass = Replay15;
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
