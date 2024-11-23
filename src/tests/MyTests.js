class MyTest {
    static assertEquals(actual, expected) {
        if (actual === expected) {
            console.log(`✅ Test passed: ${actual} === ${expected}`);
            return true;
        } else {
            console.error(`❌ Test failed: Expected ${expected}, but got ${actual}`);
            return false;
        }
    }

    static assertThrows(func, expectedError) {
        try {
            func(); // Run the function
            console.error(`❌ Test failed: Expected an error, but none was thrown.`);
            return false;
        } catch (error) {
            if (error.message === expectedError) {
                console.log(`✅ Test passed: Caught expected error "${error.message}"`);
                return true;
            } else {
                console.error(
                    `❌ Test failed: Expected error "${expectedError}", but got "${error.message}"`
                );
                return false;
            }
        }
    }
}

module.exports = MyTest;
