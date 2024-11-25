"use strict";

const MyTest = require('./MyTest.js');
const Entry = require('../Entry.js');
const Helper = require('../Helper.js');

function testEntries() {
    let entry;
    
    // Normal entry
    entry = { "id": 12, "score": 1234567890, "date": "2021-03-06T10:40:30.000Z" };
    MyTest.assertEquals(Entry.validateEntry(entry), true);
    
    // Entry is array instead of object
    entry = [12, 1234567890, "2021-03-06T10:40:30.000Z"];
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_NOT_OBJECT(entry));
    
    // Entry with more than default keys
    entry = { "id": 0, "score": 5, "date": "2021-03-06", "citation": [] };
    MyTest.assertEquals(Entry.validateEntry(entry), true);
    
    // Key "date" is misspelled as "datee"
    entry = { "id": 12, "score": 1234567890, "datee": "2021-03-06T10:40:30.000Z" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_MISSING_KEYS("date"));
    
    // Keys have null or undefined
    entry = { "id": 26, "score": null, "date": undefined };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_INVALID_KEY_VALUE("score", null));
    
    // Keys "id" is negative
    entry = { "id": -2, "score": 10, "date": "2021-03-06" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_ID_IS_NEGATIVE(entry.id));
    
    // Keys "id" is not an integer
    entry = { "id": 2.5, "score": 10, "date": "2021-03-06" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_ID_NOT_INTEGER(entry.id));
    
    // Keys "score" is negative
    entry = { "id": 1, "score": -10, "date": "2021-03-06" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_SCORE_IS_NEGATIVE(entry.score));
    
    // Keys "score" is non-integer
    entry = { "id": 1, "score": 10.25, "date": "2021-03-06" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_SCORE_NOT_INTEGER(entry.score));
    
    // key "score" is non-divisible by 5
    entry = { "id": 16, "score": 240240249, "date": "1990-03-06" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_SCORE_NOT_DIVISIBLE_BY_FIVE(entry.score));
    
    // Key "date" is not written with "-" as separators
    entry = { "id": 10, "score": 100, "date": "2021/03/06" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_DATE_FORMAT_INVALID(entry.date));
    
    // Key "date" follows dd-mm-yyyy format
    entry = { "id": 10, "score": 100, "date": "18-02-2022T08:34:12.000Z" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_DATE_VALUE_INVALID(entry.date));
    
    // Key "date" follows yyyy-dd-mm format instead
    entry = { "id": 10, "score": 100, "date": "2022-18-02T08:34:12.000Z" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_DATE_VALUE_INVALID(entry.date));
    
    // Key "date" does not follow yyyy-mm-dd format: missing leading zero
    entry = { "id": 10, "score": 100, "date": "2022-2-18T08:34:12.000Z" };
    MyTest.assertThrows(() => Entry.validateEntry(entry), Entry.ERR_DATE_VALUE_INVALID(entry.date));
}

function testCategories() {
    let category;

    // Valid category
    category = [
        { "id": 162, "score": 451050800, "date": "2011-08-20T06:17:55.000Z" },
        { "id": 162, "score": 475170130, "date": "2011-08-27T07:08:19.000Z" },
    ]
    MyTest.assertEquals(Entry.validateCategory(category), true);

    // An entry is invalid ("date" is misspelled as "datee")
    category = [
        { "id": 162, "score": 451050800, "date": "2011-08-20T06:17:55.000Z" },
        { "id": 162, "score": 475170130, "datee": "2011-08-27T07:08:19.000Z" },
    ]
    MyTest.assertThrows(() => Entry.validateCategory(category), Entry.ERR_MISSING_KEYS("date"));
    
    // An entry is invalid (An "id" is negative)
    category = [
        { "id": 162, "score": 451050800, "date": "2011-08-20T06:17:55.000Z" },
        { "id": -2, "score": 475170130, "date": "2011-08-27T07:08:19.000Z" },
    ]
    MyTest.assertThrows(() => Entry.validateCategory(category), Entry.ERR_ID_IS_NEGATIVE(-2));

    // This is an entry, not a category.
    category = { "id": 162, "score": 451050800, "date": "2011-08-20T06:17:55.000Z" }
    MyTest.assertThrows(() => Entry.validateCategory(category), Entry.ERR_NOT_ENTRY(category));
}

function testSortDate() {
    let c1, c2;
    // c1 = [
    //     { "id": 162, "score": 451050800, "date": "2011-08-20T06:17:55.000Z" },
    //     { "id": 427, "score": 451811910, "date": "2011-08-22T01:21:35.000Z" },
    //     { "id": 162, "score": 475170130, "date": "2011-08-27T07:08:19.000Z" },
    //     { "id": 162, "score": 486213610, "date": "2011-08-28T00:56:50.000Z" },
    //     { "id": 162, "score": 515940470, "date": "2011-09-04T02:36:22.000Z" },
    //     { "id": 428, "score": 537619110, "date": "2012-01-13T23:15:32.000Z" },
    //     { "id": 162, "score": 540522180, "date": "2012-01-20T06:33:15.000Z" },
    //     { "id": 162, "score": 558060980, "date": "2012-04-17T12:46:28.000Z" },
    //     { "id": 406, "score": 558906970, "date": "2012-10-22T05:43:27.000Z" },
    //     { "id": 429, "score": 566200720, "date": "2013-09-01T07:50:31.000Z" },
    //     { "id": 12, "score": 567754510, "date": "2021-03-22T13:45:17.000Z" },
    //     { "id": 347, "score": 577024970, "date": "2021-04-15T15:21:02.000Z" },
    //     { "id": 347, "score": 579189210, "date": "2021-07-21T20:47:02.000Z" },
    //     { "id": 29, "score": 583256930, "date": "2022-11-01T08:11:39.000Z" },
    // ]
    c1 = [
        { "id": 162, "score": 451050800, "date": "2011-08-20T06:17:55.000Z" },
        { "id": 406, "score": 558906970, "date": "2012-10-22T05:43:27.000Z" },
        { "id": 347, "score": 579189210, "date": "2021-07-21T20:47:02.000Z" },
        { "id": 29, "score": 583256930, "date": "2022-11-01T08:11:39.000Z" },
    ]
    c2 = [
        { "id": 406, "score": 558906970, "date": "2012-10-22T05:43:27.000Z" },
        { "id": 29, "score": 583256930, "date": "2022-11-01T08:11:39.000Z" },
        { "id": 162, "score": 451050800, "date": "2011-08-20T06:17:55.000Z" },
        { "id": 347, "score": 579189210, "date": "2021-07-21T20:47:02.000Z" },
    ]
    Entry.sortCategoryScore(c2);
    MyTest.assertEquals(Helper.deepEqual(c1, c2), true);
}

function runAllTests() {
    const testFunctions = [testEntries, testCategories, testSortDate];
    for (let i = 0; i < testFunctions.length; i++) {
        const testFunction = testFunctions[i];
        console.log(`${i + 1}. Testing function ${testFunction.name}.`)
        testFunction();
    }
}

runAllTests();
