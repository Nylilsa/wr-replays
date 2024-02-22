// import fetch from 'node-fetch';

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const Replay06 = require("D:/GitHub/replay-reader/Replay06.js");
const Replay15 = require("D:/GitHub/replay-reader/Replay15.js");
const Replay18 = require("D:/GitHub/replay-reader/Replay18.js");
const fs = require('fs');
const path = "D:/GitHub/wr-replays/replays/MAIN/th18/Easy/Reimu/th18_easy_reimu_954243810.rpy"
let replayData2 = fs.readFileSync(path);
const replay = new Replay18(replayData2);
// console.log(replay)
// console.log(replay.getStageData(7))
// console.log(replay)

const readline = require('readline-sync');

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
    const wrdata = fetchJson("D:/GitHub/nylilsa.github.io/json/wrprogression.json");
    const game = "th15";
    const path = `D:/GitHub/wr-replays/replays/MAIN/${game}`;
    const pathWr = `D:/GitHub/wr-replays/${game}`;
    const pathNew = `D:/GitHub/wr-replays/new-replays/${game}`;
    // createDirectory(game, pathWr);
    // copyReplaysToPath(game, path);
    // createUnverifiedVerifiedJson(game, wrdata, path);
    // moveVerifiedReplays(game, path, pathWr);
    
    // replaysMatchJson(game, path, pathWr);
    addEntries(game, pathNew, pathWr);
}

// this function looks at the replays in pathNew, then checks if those replays are valid WR replays or not.
// if not, console.log it
// if score matches entry in UNVERIFIED json, then warn user about it and ask user if they want to remove unverified entry to add verified entry and more to correct folder
// if valid, ask to update the .json file and move to correct folder.
function addEntries(game, pathNew, pathWr) {
    createDirIfNotExist(pathNew);
    const unverifiedData = fetchJson(`D:/GitHub/nylilsa.github.io/json/wr/unverified/${game}.json`);
    const verifiedData = fetchJson(`D:/GitHub/nylilsa.github.io/json/wr/verified/${game}.json`);
    const newFiles = fs.readdirSync(pathNew);
    for (let j=0; j < newFiles.length; j++) {
        const file = newFiles[j];
        let isUnverifiedEntry = false;
        const pathToFile = `${pathNew}/${file}`;
        const replayData = fs.readFileSync(pathToFile);
        const rpy = mapGame(game, replayData);
        const difficulty = rpy.getDifficulty();
        const character = rpy.getShot();
        const score = rpy.getScore();
        const date = rpy.getDate();
        const name = rpy.getName();
        const unverifiedCategory = unverifiedData[difficulty][character];
        const verifiedCategory = verifiedData[difficulty][character];
        const pathToCopyAt = `${pathWr}/${difficulty}/${character}`;
        const rpyName = `${game}_${difficulty}_${character}_${score}.rpy`.toLowerCase();
        const replayAlreadyExistsInVerified = isDuplicateEntry(verifiedCategory, score);
        if (replayAlreadyExistsInVerified[0]) {
            console.log("\x1b[33m", `Replay ${file} category ${character+difficulty} is already verified with ${replayAlreadyExistsInVerified[1]}!`, "\x1b[0m");
            continue;
        }
        for (let i = 0; i < unverifiedCategory.length; i++) {
            unverifiedEntry = unverifiedCategory[i];
            if (score == unverifiedEntry[0]) { // replay matches unverified entry
                replayMatchesUnverifiedEntry(i, game, pathToFile, `${pathToCopyAt}/${rpyName}`, unverifiedData, difficulty, character, file, date);
                isUnverifiedEntry = true;
                break;
            }
        }
        if (!isUnverifiedEntry) {
            const category = verifiedData[difficulty][character];
            const newEntry = [score, name, date.toISOString()];
            category.push(newEntry);
            sortArrayDate(category);
            const removed = reduceByScore(category);
            if (removed == 0) {
                while (true) {
                    const check = readline.question(`${file} seems to be a new entry. Approve of entry ${newEntry}? [Y/N]\n > `);
                    if (check.toLowerCase() === "y") {
                        console.log("\x1b[32m", `Approved entry ${newEntry}`);
                        console.log("\x1b[0m");
                        fs.copyFileSync(pathToFile, `${pathToCopyAt}/${rpyName}`);
                        console.log(`Copied file at ${pathToFile} to ${pathToCopyAt}/${rpyName}`);
                        fs.unlinkSync(pathToFile);
                        console.log(`Deleted file at ${pathToFile}`);
                        fs.writeFileSync(`D:/GitHub/nylilsa.github.io/json/wr/verified/${game}.json`, JSON.stringify(verifiedData));
                        console.log(`Updated JSON at D:/GitHub/nylilsa.github.io/json/wr/verified/${game}.json`)
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
                console.log("\x1b[31m", `File ${file} category ${character+difficulty} with ${newEntry} is not a missing/new WR entry nor is it unverified. Please remove this from the folder.`, "\x1b[0m");
            }
        }
    }
}

function isDuplicateEntry(array, score) {
    for (let i=0; i < array.length; i++) {
        const entryScore = array[i][0];
        if (entryScore == score) {
            return [true, array[i]];
        }
    }
    return [false, undefined];
}

function approveNewEntry(i, game, pathToFile, destination, unverifiedData, difficulty, character, date) {
    // copies file to folder
    fs.copyFileSync(pathToFile, destination);
    console.log(`Copied file at ${pathToFile} to ${destination}`);
    // removes file
    fs.unlinkSync(pathToFile);
    console.log(`Deleted file at ${pathToFile}`);
    // updates date to be more accurate
    unverifiedData[difficulty][character][i][2] = date.toISOString();
    // adds entry to verified json;
    const jsonPathVerified = `D:/GitHub/nylilsa.github.io/json/wr/verified/${game}.json`;
    const verifiedJson = fetchJson(jsonPathVerified);
    verifiedJson[difficulty][character].push(unverifiedData[difficulty][character][i]);
    sortArrayScore(verifiedJson[difficulty][character]);
    fs.writeFileSync(jsonPathVerified, JSON.stringify(verifiedJson));
    console.log(`Updated JSON at ${jsonPathVerified}`);
    // removes entry from unverified json
    console.log(`Removed entry ${unverifiedData[difficulty][character][i]}`);
    unverifiedData[difficulty][character].splice(i, 1);
    const jsonPathUnverified = `D:/GitHub/nylilsa.github.io/json/wr/unverified/${game}.json`;
    fs.writeFileSync(jsonPathUnverified, JSON.stringify(unverifiedData));
    console.log(`Updated JSON at ${jsonPathUnverified}`);
}

function replayMatchesUnverifiedEntry(i, game, pathToFile, destination, unverifiedData, difficulty, character, file, date) {
    console.log(`Found a match between replay \x1b[33m${file}\x1b[0m and unverified entry ${unverifiedEntry}`)
    while (true) {
        const check = readline.question(`Approve of entry ${unverifiedEntry}? [Y/N]\n > `);
        if (check.toLowerCase() === "y") {
            console.log("\x1b[32m", `Approved entry ${unverifiedEntry}`);
            console.log("\x1b[0m");
            approveNewEntry(i, game, pathToFile, destination, unverifiedData, difficulty, character, date);
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

function createDirectory(game, parent) {
    createDirIfNotExist(parent);
    createDifficultyPlayerDir(game, parent);
}

function createDifficultyPlayerDir(game, parent) {
    const playerList = mapGame(game).playerList;
    const difficultyList = mapGame(game).difficultyList;
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

function moveVerifiedReplays(game, path, pathWr) {
    let counter = 0;
    const playerList = mapGame(game).playerList;
    const difficultyList = mapGame(game).difficultyList;
    const verifiedJson = fetchJson(`D:/GitHub/nylilsa.github.io/json/wr/verified/${game}.json`);
    for (let i = 0; i < difficultyList.length; i++) {
        const difficulty = difficultyList[i];
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            const categoryData = verifiedJson[difficulty][player];
            for (let k = 0; k < categoryData.length; k++) {
                counter++;
                const entry = categoryData[k];
                const score = entry[0];
                const rpyName = `${game}_${difficulty}_${player}_${score}.rpy`.toLowerCase();
                const fileToCheck = `${path}/${difficulty}/${player}/${rpyName}`;
                const pathToSaveFile = `${pathWr}/${difficulty}/${player}/${rpyName}`;
                fs.copyFileSync(fileToCheck, pathToSaveFile);
            }
        }
    }
    console.log("\x1b[32m", `Successfully copied ${counter} file(s) to ${pathWr} !`)
}

function createUnverifiedVerifiedJson(game, wrdata, path) {
    const playerList = mapGame(game).playerList;
    const difficultyList = mapGame(game).difficultyList;
    const unverifiedJson = {};
    const verifiedJson = {};
    for (let i = 0; i < difficultyList.length; i++) {
        const difficulty = difficultyList[i];
        unverifiedJson[difficulty] = {};
        verifiedJson[difficulty] = {};
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            const categoryData = wrdata[game][difficulty][player]
            const categoryPath = `${path}/${difficulty}/${player}`
            const files = fs.readdirSync(categoryPath);
            const arr = [];
            files.forEach(function (file) {
                const replayPath = `${categoryPath}/${file}`;
                const replayData = fs.readFileSync(replayPath);
                const rpy = mapGame(game, replayData);
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
    writeJsonToFolder(game, verifiedJson, unverifiedJson, true);
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

function writeJsonToFolder(game, verifiedJson, unverifiedJson, production = false) {
    const pathToJson = "D:/GitHub/nylilsa.github.io/json/wr";
    if (production) {
        fs.writeFileSync(`${pathToJson}/unverified/${game}.json`, JSON.stringify(unverifiedJson));
        console.log("\x1b[32m", `Successfully created file ${pathToJson}/unverified/${game}.json`);
        fs.writeFileSync(`${pathToJson}/verified/${game}.json`, JSON.stringify(verifiedJson));
        console.log("\x1b[32m", `Successfully created file ${pathToJson}/verified/${game}.json`);
    } else {
        fs.writeFileSync(`unverified-test-${game}.json`, JSON.stringify(unverifiedJson));
        fs.writeFileSync(`verified-test-${game}.json`, JSON.stringify(verifiedJson));
    }
}

function copyReplaysToPath(game, path) {
    const files = fs.readdirSync(path);
    let counter = 0;
    files.forEach(function (file) {
        const lastFourCharacters = file.slice(file.length - 4)
        if (lastFourCharacters === ".rpy") {
            const replayData = fs.readFileSync(`${path}/${file}`);
            const rpy = mapGame(game, replayData);
            const difficulty = rpy.getDifficulty();
            const character = rpy.getShot();
            const score = rpy.getScore();
            const pathToCopyAt = `${path}/${difficulty}/${character}`;
            const rpyName = `${game}_${difficulty}_${character}_${score}.rpy`.toLowerCase();
            fs.copyFileSync(`${path}/${file}`, `${pathToCopyAt}/${rpyName}`);
            counter++;
        }
    });
    console.log(`Successfully copied ${counter} replay(s) to ${path}`)
}


function replaysMatchJson(game, path, pathWr) {
    const jsonPath = `D:/GitHub/nylilsa.github.io/json/wr/verified/${game}.json`;
    const verifiedData = fetchJson(jsonPath);
    const playerList = mapGame(game).playerList;
    const difficultyList = mapGame(game).difficultyList;
    for (let i = 0; i < difficultyList.length; i++) {
        const difficulty = difficultyList[i];
        for (let j = 0; j < playerList.length; j++) {
            const player = playerList[j];
            const categoryData = verifiedData[difficulty][player];
            const pathToFiles = `${pathWr}/${difficulty}/${player}`;
            const categoryFiles = fs.readdirSync(pathToFiles);
            for (let k = 0; k < categoryData.length; k++) {
                const score = categoryData[k][0];
                const rpyName = `${game}_${difficulty}_${player}_${score}.rpy`.toLowerCase();
                const fileToCheck = `${pathWr}/${difficulty}/${player}/${rpyName}`;
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
    let removed = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] > highest) {
            highest = arr[i][0];
        } else {
            arr.splice(i, 1);
            removed++;
            i--;
        }
    }
    return removed;
}

function sortByScore(arrReplays, arrJson) {
    const intersection = arrReplays.filter(tempArr1 => arrJson.some(tempArr2 => tempArr1[0] === tempArr2[0]));
    const intersection2 = arrJson.filter(tempArr1 => arrReplays.some(tempArr2 => tempArr1[0] === tempArr2[0]));
    const replays = arrReplays.filter(tempArr1 => !intersection.some(tempArr2 => tempArr1[0] === tempArr2[0]));
    const json = arrJson.filter(tempArr1 => !intersection.some(tempArr2 => tempArr1[0] === tempArr2[0]));
    for (let i = 0; i < intersection.length; i++) {
        intersection[i][1] = intersection2[i][1]; // changes replay name to already existing name in arrJson
    }
    return [replays, json, intersection]
}

function mapGame(game, replayData) {
    if (replayData === undefined) {
        switch (game) {
            case "th06":
                return Replay06;
            case "th15":
                return Replay15;
            case "th18":
                return Replay18;
            default:
                console.log("Invalid thingy try again pls");
        }
    } else {
        switch (game) {
            case "th06":
                return new Replay06(replayData);
            case "th15":
                return new Replay15(replayData);
            case "th18":
                return new Replay18(replayData);
            default:
                console.log("Invalid thingy try again pls");
        }
    }
}