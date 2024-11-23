const MyTest = require('./MyTest');

// Define test groups
function testArrayLength() {
    MyTest.assertEquals([1, 2, 3].length, 3, "Array length should be 3");
    MyTest.assertEquals([].length, 1, "Empty array length should be 0"); // Intentional fail
}

function testAddition() {
    MyTest.assertEquals(1 + 1, 2, "Simple addition should work");
    MyTest.assertEquals(5 + 5, 10, "5 + 5 should equal 10");
    MyTest.assertEquals(1 + 2, 4, "1 + 2 should equal 3"); // Intentional fail
}

function testThrows() {
    MyTest.assertThrows(() => {
        throw new Error("Test error");
    }, "Function should throw an error");
    MyTest.assertThrows(() => {
        // This doesn't throw
    }, "Function should throw an error but didn't"); // Intentional fail
}

// Run all tests and generate a report
function runAllTests() {
    const testFunctions = [testArrayLength, testAddition, testThrows];
    const failedFunctions = [];

    MyTest.reset();

    testFunctions.forEach((testFunction) => {
        MyTest.reset(); // Reset counters for each test group
        testFunction();

        if (MyTest.failed > 0) {
            failedFunctions.push({
                functionName: testFunction.name,
                failures: [...MyTest.failures],
            });
        }
    });

    console.log("\n===== Test Summary =====");
    if (failedFunctions.length > 0) {
        console.log("\nFailed Test Functions:");
        failedFunctions.forEach(({ functionName, failures }) => {
            console.log(`- ${functionName}`);
            failures.forEach((fail, index) => {
                console.log(`  ${index + 1}. ${fail.message}`);
                console.log(`     Reason: ${fail.error}`);
            });
        });
    } else {
        console.log("All test functions passed!");
    }

    console.log("\n===== Overall Results =====");
    MyTest.report();
}

// Execute tests
runAllTests();
