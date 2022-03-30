# Debris: A JavaScript Testing Framework

Debris is a supercharged testing framework with support for fixtures,
asynchronicity and spaced testing.

## Features

* No dependencies
* Descriptive
* Fixtures
* Promise support
* Test spacing (metatesting, fuzzy testing)
* Snapshots
* Individual test running

## Installing

```
npm install debris
```

## Configuring

We recommend adding a script to your `package.json`.

```json
"scripts": {
  "test": "node --experimental-json-modules node_modules/debris debris.json"
}
```

Then in your project's root directory, create a `debris.json`.

```json
{
  "suites": "test/suites",
  "fixtures": "test/fixtures"
}
```

`suites` is where your test suites will go, `fixtures` will contain your test
fixtures. Paths are relative to your project root path.

If you're interested in showing passed tests, add `"explicit": true`.

## Using

### Adding a suite

Create a subdirectory in the `suites` directory, for example `first-suite`
(in our case `test/suites/first-suite`).

### Adding a test

There create a test case in the suite directory, `first-test.js`
(`test/suites/first-suite/first-test.js`).

Import `Test` from `debris`, create a new `Test` object, add a case and
default-export the test.

```js
import {Test} from "debris";

const test = new Test();

test.case("there is only *the* truth", assert => {
  assert(true).equals(true);
});

export default test;
```

Now run the test.

```
npm run debris
```

As the test passed, there won't be any output (unless `explicit` is true).

Now make the test fail by changing either side to `false` and rerun it. You
will be told that the test 0.0.0 failed and why.

### Adding a fixture

Tests only really become useful when you have fixtures. Fixtures can represent
classes in your application that you don't want to explicitly import over and
over again in your tests, or actual fixtures you need reused in your tests.

Create a fixture file in the fixtures directory, `first.js`
(`test/fixtures/first.js`).

Every fixture file should have one default export defined as a function.

```js
export default () => true;
```

Fixtures are made available to all test cases as the second parameter to the
`case` method of `Test`.

Modify your `first-test`.

```js
import {Test} from "debris";

const test = new Test();

test.case("there is only *the* truth", (assert, fixtures) => {
  assert(fixtures.first).equals(true);
});

export default test;
```

The properties of `fixtures` reflect the filenames (without `.js`) of the
fixtures you created.

You can use destructuring to cleverly pull in a fixture you need for an
individual case.

```js
import {Test} from "debris";

const test = new Test();

test.case("there is only *the* truth", (assert, {first}) => {
  assert(first).equals(true);
});

export default test;
```

### Transformed fixtures

Sometimes you need all the cases of a test to do something common that isn't
necessarily achieveable by fixtures. For example you might want to read a file
based on a test's name and then make sure it fulfills certain criteria.

You can override the `for` method of your `Test` object to achieve that.

```js
import {Test} from "debris";

const test = new Test();

test.for = async (fixtures, {description}) => {
  const path = description.replaceAll(" ", "-") + ".html";
  // assume the function `read` returns a file's contents at `path`
  const contents = await read(path);
  return {...fixtures, contents};
});

test.case("file containing the truth", (assert, {contents}) => {
  assert(contents).equals("true");
});

export default test;
```

`for` is a transformation that takes the original `fixtures` parameter and the
case itself as parameters and returns a (modified) fixtures object which is
available to the case.

### Case spacing / fuzzing

Sometimes you don't want individual cases with set input but the same case
executed many times with different inputs. You can use the `space` method of
`Test` for that.

```js
import {Test} from "debris";

const test = new Test();

test.space("there is only *the* truth", [true, false], (assert, each) => {
  assert(each).equals(true);
});

export default test;
```

This effectively creates two cases by the same definition and different input,
one which will pass and another which will fail.

Spacing can be combined with fixtures, see API later on.

### Snapshots

Snapshots are dynamically generated fixtures. With snapshots you can test the
stability of a given object using `assert(...).stable()`.

On the first run, the asserted value is JSON-stringified and saved to disk at
the same location as the test itself. On a subsequent run, the asserted value
is compared to the value on disk. For these kind of tests to be effective you
should commit the dynamically generated fixtures alongside your test.

### Running tests individually

If you're working on a test and aren't interested in others, you can run it
individually and ignore the rest. Just use the test's generated id.

This would run only the first test.

```
npm run debris 0.0.0
```

### Test-driven development

If you're doing TDD and want tests to explicitly fail as you write them, you
can use `assert.fail()`. Calling it is equivalent to writing
`assert(true).false()`.

## API

Subject to breakage until we hit v1.

### Test

#### `case(String description, Function body)`

Defines a case using the given `description`. `body` will be executed with
assert as its first and fixtures as its second parameter.

#### `for(Array fixtures, Case case)`

Executes once per test case, transforming `fixtures`. The return value will be
input to the case.

The default implementation unless overwritten is an identity function on
`fixtures` (`fixtures => fixtures`).

**This function should not be called but overwritten.**

#### `space(String description, Array inputs, Function body)`

Defines a case space using the given `description` and `inputs`. `body` will be
executed `inputs.length` times with the respective input from `inputs` as its
first parameter and `fixtures` as its second. `body` will be signed in as
`Test.prototype.case`.

## Roadmap to v1

* 100% self-coverage
* Sane configuration defaults
* Proper logger (stdio, file)

## License

BSD-3-Clause
