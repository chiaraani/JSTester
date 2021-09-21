/// TESTER ///

class Test {
	static config = {
		logSuccessful: true, 
		alertFailure: true, 
		errorGroupCollapsed: true
	};

	static executions = [];

	constructor(description, code) {
		this.description = description;
		this.execution = this.getExecution(code);

		this.execution
		  .then( () => this.successMessage() )
			.catch( error => this.failureMessage(error) ); 

		Test.executions.push(this.execution); 
	}

	getExecution(code) {
		if (code.constructor.name == "AsyncFunction") {
		  return code(this.assert);
	  } else {
	    return (async () => code(this.assert))();
	  }
	}

	assert(...args) { new TestAssert(...args) }

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

	static summary(results) {
		const testCount = results.length;

		const passedCount = 
			results
			.filter( result => result.status == "fulfilled" )
			.length;

		const failedCount = testCount - passedCount;
		const allPassed = failedCount == 0;

		const background = allPassed ? 'green' : (passedCount > 0 ? 'blue' : 'red');
		const style = `color: white; background: ${background}; display: block;`;

		const message = `%c ${passedCount} PASSED & ${failedCount} FAILED (tests summary)`;

		console.info(message, style);
		console.groupEnd();

		if (failedCount && Test.config.alertFailure) {
			alert("FAILED! Some tests have failed. Check console for more info.");
		}
	}

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