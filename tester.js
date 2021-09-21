/// TESTER ///

class Test {
	static config = {
		logSuccessful: true, 
		alertFailure: true, 
		errorGroupCollapsed: true
	};

	static executions = []; // Test execution promises.

	constructor(description, code) {
		this.description = description;
		this.execution = this.execute(code);

		// Logging test's result:
		this.execution
		  .then( () => this.successMessage() )
			.catch( error => this.failureMessage(error) ); 

		// It adds its execution (promise) to an array of Test Class of all executions.
		Test.executions.push(this.execution); 
	}

	// This function is passed to test code as an argument.
	assert(...args) { new TestAssert(...args) }

	execute(code) { // It executes code asyncronously.
		if (code.constructor.name == "AsyncFunction") {
		  return code(this.assert);
	  } else {
	    return (async () => code(this.assert))();
	  }
	}

	successMessage() {
	  if (Test.config.logSuccessful) {
	  	const message = `%c Success! Test: ${this.description} `;
	  	const style = 'color: green; background: #dfd;';
	  	console.info(message, style);
	  } 
	}

	failureMessage(error) {
		const message = `%c FAILED! Test: "${this.description}" due to "${error.name}"`;
		const style = 'color: red; background: #fdd; font-weight: bold;';

		if (Test.config.errorGroupCollapsed) console.groupCollapsed(message, style);
	  else console.group(message, style);

	  if (error.name == "TestAssertionError") console.log(...error.messageArray);
		console.error(error);
		console.groupEnd();
	}

	static summary(results) { // It logs a summary of results
		const testCount = results.length; // Result count is the same as test count.

		// Number of successful tests:
		const passed = results.filter( result => result.status == "fulfilled" ).length;

		const failed = testCount - passed;
		const allPassed = !failed;

		// Background color depends on the number of passed tests.
		const color = allPassed ? 'green' : (passed ? 'blue' : 'red');
		const style = `color: white; background: ${color}; display: block;`;

		const message = `%c ${passed} PASSED & ${failed} FAILED (tests summary)`;
		console.info(message, style);
		console.groupEnd();

		if (failed && Test.config.alertFailure) {
			alert("FAILED! Some tests have failed. Check console for more info.");
		}
	}

	// It creates given tests and logs a summary about their results.
	static case(createTests) { 
		console.group("Tester");
		createTests();
		Promise.allSettled(this.executions).then(this.summary);
	}
}

class TestAssert {
	// Arg abbreviation for argument.
	constructor(arg0, assertKind = "truthy", ...args) {
		args.unshift(arg0);

		this[assertKind](...args);
	}

	error(...message) { throw new TestAssertionError(message) }

	// Basic assert kinds //
	truthy(arg) { Boolean(arg) || this.error(arg, "is NOT truthy") }
	["!"](arg) { !arg || this.error(arg, "is NOT falsy") }

	// Equality assert kinds //
	["=="](arg0, arg1) { arg0 == arg1 || this.error(arg0, "does NOT equal", arg1) }
	["!="](arg0, arg1) { arg0 != arg1 || this.error(arg0, "DOES equal", arg1) }
	["==="](arg0, arg1) { arg0 === arg1 || this.error(arg0, "is NOT equal to", arg1) }
	["!=="](arg0, arg1) { arg0 !== arg1 || this.error(arg0, "DOES be equal to", arg1) }

	// Array or String assert kinds //
	["includes"](arg0, arg1) { 
		arg0.includes(arg1) || this.error(arg0, "does NOT include", arg1);
	}
	["excludes"](arg0, arg1) { 
		!arg0.includes(arg1) || this.error(arg0, "does NOT exclude", arg1);
	}

	// String assert kinds //
	["startsWith"](arg0, arg1) { 
		arg0.startsWith(arg1) || this.error(arg0, "does NOT start with", arg1);
	}
	["endsWith"](arg0, arg1) {
		arg0.endsWith(arg1) || this.error(arg0, "does NOT end with", arg1);
	}
}

class TestAssertionError extends Error  {	
	name = "TestAssertionError"

	constructor(messageArray) {
		function formatMessage() {
			const stringifiedItems = messageArray.map(item => JSON.stringify(item));
			return stringifiedItems.join(" ");
		}

		super( formatMessage() );
		this.messageArray = messageArray;
	}
}