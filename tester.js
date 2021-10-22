'use strict';
/// TESTER ///

class Test {
	static config = {
		logSuccessful: true,
		alertFailure: true,
		errorGroupCollapsed: true
	}

	static executions = []

	constructor (description, code) {
		this.description = description
		this.execution = this.getExecution(code)

		this.execution
			.then( () => this.successMessage() )
			.catch( error => this.failureMessage(error) )

		Test.executions.push(this.execution)
	}

	getExecution (code) {
		if (code.constructor.name === 'AsyncFunction') {
			return code(testAssert)
		} else {
			return (async () => code(testAssert))()
		}
	}

	successMessage () {
		if (Test.config.logSuccessful) {
			const message = `%c Success! Test: ${this.description} `
			const style = 'color: green; background: #dfd;'
			console.info(message, style)
		} 
	}

	failureMessage (error) {
		const message = `%c FAILED! Test: "${this.description}" due to "${error.name}"`
		const style = 'color: red; background: #fdd; font-weight: bold;'

		if (Test.config.errorGroupCollapsed) console.groupCollapsed(message, style)
		else console.group(message, style)

		if (error.name === 'TestAssertionError') console.log(...error.messageArray)
		console.error(error)
		console.groupEnd()
	}

	static case(createTests) {
		console.group('Tester')
		createTests()
		Promise.allSettled(this.executions).then(this.summary)
	}

	static summary (tests) {
		const passedTests =	tests.filter( test => test.status === 'fulfilled' )
		const allTestsPassed = passedTests.length === tests.length
		const failedTestsLength = tests.length - passedTests.length

		let background;
		if (allTestsPassed) background = 'green'
 		else if	(passedTests.length > 0) background = 'blue'
		else background = 'red'

		const style = `color: white; background: ${background}; display: block;`
		const message = 
			`%c ${passedTests.length} PASSED & ${failedTestsLength} FAILED (tests summary)`

		console.info(message, style)
		console.groupEnd()

		if (!allTestsPassed && Test.config.alertFailure) {
			alert('FAILED! Some tests have failed. Check console for more info.')
		}
	}
}

function testAssert(arg0, kind = "truthy", ...args) {
	// Arg abbreviation for argument.
	args.unshift(arg0)

	const asserter =	{
		// Basic assert kinds //
		truthy () { Boolean(args[0]) || fail(args[0], 'is NOT truthy') },
		['!'] () { !args[0] || fail(args[0], 'is NOT falsy') },

		// Equality assert kinds //
		['=='] () { args[0] == args[1]|| fail(args[0], 'does NOT equal', args[1]) },
		['!='] () { args[0] != args[1] || fail(args[0], 'DOES equal', args[1]) },
		['==='] () { args[0] === args[1] || fail(args[0], 'is NOT equal to', args[1]) },
		['!=='] () { args[0] !== args[1] || fail(args[0], 'DOES be equal to', args[1]) },

		// Array or String assert kinds //
		includes () { 
			args[0].includes(args[1]) || fail(args[0], 'does NOT include', args[1])
		},
		excludes () { 
			!args[0].includes(args[1]) || fail(args[0], 'does NOT exclude', args[1])
		},

		// String assert kinds //
		startsWith () { 
			args[0].startsWith(args[1]) || fail(args[0], 'does NOT start with', args[1])
		},
		endsWith () {
			args[0].endsWith(args[1]) || fail(args[0], 'does NOT end with', args[1])
		}
	}

	asserter[kind]()
	
	function fail(...messageArray) {
		let error =	new TestAssertionError( messageArrayToString(messageArray) )
		error.messageArray = messageArray
		throw error
	}

	function messageArrayToString(messageArray) {
		const stringifiedItems = messageArray.map(item => JSON.stringify(item))
		return stringifiedItems.join(' ')
	}
}

class TestAssertionError extends Error	{ name = 'TestAssertionError' }

