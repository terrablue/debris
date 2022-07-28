export default class Reporter {
  constructor(explicit) {
    this.explicit = explicit;
  }

  show(tests) {
    for (const test of tests) {
      this.show_test(test);
    }
  }

  show_test(test) {
    test.cases.filter(c => !c.disabled).forEach(c => this.show_case(c));
  }

  show_case(_case) {
    const {length} = _case.asserts;
    this.asserts = length > 1 ? `[0-${length - 1}]` : "";
    if (length === 0) {
      this.show_empty(_case);
    } else {
      this.show_nonempty(_case);
    }
  }

  show_empty({name, description}) {
    console.log(`${name} \x1b[33m${description}\x1b[0m ${this.asserts}`);
  }

  show_nonempty(_case) {
    if (_case.passed) {
      this.passed(_case);
    } else {
      this.failed(_case);
    }
  }

  passed({name, description}) {
    if (this.explicit) {
      console.log(`${name} \x1b[32m${description}\x1b[0m ${this.asserts}`);
    }
  }

  failed({name, description, asserts}) {
    console.log(`${name} \x1b[31m${description}\x1b[0m ${this.asserts}`);
    for (const assert of asserts) {
      if (!assert.passed) {
        const {id, expected, actual} = assert;
        console.log(` \x1b[31m[${id}]\x1b[0m`)
        console.log(` expected ${JSON.stringify(expected)}`);
        console.log(` actual   \x1b[31m${JSON.stringify(actual)}\x1b[0m`);
      }
    }
  }
}
