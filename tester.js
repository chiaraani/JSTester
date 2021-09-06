/// TESTER ///

class Test {
	static executions = []; // Test execution promises.
	
	constructor(description, code) {
		this.description = description;
		this.execution = this.execute(code);

		this.execution.then(() => this.successMessage(), error => this.failureMessage(error)); // Logging test's result.

		Test.executions.push(this.execution); // It adds its execution (promise) to an array of Test Class of all executions.
	}

	execute(code) { return code.constructor.name == "AsyncFunction" ? code(this.assert) : (async () => code(this.assert))() } // It executes code asyncronously.

	assert(assertion) {	if(!assertion) throw "Test assertion is false"; } // This function is passed to test code as an argument.

	successMessage() { console.info(`%c Success! Test: ${this.description}`, 'color: green; background: #dfd;') }
	failureMessage(error) { console.error(`FAILED! Test: "${this.description}" due to "${error}"`) }

	static summary(results) { // It logs a summary of results
		const testCount = results.length; // Result count is the same as test count.
		const passed = results.filter(result => result.status == "fulfilled").length; // Number of successful tests.
		const failed = testCount - passed;
		const allPassed = !failed;

		const color = allPassed ? 'green' : (passed ? 'blue' : 'red'); // Background color depends on the number of passed tests.
		const style = `color: white; background: ${color}; display: block;`;

		const message = `%c ${passed} PASSED & ${failed} FAILED (tests summary)`;
		console.info(message, style);
		console.groupEnd();
	}

	static case(tests) { // It creates given tests and logs a summary about their results.
		console.group("Tester");
		tests();
		Promise.allSettled(this.executions).then(this.summary);
	}
}