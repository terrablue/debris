# Debris: A JavaScript Testing Framework

Debris is a JavaScript testing framework with support for fixtures,
asynchronicity and spaced testing.

## Features

* No dependencies
* Descriptive
* Fixtures
* Promise support
* Test spacing (metatesting, fuzzy testing)
* Snapshots
* Individual test running

## Configuring

*Skip this part you don't need a custom configuration.*

In your project root create a `debris.json`.

```json
{
  "fixtures": "fixtures",
  "explicit": true
}
```

`fixtures` is the directory containing your test fixtures, the path is relative
to your project root.

If you're interested in hidding passed tests change `explicit` to `false`.

## Writing tests

If you're testing `src/truth.js`, create a `src/truth.spec.js` file.

```js
export default test => {
  test.case("there is only *the* truth", assert => {
    assert(true).equals(true);
  });
});
```

Run the test.

```
npx debris
```

### Adding fixtures

Fixtures represent a state of your application that you don't want to
manually set each time.

Create a fixture file in the fixtures directory, `truth.js`
(`fixtures/truth.js`).

```js
export default () => true;
```

Fixtures are made available to all test cases as the second parameter to the
`case` method of `test`.

Modify your test.

```js
export default test => {
  test.case("there is only *the* truth", (assert, fixtures) => {
    assert(fixtures.truth).equals(true);
  });
}
```

The properties of `fixtures` reflect the filenames (without `.js`) of the
fixtures you created. You can thus also destructure to pull in the fixtures you
need for an individual case.

```js
export default test => {
  test.case("there is only *the* truth", (assert, {truth}) => {
    assert(truth).equals(true);
  });
}
```

### Transformed fixtures

Sometimes you need all the cases of a test to do something common that isn't
necessarily achievable with fixtures. For example you might want to read a file
based on a test's name and then make sure it fulfills certain criteria.

You can call the `refix` method of the `test` parameter to achieve that.

```js
export default test => {
  test.refix(async (fixtures, {description}) => {
    const path = description.replaceAll(" ", "-") + ".html";
    // assume the function `read` returns a file's contents at `path`
    const contents = await read(path);
    return {...fixtures, contents};
  }));

  test.case("file containing the truth", (assert, {contents}) => {
    assert(contents).equals("true");
  });
}
```

The first of argument of `refix` is a mapper that takes the original `fixtures`
parameter and the case itself as parameters and maps it to a (modified) fixtures
object which is available to the case.

### Case spacing / fuzzing

Sometimes you don't want individual cases with set input but the same case
executed many times with different inputs. You can use the `space` method of
`test` for that.

```js
export default test => {
  test.space("there is only *the* truth", [true, false], (assert, each) => {
    assert(each).equals(true);
  });
}
```

This effectively creates two cases with the same definition and different input,
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

If you're working on a test and aren't interested in others you can run it
individually and ignore the rest. Just use the test's generated id.

This runs only the first test.

```
npx debris 0.0.0
```

### Test-driven development

If you're doing TDD and want tests to explicitly fail as you write them you
can use `assert.fail()`. Calling it is equivalent to writing
`assert(true).false()`.

## API

Subject to breakage until v1.

### `Test` (the parameter `test` passed to a spec)

#### `case(String description, Function body)`

Defines a case using the given `description`. `body` will be executed with
`assert` as its first and `fixtures` as its second parameter.

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
* Documentation

## License

MIT
