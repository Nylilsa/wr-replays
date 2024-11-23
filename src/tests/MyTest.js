class MyTest {
    static passed = 0;
    static failed = 0;
    static failures = [];

    static assertEquals(actual, expected, message = "") {
        try {
            if (actual === expected) {
                this.passed++;
            } else {
                throw new Error(`Expected ${expected}, but got ${actual}`);
            }
        } catch (error) {
            this.failed++;
            this.failures.push({ message, error: error.message });
        }
    }

    static assertThrows(fn, message = "") {
        try {
            fn();
            throw new Error("Expected function to throw an error, but it didn't");
        } catch (error) {
            // If an error was thrown, it passed
            if (error.message === "Expected function to throw an error, but it didn't") {
                this.failed++;
                this.failures.push({ message, error: error.message });
            } else {
                this.passed++;
            }
        }
    }

    static reset() {
        this.passed = 0;
        this.failed = 0;
        this.failures = [];
    }

    static report() {
        console.log(`\nTests Passed: ${this.passed}`);
        console.log(`Tests Failed: ${this.failed}`);
        if (this.failed > 0) {
            console.log("\nFailed Tests:");
            this.failures.forEach((fail, index) => {
                console.log(`${index + 1}. ${fail.message}`);
                console.log(`   Reason: ${fail.error}`);
            });
        } else {
            console.log("All tests passed!");
        }
    }
}

module.exports = MyTest;
