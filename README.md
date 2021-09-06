# JavaScript Tester README
## Description
This is a tiny test framework for JS. What is special about it? Its low weight! It is barely 41 lines of code, and weighs 2KiB. Well, I actually took it as an exercise. I made it because I didn't want to waste time installing node for extremely simple JS exercises, tiring! So the name "framework" is too big for it. ;D

## Usage
### Case
First of all we must create the test case:

```JS
Test.case(() => {
	// Tests here
});

```

### Tests
Then, write each separate test.

```JS
Test.case((test) => {
	new Test("My variable equals 10", (assert) => {
		let variable = 10;
		assert(variable == 10);
	});

  new Test("description", (assert) => { /* Another test */ })
});

```
Console
```
> Success! Test: My variable equals 10
> Success! Test: description
> 2 PASSED & 0 FAILED (tests summary)
```
Great!

#### Failures

A test can fail for two reasons:
1. At least one assertion is not true.
  ```
  > FAILED! Test: "My test name" due to "Test assertion is false"
  
  ```
2. An error is thrown.
  ```
  > FAILED! Test: "My test name" due to "ReferenceError: something is not defined"
  
  ```

## Classes
### Test class
This is Tester class.

#### Static variables
##### Test.executions
Where test promises, which are named executions, are stored in Test class.

#### Functions
##### Test.constructor(description = string, code = function)
It creates each test and executes given code by calling `execute(code)`, which makes it asynchromous. Then it stores returned promise in execution property, it gives execution promise `successMessage` as onFulfillment and `failureMessage` as onRejection. Finally, it pushes execution promise to Test class executions array (`Test.executions`).
Arguments:
* **Description:** must be a string which describes test.
* **Code:** must be a function, whether async or not, which is immediately executed as code of test.

##### Test.execute(code = function)
It executes given code asynchronously. Even if the function is not async, it makes it async. Therefore, it returns a promise.
Arguments: 
* **Code:** must be a function, whether async or not, which is immediately executed as code of test.

##### Test.assert(assertion = boolean)
It throws an error if assertion is false.
Arguments: 
* **Assertion:** must be boolean. If all assertions are true, test is successsful, otherwise test fails.

##### Test.successMessage()
It logs `Success! Test: My test's description` to the console with green appearance.

##### Test.failureMessage(error = error)
It logs given error this way: `FAILED! Test: "My test's description" due to "an error"`
Arguments:
* **Error:** must be an error which is logged to the console.

#### Static functions
##### Test.summary(results = array [object {status: string}])
It logs a summary of test execution results this way: `No. PASSED No. FAILED (tests summary)`. 
If all tests are successful, then message's colour is green. If all tests failed, then message's colour is red. If some tests succeeded and others failed, then message's colour is blue.

Arguments:
* **Results:** must be an array of objects, each object must have status property, which must be string either "fufilled" or "rejected". If test is successful, the status of the object, which belongs to test, must be "fulfilled", otherwise test would be counted as failed.

##### Test.case(tests = function)
Firstly, it starts a group in the console to have all test logs with title "Tester". Secondly, it executes given function tests. Finally, it logs a summary of test executions and ends console group.

Arguments:
* **Tests:** must be a function that immediately executed. This function is expected to contain the creation of the tests, e.g. `new Test("description", (assert) => { /* code */ })`.
