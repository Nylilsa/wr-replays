"use strict";
const fs = require('fs');
const { wrap } = require('module');

const ALL_GAMES = ["th01", "th02", "th03", "th04", "th05"];
const GAME = "th01";
const PATH_PLAYERS_JSON = `D:/GitHub/nylilsa.github.io/json/players.json`;
const PATH_WRPROGRESSION_JSON = `D:/GitHub/nylilsa.github.io/json/wrprogression.json`;
const PATH_DATA_JSON = `D:/GitHub/nylilsa.github.io/json/gameinfo-new.json`;
const PATH_VERIFIED_JSON = `D:/GitHub/nylilsa.github.io/json/wr/verified/${GAME}.json`;
const PATH_UNVERIFIED_JSON = `D:/GitHub/nylilsa.github.io/json/wr/unverified/${GAME}.json`;

// to do: convert pc90 to new base
// note to self: do not do this manually
// write a script that reads wrprogression.json and convert it to this format
// create a new attribute called "name" that includes their names
// create attribute "id" that is set to -4
// by default write to /verified/ path
// create files for /unverified/ path that contain no data but still difficulties/players etc
// we then MANUALLY create new attribute called "sources"
// "sources" takes in array as parameter with link(s) to sources
// sources[0] is what is shown on page, others are mirrors
// after that work on pofv pls

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
    for (let i = 0; i < ALL_GAMES.length; i++) {
        const game = ALL_GAMES[i];
        convertJson(game);
    }
}

function convertJson(game = GAME) {
    const verified = {};
    const unverified = {};
    const wr = fetchJson(PATH_WRPROGRESSION_JSON)[game];
    const difficulties = Object.keys(wr);
    const shottypes = Object.keys(wr[difficulties[0]])
    for (let i = 0; i < difficulties.length; i++) {
        const difficulty = difficulties[i];
        verified[difficulty] = {}
        unverified[difficulty] = {}
        for (let j = 0; j < shottypes.length; j++) {
            const shottype = shottypes[j];
            verified[difficulty][shottype] = [];
            unverified[difficulty][shottype] = [];
            const category = wr[difficulty][shottype];
            // console.log(difficulty + shottype)
            for (let k = 0; k < category.length; k++) {
                const entry = category[k];
                const tempObj = {
                    id: -4,
                    score: entry[0],
                    date: entry[2],
                    name: entry[1],
                    sources: [],
                }
                verified[difficulty][shottype][k] = tempObj;

            }
        }
    }
    fs.writeFileSync(`src/${game}-verified.json`, JSON.stringify(verified))
    console.log(`Created file at src/${game}-verified.json`);
    fs.writeFileSync(`src/${game}-unverified.json`, JSON.stringify(unverified))
    console.log(`Created file at src/${game}-unverified.json`);
}

init();