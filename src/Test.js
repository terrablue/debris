import Case from "./Case.js";

const fn_reduce = (array, initial) =>
  array.reduce(async (previous, current) => current(previous), initial);

export default class Test {
  #reasserts = [];
  #refixs = [];

  constructor() {
    this.cases = [];
  }

  async per(preassert, prefixtures, c) {
    const assert = await fn_reduce(this.#reasserts, preassert);
    const fixtures = await fn_reduce(this.#refixs, prefixtures);

    await c.body(assert, fixtures);
  }

  refix(mapper) {
    this.#refixs.push(mapper);
    return this;
  }

  reassert(mapper) {
    this.#reasserts.push(mapper);
    return this;
  }

  space(name, inputs, body) {
    inputs.forEach(input =>
      this.case(`${name} ${input}`, (assert, ...args) =>
        body(assert, input, ...args)));
  }

  case(description, body) {
    this.cases.push(new Case(description, body, this, this.cases.length));
  }

  async run(target, runtime) {
    for (const c of this.cases) {
      await c.run(target, runtime);
    }
  }
}
