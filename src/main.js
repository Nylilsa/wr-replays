// import fetch from 'node-fetch';

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const Replay15 = require("D:/GitHub/replay-reader/Replay15.js");
const Replay18 = require("D:/GitHub/replay-reader/Replay18.js");
const fs = require('fs');
const path = "D:/GitHub/nylilsa.github.io/replays/MAIN/th18/Easy/Reimu/th18_easy_reimu_954243810.rpy"
let replayData2 = fs.readFileSync(path);
const replay = new Replay18(replayData2);
// console.log(replay)
// console.log(replay.getStageData(7))
// console.log(replay)

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
    const game = "th18";
    const path = `D:/GitHub/nylilsa.github.io/replays/MAIN/${game}`;
    // copyReplaysToPath(game, path);
    // createUnverifiedVerifiedJson(game, wrdata, path);
    moveVerifiedReplays(game, path)
}

function moveVerifiedReplays(game, path) {
    let counter = 0;
    const pathToSave = `D:/GitHub/wr-replays/${game}`;
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
                // console.log(fileToCheck);
                const pathToSaveFile = `${pathToSave}/${difficulty}/${player}/${rpyName}`;
                fs.copyFileSync(fileToCheck, pathToSaveFile);
            }
        }
    }
    console.log(`Successfully copied ${counter} file(s) to ${pathToSave} !`)
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
                console.warn(difficulty + player)
                console.warn(`New WR entries detected! ${unmerged}\n`)
            }
            const verifiedObject = mergeArray(unmerged, verifiedUnmerged);
            sortArrayScore(verifiedObject);
            unverifiedJson[difficulty][player] = unverifiedObject;
            verifiedJson[difficulty][player] = verifiedObject;
        }
    }
    writeJsonToFolder(game, verifiedJson, unverifiedJson, true)
}

function writeJsonToFolder(game, verifiedJson, unverifiedJson, production = false) {
    const pathToJson = "D:/GitHub/nylilsa.github.io/json/wr";
    if (production) {
        fs.writeFileSync(`${pathToJson}/unverified/${game}.json`, JSON.stringify(unverifiedJson));
        fs.writeFileSync(`${pathToJson}/verified/${game}.json`, JSON.stringify(verifiedJson));
    } else {
        fs.writeFileSync(`unverified-test-${game}.json`, JSON.stringify(unverifiedJson));
        fs.writeFileSync(`verified-test-${game}.json`, JSON.stringify(verifiedJson));
    }
}

function copyReplaysToPath(game, path) {
    fs.readdir(path, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
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
            }
        });
    });
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
            case "th18":
                return Replay18;
            case "th15":
                return Replay15;
            default:
                console.log("Invalid thingy try again pls");
        }
    } else {
        switch (game) {
            case "th18":
                return new Replay18(replayData);
            case "th15":
                return new Replay15(replayData);
            default:
                console.log("Invalid thingy try again pls");
        }
    }
}


init()