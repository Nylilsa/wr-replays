"use strict";

const fs = require('fs');
const readline = require('readline-sync');

const Replay = require("D:/GitHub/replay-reader/src/Replay.js");

// const testpath = "${BASE_WR_REPLAYS}/replays/MAIN/th18/Easy/Reimu/th18_easy_reimu_954243810.rpy"
// const replayData2 = fs.readFileSync(testpath);
// const replay = new Replay18(replayData2);
// console.log(replay)
// console.log(replay.getStageData(7))
// console.log(replay)

const GAME = "th08";
const ALL_GAMES = ["th01", "th02", "th03", "th04", "th05",
    "th06", "th07", "th08", "th10", "th11",
    "th12", "th128", "th13", "th14", "th15",
    "th16", "th17", "th18"];
const ALL_REPLAY_GAMES = ["th06", "th07", "th08", "th10", "th11", "th12", "th128", "th13", "th14", "th15", "th16", "th17", "th18"]
const BASE_WR_REPLAYS = process.cwd();
const BASE_NYLILSA_GITHUB = `${BASE_WR_REPLAYS}/json/nylilsa-site`;
const PATH_PLAYERS_JSON = `${BASE_WR_REPLAYS}/json/players.json`;
const PATH_WRPROGRESSION_JSON = `${BASE_NYLILSA_GITHUB}/wrprogression.json`;
const PATH_DATA_JSON = `${BASE_WR_REPLAYS}/json/gameinfo.json`;
const PATH_VERIFIED_JSON = `${BASE_WR_REPLAYS}/json/verified/${GAME}.json`;
const PATH_UNVERIFIED_JSON = `${BASE_WR_REPLAYS}/json/unverified/${GAME}.json`;
const PATH_FALSE_REPLAYS_JSON = `${BASE_WR_REPLAYS}/json/false-replays/${GAME}.json`;
const PATH_TRUE_REPLAYS_JSON = `${BASE_WR_REPLAYS}/json/true-replays/${GAME}.json`;
const PATH_NYLILSA_VERIFIED_JSON = `${BASE_NYLILSA_GITHUB}/verified/${GAME}.json`;
const PATH_NYLILSA_UNVERIFIED_JSON = `${BASE_NYLILSA_GITHUB}/unverified/${GAME}.json`;
const PATH_NYLILSA_PLAYERS_JSON = `${BASE_NYLILSA_GITHUB}/players.json`;
const PATH_NEW_REPLAYS = `${BASE_WR_REPLAYS}/new-replays/${GAME}`;
const PATH_WR_REPLAYS = `${BASE_WR_REPLAYS}/${GAME}`;
const PATH_GAME_REPLAYS = `${BASE_WR_REPLAYS}/replays/MAIN/${GAME}`;
const PATH_REMOVED_REPLAYS = `${BASE_WR_REPLAYS}/removed-replays/${GAME}`;
const UNSET_ID = -2;
const WR_DATA = fetchJson(PATH_WRPROGRESSION_JSON);
const GAME_DATA = fetchJson(PATH_DATA_JSON);
const DIFFICULTY_LIST = Object.keys(GAME_DATA["DifficultyCharacters"][GAME]);

if (DIFFICULTY_LIST.includes("Overdrive")) {
    DIFFICULTY_LIST.splice(DIFFICULTY_LIST.indexOf("Overdrive"), 1)
}

function getShottypes(difficulty, game = GAME) {
    return GAME_DATA["DifficultyCharacters"][game][difficulty];
}

init();

function fetchJson(path) {
    let temp = fs.readFileSync(path, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading the file: ${err}`);
            return;
        }
    });
    return JSON.parse(temp);
}

function writeJson(path, data) {
    makeFile(path, data);
    if (path === PATH_VERIFIED_JSON) {
        makeFile(PATH_NYLILSA_VERIFIED_JSON, data);
    } else if (path === PATH_UNVERIFIED_JSON) {
        makeFile(PATH_NYLILSA_UNVERIFIED_JSON, data);
    } else if (path === PATH_PLAYERS_JSON) {
        makeFile(PATH_NYLILSA_PLAYERS_JSON, data);
    }
}

function makeFile(path, data) {
    const jsonData = typeof data === 'string' ? JSON.stringify(JSON.parse(data)) : JSON.stringify(data);
    fs.writeFileSync(path, jsonData);
    console.log(`Updated file at ${path}`);
}

function displayMenu() {
    const options = [
        "Add replays",
        "Validate JSONs",
        "Validate replays",
        "Merge user IDs",
        "Copy to nylilsa.github.io",
        "Add video links (PC-98)",
        "Exit application"
    ];
    console.log(`Game selected: ${GAME}`);
    console.log("Select an option:");
    options.forEach((option, index) => {
        console.log(`${index + 1}. ${option}`); // Display options as a numbered list
    });
    while (true) {
        const userChoice = readline.questionInt("Enter your choice [1-" + options.length + "]\n> ");
        if (userChoice >= 1 && userChoice <= options.length) {
            return userChoice;
        } else {
            console.log("Invalid choice. Please select a valid option.");
        }
    }
}

function init() {
    while (true) {
        const choice = displayMenu();
        switch (choice) {
            case 1: {
                // note: order matters
                addEntries();
                console.log("Finished running addEntries()");
                generateMappings();
                console.log("Finished running generateMappings()");
                copyToNylilsa();
                console.log("Finished running copyToNylilsa()");
                break;
            }
            case 2: {
                // note: order does not matter
                checkUnverifiedValidity();
                console.log("Finished running checkUnverifiedValidity()");
                getNoEntryNames();
                console.log("Finished running getNoEntryNames()");
                generateMappings();
                console.log("Finished running generateMappings()");
                break;
            }
            case 3: {
                replaysMatchJson();
                console.log("Finished running replaysMatchJson()");
                checkReplayValidity();
                console.log("Finished running checkReplayValidity()");
                generateMappings();
                console.log("Finished running generateMappings()");
                break;
            }
            case 4: {
                // note: order matters
                generateMappings();
                mergeUserIds();
                generateMappings();
                copyToNylilsa();
                process.exit(0);
            }
            case 5: {
                copyToNylilsa();
                process.exit(0);
            }
            case 6: {
                addPc98Source();
                break;
            }
            case 7: {
                console.log("Exiting application.");
                process.exit(0);
            }
            default: {
                console.log("Unexpected error.");
                break;
            }
        }
        console.log();
    }
    // createEmptyJsons(path)
    // createDirectory(PATH_WR_REPLAYS);
    // copyReplaysToPath();
    // createUnverifiedVerifiedJson();
    // moveVerifiedReplays();

    // renameReplays();
    addEntries();
    // checkReplayValidity();
    // replaysMatchJson();
    // convertVerifiedJsonAccurateDate();

    // convertJson(false);

    // writeAllScoresUnverified();
    // compareData();
}

function addPc98Source() {
    //ask for game
    const game = askGame();
    // ask for score
    const unverifiedPath = `${BASE_WR_REPLAYS}/json/unverified/${game}.json`;
    const verifiedPath = `${BASE_WR_REPLAYS}/json/verified/${game}.json`;
    const unverified = fetchJson(unverifiedPath);
    const verified = fetchJson(verifiedPath);
    whileLoop: while (true) {
        const scoreId = askScore();
        const difficulties = Object.keys(unverified);
        console.log(difficulties)
        for (let k = 0; k < difficulties.length; k++) {
            const difficulty = difficulties[k]; // Hard
            const shottypes = Object.keys(unverified[difficulty]);
            console.log(shottypes)
            for (let l = 0; l < shottypes.length; l++) {
                const shottype = shottypes[l]; // MarisaA
                console.log(game + difficulty + shottype)
                const jsonCategory = unverified[difficulty][shottype];
                for (let m = 0; m < jsonCategory.length; m++) {
                    const entry = jsonCategory[m];
                    // when match is found, ask for a source 
                    // assumption: function checkUnverifiedValidity() is run before
                    if (entry.score == scoreId) {
                        console.log(`Found match ${entry.score} of ${game + difficulty + shottype}`)
                        const source = readline.question("Provide a source \n> ");
                        // Add source to entry
                        entry.sources.push(source)
                        // Copy unverified entry to verified entry
                        verified[difficulty][shottype].push(entry)
                        // Delete unverified entry in unverified json
                        jsonCategory.splice(m, 1);
                        sortArrayDate(verified[difficulty][shottype]);
                        reduceByScore(verified[difficulty][shottype]);
                        console.log(`Added source ${source} to ${entry.score} of ${game + difficulty + shottype}`)
                        break whileLoop;
                    }
                    console.log(entry)
                    // console.log(entry)
                }

            }
        }
        console.log(`Score ${scoreId} not found.`);
    }
    writeJson(unverifiedPath, unverified);
    writeJson(verifiedPath, verified);
}

function askGame() {
    const pc98 = ["th01", "th02", "th03", "th04", "th05"];
    while (true) {
        const userChoice = readline.questionInt("Enter your game [" + pc98.toString() + "]\n> ");
        if (userChoice >= 1 && userChoice <= pc98.length) {
            return pc98[userChoice - 1];
        } else {
            console.log("Invalid choice. Please select a valid option.");
        }
    }
}

function askScore() {
    while (true) {
        const input = readline.question("Enter the score\n> ");
        const sanitizedInput = input.replace(/,/g, '');
        const score = parseInt(sanitizedInput, 10);
        if (!isNaN(score) && score >= 1) {
            return score;
        } else {
            console.log("Invalid choice. Please enter a valid number.");
        }
    }
}



// if id10 and id30 are actually the same person, merge them together
// merge ids together, i.e. delete everything from id1 and replace it with id2.
// do this in players.json but also in every th.json file
function mergeUserIds() {
    const players = fetchJson(PATH_PLAYERS_JSON);
    const ids = {
        id1: undefined,
        id2: undefined,
    }
    while (true) {
        ids.id1 = askForId(Object.keys(players), "id1");
        console.log(`Selected player ${players[ids.id1]["name_en"]}`);
        ids.id2 = askForId(Object.keys(players), "id2, this id will be removed");
        console.log(`Selected player ${players[ids.id2]["name_en"]}`);
        if (ids.id1 === ids.id2) {
            console.warn("\x1b[31m", "ID1 and ID2 cannot be the same. Please input different IDs.", "\x1b[0m");
        } else {
            const message = `Do you want to overwrite ${players[ids.id2]["name_en"]} (${ids.id2}) with player ${players[ids.id1]["name_en"]} (${ids.id1}) ?`;
            if (getConfirmation(message)) {
                ids.id1 = parseInt(ids.id1);
                ids.id2 = parseInt(ids.id2);
                break;
            } else {
                console.log(`Did nothing.`);
            }
        }
    }
    const id2Categories = [players[ids.id2]["verified"], players[ids.id2]["unverified"]];
    for (let i = 0; i < id2Categories.length; i++) {
        const str = (i == 0) ? "verified" : "unverified";
        const category = id2Categories[i];
        if (category === undefined) { continue; }
        const games = Object.keys(category); // ["th10", "th12"]
        for (let j = 0; j < games.length; j++) {
            const game = games[j]; // "th10"
            const path = `${BASE_WR_REPLAYS}/json/${str}/${game}.json`;
            const json = fetchJson(path);
            const difficulties = Object.keys(category[game]);
            for (let k = 0; k < difficulties.length; k++) {
                const difficulty = difficulties[k]; // Hard
                const shottypes = category[game][difficulty];
                for (let l = 0; l < shottypes.length; l++) {
                    const shottype = shottypes[l]; // MarisaA
                    console.log(str + game + difficulty + shottype)
                    const jsonCategory = json[difficulty][shottype];
                    // console.log(jsonCategory)
                    for (let m = 0; m < jsonCategory.length; m++) {
                        const entry = jsonCategory[m];
                        if (entry["id"] != ids.id2) { continue; }
                        // console.log(entry)
                        entry["id"] = ids.id1;
                        // console.log(entry)
                    }
                }
            }
            writeJson(path, json);
        }
    }
    delete players[ids.id2];
    writeJson(PATH_PLAYERS_JSON, players);
}

function askForId(existingIds, optionalString) {
    while (true) {
        const id = readline.question(`Please input an ID (${optionalString}):\n > `);
        if (existingIds.includes(id)) {
            return id;
        } else {
            console.warn("\x1b[31m", `ID '${id}' is not a valid ID.`, "\x1b[0m");
        }
    }
}

function copyToNylilsa() {
    makeFile(PATH_NYLILSA_PLAYERS_JSON, fetchJson(PATH_PLAYERS_JSON));
    for (let i = 0; i < ALL_GAMES.length; i++) {
        const game = ALL_GAMES[i];
        makeFile(`${BASE_NYLILSA_GITHUB}/verified/${game}.json`, fetchJson(`${BASE_WR_REPLAYS}/json/verified/${game}.json`));
        makeFile(`${BASE_NYLILSA_GITHUB}/unverified/${game}.json`, fetchJson(`${BASE_WR_REPLAYS}/json/unverified/${game}.json`));
    }
}

function createEmptyJsons(path) {
    for (let i = 0; i < ALL_GAMES.length; i++) {
        const obj = {};
        const game = ALL_GAMES[i];
        const difficulties = Object.keys(GAME_DATA["DifficultyCharacters"][game]);
        if (difficulties.includes("Overdrive")) {
            difficulties.splice(difficulties.indexOf("Overdrive"), 1)
        }
        for (let j = 0; j < difficulties.length; j++) {
            const difficulty = difficulties[j];
            obj[difficulty] = {};
            const shottypes = getShottypes(difficulty, game);
            console.log(game, difficulty, shottypes)
            for (let k = 0; k < shottypes.length; k++) {
                const shottype = shottypes[k];
                obj[difficulty][shottype] = [];
            }
        }
        writeJson(`${path}/${game}.json`, obj);
    }
}

/**
 * Get confirmation from the user with a custom message and optional warning.
 * @param {string} message - The main message to display for the confirmation prompt.
 * @param {string} [warning] - An optional warning message to display before the prompt.
 * @returns {boolean} - Returns true if the user confirms with 'Y', false if 'N'.
 */
function getConfirmation(message, warning = null) {
    if (warning) {
        console.warn("\x1b[31m", warning, "\x1b[0m");
    }
    while (true) {
        const response = readline.question(message + ' [Y/N]\n > ');
        if (response.toLowerCase() === 'y') {
            return true;
        } else if (response.toLowerCase() === 'n') {
            return false;
        } else {
            console.warn("\x1b[33m", "Invalid input! Please enter 'Y' for yes or 'N' for no.", "\x1b[0m");
        }
    }
}

function getNoEntryNames() {
    let counter = 0;
    const playerIds = [];
    const allPlayers = fetchJson(PATH_PLAYERS_JSON);
    const allCategories = getVerifiedAndUnverifiedGames(ALL_GAMES);
    for (const [id, obj] of Object.entries(allPlayers)) {
        if (playerIds.indexOf(id) == -1) {
            playerIds.push(Number(id));
        }
    }

    const coveredIds = [];
    // For every game
    for (const [gameId, gameObj] of Object.entries(allCategories)) {
        const vArrays = ["unverified", "verified"];
        // console.log(gameId);
        // For every status
        for (let i = 0; i < vArrays.length; i++) {
            const vValue = vArrays[i];
            const difficulties = gameObj[vValue];
            // For every difficulty
            for (const [difficulty, shottypes] of Object.entries(difficulties)) {
                // console.log(difficulty)
                // For every shottype
                for (const [shottype, entries] of Object.entries(shottypes)) {
                    // console.log(shottype)
                    // For every entry
                    for (const [entry, data] of Object.entries(entries)) {
                        // For every player
                        if (coveredIds.indexOf(data.id) === -1) {
                            coveredIds.push(data.id);
                        }
                    }
                }
            }
        }
    }
    const difference = playerIds.filter(x => !coveredIds.includes(x));
    console.log(difference)
    console.log(`${difference.length} players do not have a record.`)
}

function getVerifiedAndUnverifiedGames(list) {
    const results = {};
    for (const game of list) {
        try {
            const verifiedData = fetchJson(`${BASE_WR_REPLAYS}/json/verified/${game}.json`);
            const unverifiedData = fetchJson(`${BASE_WR_REPLAYS}/json/unverified/${game}.json`);
            results[game] = {
                verified: verifiedData,
                unverified: unverifiedData
            };
        } catch (error) {
            throw new Error(`Error fetching data for ${game}:`, error);
        }
    }
    return results;
}

function convertId(input) {
    if (Array.isArray(input)) {
        convertIdArray(input);
    } else {
        convertIdEntry(input);
    }
}

function convertIdEntry(entry) {
    if (entry.id !== UNSET_ID) {
        throw new Error(`Entry does not contain ${UNSET_ID} !`);
    }
    const allPlayers = fetchJson(PATH_PLAYERS_JSON);
    mainLoop: while (true) {
        const check = readline.question(`Give an ID to the entry with score ${entry.score}:\n > `);
        if (parseInt(check) >= -1) { // positive integer or -1
            const id = parseInt(check, 10);
            const idExists = allPlayers[id] !== undefined;
            if (idExists) {
                console.log(`ID ${id} already exists with name ${allPlayers[id].name_en}.`)
                if (getConfirmation(`Do you want to assign entry ${entry.score} to player ${allPlayers[id].name_en} ?`)) {
                    entry.id = id;
                    console.log(`Assigned id ${id} to score ${entry.score}`);
                    return;
                } else {
                    console.log(`Did nothing.`)
                    continue mainLoop;
                }
            } else {
                const allPlayersIds = Object.keys(allPlayers).map(Number);
                const newId = findNextId(allPlayersIds);
                console.log(`ID ${id} does not exist.`);
                console.log(`Creating new ID with value ${newId}.`);
                if (getConfirmation(`Do you want create a new ID ${newId} with a new name ?`)) {
                    entry.id = newId;
                    console.log(`Assigned id ${newId} to score ${entry.score}`);
                    const newName = readline.question(`Assign a name to ID ${newId}:\n > `);
                    allPlayers[newId] = { name_en: newName };
                    writeJson(PATH_PLAYERS_JSON, allPlayers);
                    console.log(`Updated file at ${PATH_PLAYERS_JSON}`);
                    return;
                } else {
                    console.log(`Did nothing.`)
                    return;
                }
            }
        } else {
            console.log(`Input ${check} is not a positive integer !`)
        }
    }
}

function convertIdArray(array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].id !== UNSET_ID) { continue; }
        convertIdEntry(array[i]);
        return;
    }
    throw new Error(`Could not find an ID of ${UNSET_ID} in array!`);
}

// function converts the existing format of [score, name, date] to { score: score, name: name, date: date } for both verified and unverified jsons - also adds an ID
function convertJson(enableAllGames) {
    return;
    const gamesList = enableAllGames ? ALL_GAMES.reverse() : [GAME];
    const prompt = `You are about to overwrite the verified/unverified entries of ${gamesList}. Proceed ?`;
    if (getConfirmation(prompt)) {
        gamesList.forEach(game => {
            const pathVerified = `${BASE_NYLILSA_GITHUB}verified/${game}.json`
            const pathUnverified = `${BASE_NYLILSA_GITHUB}/unverified/${game}.json`
            writeNewJson(pathVerified);
            writeNewJson(pathUnverified);
        })
    } else {
        console.log("Aborted function");
    }
}

function findNextId(existingIds) {
    let id = 0;
    while (existingIds.includes(id)) {
        id++;
    }
    return id;
}

function writeNewJson(path) {
    const players = fetchJson(PATH_PLAYERS_JSON);
    const allPlayersIds = Object.keys(players).map(Number);
    const json = fetchJson(path);
    const obj = {};
    for (let i = 0; i < Object.entries(json).length; i++) {
        const [difficulty, diffEntries] = Object.entries(json)[i];
        obj[difficulty] = obj[difficulty] || {};
        for (let j = 0; j < Object.entries(diffEntries).length; j++) {
            const [shot, oldcategoryData] = Object.entries(diffEntries)[j];
            const newCategoryData = convertedData(oldcategoryData, players, allPlayersIds);
            obj[difficulty][shot] = newCategoryData;
        }
    }
    writeJson(path, obj);
    console.log(`Created file at ${path}`);
    writeJson(PATH_PLAYERS_JSON, players);
}

function convertedData(data, players, allPlayersIds) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const obj = {
            id: item.id ?? -1, // Incremental ID starting from 1
            score: item.score ?? item[0],
            name: item.name ?? item[1]?.trim(), // Trim any extra spaces
            date: item.date ?? item[2]
        };
        if (item.video !== undefined) {
            obj.video = item.video; // Conditionally add video if it exists
        }

        const existingPlayer = Object.entries(players).find(([id, player]) => player.name_en === obj.name);
        if (existingPlayer) {
            // Player exists, update the id in the obj
            obj.id = Number(existingPlayer[0]);
        } else {
            // Player doesn't exist, generate a new ID
            const newId = findNextId(allPlayersIds);
            allPlayersIds.push(newId); // Add the new ID to the list of existing IDs !!!

            // Add the new player to the players object
            players[newId] = { name_en: obj.name };

            // Update the id in the obj
            obj.id = newId;
            console.log(`Created new id ${newId} at player ${obj.name}`)
        }

        result.push(obj);
    }
    return result;
}


function writeAllScoresUnverified() {
    const scores = [];
    ALL_GAMES.forEach(game => {
        const json = fetchJson(`${BASE_NYLILSA_GITHUB}/json/wr/unverified/${game}.json`);
        for (let i = 0; i < Object.entries(json).length; i++) {
            const difficulty = Object.entries(json)[i];
            for (let j = 0; j < Object.entries(difficulty[1]).length; j++) {
                const shot = Object.entries(difficulty[1])[j];
                for (let k = 0; k < shot[1].length; k++) {
                    const entry = shot[1][k];
                    const score = entry[0];
                    scores.push(score)
                }
            }
        }
    });
    scores.sort((a, b) => (a - b));
    console.log(scores)
    writeJson("all_unverified.json", scores);
}

function compareData() {
    const arr1 = fetchJson("all_unverified.json")
    const arr2 = fetchJson("asample3.json");
    let i = 0;
    let j = 0;
    const result = [];

    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] === arr2[j]) {
            result.push(arr1[i]);
            i++;
            j++;
        } else if (arr1[i] < arr2[j]) {
            i++;
        } else {
            j++;
        }
    }
    console.log(result)
    return result;
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
                    const rpy = createReplay(pathToFile);
                    const date = rpy.getDate().toISOString();
                    verifiedJson[difficulty][player][k][2] = date;
                    counter++;
                }
            }
        }
    }
    writeJson(PATH_VERIFIED_JSON, verifiedJson);
    console.log(`Successfully changed ${counter} dates at ${PATH_VERIFIED_JSON} !`);
}


function generateMappings() {
    // For every game
    const coveredIds = [];
    const allPlayers = fetchJson(PATH_PLAYERS_JSON);
    const tempClone = structuredClone(allPlayers);
    const allCategories = getVerifiedAndUnverifiedGames(ALL_GAMES);
    for (const [gameId, gameObj] of Object.entries(allCategories)) {
        const vArrays = ["unverified", "verified"];
        // console.log(gameId);
        // For every status
        for (let i = 0; i < vArrays.length; i++) {
            const vValue = vArrays[i];
            const difficulties = gameObj[vValue];
            // For every difficulty
            for (const [difficulty, shottypes] of Object.entries(difficulties)) {
                // console.log(difficulty)
                // For every shottype
                for (const [shottype, entries] of Object.entries(shottypes)) {
                    // console.log(shottype)
                    // For every entry
                    loopEntries: for (const [entry, data] of Object.entries(entries)) {
                        // For every player
                        for (let [playerId, playerObj] of Object.entries(allPlayers)) {
                            // If id of entry matches player id
                            if (data.id == playerId) {
                                const categories = playerObj[`${vValue}`] ||= {};
                                const game = categories[gameId] ||= {};
                                const diff = game[difficulty] ||= [];
                                if (diff.includes(shottype)) {
                                    // If already exists, then look at next entries
                                    continue loopEntries;
                                } else {
                                    // Otherwise push category to player id
                                    diff.push(shottype);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (JSON.stringify(tempClone) !== JSON.stringify(allPlayers)) {
        writeJson(PATH_PLAYERS_JSON, allPlayers);
    }
}

// function checks if all replays in the WR folder are valid. Prints statements if it is not
function checkReplayValidity() {
    for (let h = 0; h < ALL_REPLAY_GAMES.length; h++) {
        const game = ALL_REPLAY_GAMES[h];
        const difficultyList = Object.keys(GAME_DATA["DifficultyCharacters"][game]);
        if (difficultyList.includes("Overdrive")) {
            difficultyList.splice(difficultyList.indexOf("Overdrive"), 1)
        }
        console.log(difficultyList)
        for (let i = 0; i < difficultyList.length; i++) {
            const difficulty = difficultyList[i];
            console.log(difficulty)
            const playerList = getShottypes(difficulty, game);
            console.log(playerList)
            for (let j = 0; j < playerList.length; j++) {
                const player = playerList[j];
                const path = `${BASE_WR_REPLAYS}/${game}/${difficulty}/${player}`;
                const files = fs.readdirSync(path);
                files.forEach((file) => {
                    const pathToFile = `${path}/${file}`;
                    const rpy = createReplay(pathToFile);
                    const bool = rpy.isValid();
                    if (!bool) {
                        console.log(`${pathToFile} is not valid`);
                    }
                })
            }
        }
    }
    console.log("All replay have been checked for their invalidity");
}

// function checks following:
// it merges unverified and verified category together, then it sorts it by score and reduces it by date
// it then takes the difference between this result and the unverified category
// if the difference contains a result it means that
// there's at least one unverified category that technically should not be there
// if so, print every result
// else do nothing
function checkUnverifiedValidity() {
    // change all games to all games
    for (let h = 0; h < ALL_REPLAY_GAMES.length; h++) {
        const game = ALL_REPLAY_GAMES[h];
        const verifiedData = fetchJson(`${BASE_WR_REPLAYS}/json/verified/${game}.json`);
        const unverifiedData = fetchJson(`${BASE_WR_REPLAYS}/json/unverified/${game}.json`);
        const difficultyList = Object.keys(GAME_DATA["DifficultyCharacters"][game]);
        if (difficultyList.includes("Overdrive")) {
            difficultyList.splice(difficultyList.indexOf("Overdrive"), 1)
        }
        for (let i = 0; i < difficultyList.length; i++) {
            const difficulty = difficultyList[i];
            const playerList = getShottypes(difficulty, game);
            for (let j = 0; j < playerList.length; j++) {
                const player = playerList[j];
                const verifiedCategory = verifiedData[difficulty][player];
                const unverifiedCategory = unverifiedData[difficulty][player];
                const category = mergeArray(verifiedCategory, unverifiedCategory);
                sortArrayScore(category); // needed for when two dates are exact same (i.e. pcb) 
                sortArrayDate(category);
                reduceByScore(category);
                const difference = differenceArray(unverifiedCategory, category);
                difference.forEach((element) => {
                    console.log("\x1b[33m", `[${game}]: ${difficulty} ${player} ${element.score} appears in unverified but should not exist`, "\x1b[0m");
                })
            }
        }
        console.log(`Scanning ${game} for false unverified replays has been completed.`);
    }
    console.log("All replay have been checked for their invalidity");
}


function renameReplays() {
    const newFiles = fs.readdirSync(PATH_NEW_REPLAYS);
    for (let j = 0; j < newFiles.length; j++) {
        const file = newFiles[j];
        const pathToFile = `${PATH_NEW_REPLAYS}/${file}`;
        const rpy = createReplay(pathToFile);
        rpy.renameFile();
    }
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
    const falseData = fetchJson(PATH_FALSE_REPLAYS_JSON);
    for (let j = 0; j < newFiles.length; j++) {
        const file = newFiles[j];
        let isUnverifiedEntry = false;
        const pathToFile = `${PATH_NEW_REPLAYS}/${file}`;
        const rpy = createReplay(pathToFile);
        console.log(rpy)
        const difficulty = rpy.getDifficulty();
        const character = rpy.getShot();
        const score = rpy.getScore();
        const date = rpy.getDate();
        const name = rpy.getName();
        const unverifiedCategory = unverifiedData[difficulty][character];
        const verifiedCategory = verifiedData[difficulty][character];
        const falseCategory = falseData[difficulty][character];
        const pathToCopyAt = `${PATH_WR_REPLAYS}/${difficulty}/${character}`;
        const rpyName = `${GAME}_${difficulty}_${character}_${score}.rpy`.toLowerCase();
        const replayAlreadyExistsInFalse = isDuplicateEntry(falseCategory, score);
        const replayAlreadyExistsInVerified = isDuplicateEntry(verifiedCategory, score);
        if (replayAlreadyExistsInFalse[0]) {
            console.log("\x1b[33m", `Replay ${file} category ${character + difficulty} is an invalid replay. Reason: ${replayAlreadyExistsInFalse[1]?.["meta"]?.["invalidReason"]}`, "\x1b[0m");
            continue;
        }
        if (replayAlreadyExistsInVerified[0]) {
            console.log("\x1b[33m", `Replay ${file} category ${character + difficulty} is already verified with ${JSON.stringify(replayAlreadyExistsInVerified[1])}!`, "\x1b[0m");
            continue;
        }
        for (let i = 0; i < unverifiedCategory.length; i++) {
            const unverifiedEntry = unverifiedCategory[i];
            if (score == unverifiedEntry.score) { // replay matches unverified entry
                replayMatchesUnverifiedEntry(i, pathToFile, `${pathToCopyAt}/${rpyName}`, unverifiedData, difficulty, character, file, date, unverifiedEntry);
                isUnverifiedEntry = true;
                break;
            }
        }
        if (GAME == "th07") {
            continue;
        }
        const newEntryObject = {
            "id": UNSET_ID,
            "score": score,
            "date": date.toISOString()
        }
        if (!isUnverifiedEntry) {
            const category = verifiedData[difficulty][character];
            const tempCopy = structuredClone(category);
            category.push(newEntryObject);
            sortArrayDate(category);
            reduceByScore(category);
            const bool = doesEntryExistInArray(category, newEntryObject);
            const removedReplays = differenceArray(tempCopy, category)
            // there is a flaw with this
            // intended logic: newEntryObject is merged with category then its sorted by date
            // the array gets reduced if the next score is less than the current score
            // the code is supposed to check if the newEntryObject is actually valid,
            // and code removes entry if entry is not valid
            // if this happens 0 times then code in if statement below is run
            // issue: supposed newEntryObject is valid, then statement above can still be run
            // this is because removing existing entries also increments counter
            // solution: array is reduced by score, then after reduction check if newEntryObject still exists
            // if it doesn't exist, it's removed so invalid
            // if it does exist it is a new entry and is valid
            // two cases:
            // 1. no replays are removed (e.g. missing entry or new WR)
            // 2. replays are removed (the replays we thought were WR were actually not WR)
            // Case 1: merge entry with array and update json and add rpy to folder
            // Case 2: merge entry with array and update json and add rpy to folder
            // and also remove n entries from json, and ask to move all non-WR replays to a separate folder 
            if (bool) {
                const prompt = `${file} seems to be a new entry. Approve of entry ${JSON.stringify(newEntryObject)} ?`;
                if (getConfirmation(prompt)) {
                    console.log("\x1b[32m", `Approved entry ${JSON.stringify(newEntryObject)}`);
                    console.log("\x1b[0m");
                    fs.copyFileSync(pathToFile, `${pathToCopyAt}/${rpyName}`);
                    console.log(`Copied file at ${pathToFile} to ${pathToCopyAt}/${rpyName}`);
                    fs.unlinkSync(pathToFile);
                    console.log(`Deleted file at ${pathToFile}`);
                    convertId(category);
                    writeJson(PATH_VERIFIED_JSON, JSON.stringify(verifiedData));
                    if (removedReplays.length > 0) { // if exists
                        createDirIfNotExist(PATH_REMOVED_REPLAYS);
                        console.log(`The following outdated replays have been moved to the folder ${PATH_REMOVED_REPLAYS}`);
                        removedReplays.forEach((replay) => {
                            const replayName = `${GAME}_${difficulty}_${character}_${replay.score}.rpy`.toLowerCase();
                            fs.renameSync(`${pathToCopyAt}/${replayName}`, `${PATH_REMOVED_REPLAYS}/${replayName}`);
                            console.log(`Moved ${pathToCopyAt}/${replayName} to ${PATH_REMOVED_REPLAYS}/${replayName}`);
                        })
                    }
                } else {
                    console.log("\x1b[31m", `Denied entry ${JSON.stringify(newEntryObject)}`);
                    fs.unlinkSync(pathToFile);
                    console.log(`Deleted file at ${pathToFile}`);
                    console.log("\x1b[0m");
                }
            }
        } else {
            console.log("\x1b[31m", `File ${file} category ${character + difficulty} with ${JSON.stringify(newEntryObject)} is not a missing/new WR entry nor is it unverified. Please remove this from the folder.`, "\x1b[0m");
        }
    }
}

// todo: implement binary search
function doesEntryExistInArray(array, entry) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].score == entry.score) { // score match
            return true;
        }
    }
    return false;
}

function isDuplicateEntry(array, score) {
    for (let i = 0; i < array.length; i++) {
        const entryScore = array[i].score;
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
    if (GAME != "th07") { // cannot do this in pcb because of date
        unverifiedData[difficulty][character][i].date = date.toISOString();
    }
    // adds entry to verified json;
    const verifiedJson = fetchJson(PATH_VERIFIED_JSON);
    verifiedJson[difficulty][character].push(unverifiedData[difficulty][character][i]);
    sortArrayScore(verifiedJson[difficulty][character]);
    writeJson(PATH_VERIFIED_JSON, verifiedJson);
    // removes entry from unverified json
    console.log(`Removed entry ${JSON.stringify(unverifiedData[difficulty][character][i])} from unverified records`);
    unverifiedData[difficulty][character].splice(i, 1);
    writeJson(PATH_UNVERIFIED_JSON, unverifiedData);
}

function replayMatchesUnverifiedEntry(i, pathToFile, destination, unverifiedData, difficulty, character, file, date, unverifiedEntry) {
    console.log(`Found a match between replay \x1b[33m${file}\x1b[0m and unverified entry ${JSON.stringify(unverifiedEntry)}`)
    const prompt = `Approve of entry ${JSON.stringify(unverifiedEntry)} ?`;
    if (getConfirmation(prompt)) {
        console.log("\x1b[32m", `Approved entry ${unverifiedEntry}`);
        console.log("\x1b[0m");
        approveNewEntry(i, pathToFile, destination, unverifiedData, difficulty, character, date);
    } else {
        console.log("\x1b[31m", `Denied entry ${unverifiedEntry}`);
        fs.unlinkSync(pathToFile);
        console.log(`Deleted file at ${pathToFile}`);
        console.log("\x1b[0m");
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
                const rpy = createReplay(replayPath);
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
            let invalidReplays = [];
            outerLoop: while (true) {
                console.log(invalidReplays)
                // remove all replays that are in invalidReplays from verified
                verified = mergeArray(jsonVerified, arr); // needs to be added - condition is CRITICAL for when a replay is deemed invalid
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
                                continue outerLoop;
                            } else if (check.toLowerCase() === "reset") {
                                console.log("\x1b[31m", `Resetting...`);
                                console.log("\x1b[0m");
                                invalidReplays = [];
                                continue outerLoop;
                            } else {
                                console.warn("\x1b[33m", "Invalid input! Please enter 'Y' for yes or 'N' for no or 'reset' to reset");
                            }
                        }
                    }
                }
                break;
            }
            //the above: loop through every entry in verified, and manually approve/disapprove of new replays. If replay R is disapproved, remove R from verified, add R to invalidReplays, and loop 

            // We merge the category at verified category with unverified json and we then reduce it.
            //We then look at the **if any unverified entries have been removed**, and we are **NOT** looking at the verified entries.
            //The unverified entries that were reduced are then removed from the object with the unverified entries (because those entries are not considered to be WR anymore).
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
        const prompt = `Approve of entry ${entry} ?`;
        if (getConfirmation(prompt)) {
            console.log("\x1b[32m", `Approved entry ${entry}`);
            console.log("\x1b[0m");
        } else {
            console.log("\x1b[31m", `Denied entry ${entry}`);
            console.log("\x1b[0m");
            arr.splice(i, 1);
            i--;
        }
    }
}

function writeJsonToFolder(verifiedJson, unverifiedJson, production = false) {
    if (production) {
        writeJson(PATH_UNVERIFIED_JSON, unverifiedJson);
        console.log("\x1b[32m", `Successfully created file ${PATH_UNVERIFIED_JSON}`);
        writeJson(PATH_VERIFIED_JSON, verifiedJson);
        console.log("\x1b[32m", `Successfully created file ${PATH_VERIFIED_JSON}`);
    } else {
        writeJson(`unverified-test-${GAME}.json`, unverifiedJson);
        writeJson(`verified-test-${GAME}.json`, verifiedJson);
    }
}

function copyReplaysToPath() {
    const files = fs.readdirSync(PATH_GAME_REPLAYS);
    let counter = 0;
    createDifficultyPlayerDir(PATH_GAME_REPLAYS)
    files.forEach(function (file) {
        if (Replay.isReplay(file)) {
            const rpy = createReplay(`${PATH_GAME_REPLAYS}/${file}`);
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
                const score = categoryData[k].score;
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
            categoryFiles.forEach(element => {
                const warning = `${pathToFiles}/${element} exists but is not an entry in the JSON!`
                const prompt = `Do you want to remove it?`
                if (getConfirmation(prompt, warning)) {
                    createDirIfNotExist(PATH_REMOVED_REPLAYS);
                    fs.renameSync(`${pathToFiles}/${element}`, `${PATH_REMOVED_REPLAYS}/${element}`);
                    console.log(`Moved ${pathToFiles}/${element} to ${PATH_REMOVED_REPLAYS}/${element}`);
                } else {
                    console.log("\x1b[37m", `Did nothing`);
                }
            }
            )

        }
    }

}

function mergeArray(arr1, arr2) {
    return [...arr1, ...arr2];
}

function sortArrayDate(arr) {
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function sortArrayScore(arr) {
    arr.sort((a, b) => a.score - b.score);
}

function reduceByScore(arr) {
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
    return arr1.filter(tempArr1 => arr2.some(tempArr2 => tempArr1.score === tempArr2.score));
}
function differenceArray(arr1, arr2) {
    return arr1.filter(tempArr1 => !arr2.some(tempArr2 => tempArr1.score === tempArr2.score));
}

function createReplay(replayPath) {
    const settings = {
        path: replayPath,
        dirRenameOutput: `new-replays/${GAME}/`,
    };
    return new Replay(settings)
}
