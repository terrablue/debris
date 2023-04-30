import Case from "./Case.js";

const reduce = (array, initial) =>
  array.reduce(async (previous, current) =>
    current(previous), initial);

export default class Test {
  #reasserts = [];
  #fixes = [];

  constructor(root, spec, id) {
    this.cases = [];
    this.path = spec.path;
    this.name = this.path.replace(`${root}/`, () => "");
    this.id = id;
  }

  async per(preassert, prefixtures, c) {
    const assert = await reduce(this.#reasserts, preassert);
    const fixtures = Object.fromEntries(prefixtures.map(([key, value]) =>
      [key, value()]));
    await c.body(assert, await reduce(this.#fixes, fixtures));
  }

  fix(mapper) {
    this.#fixes.push(mapper);
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
    this.cases.push(new Case(description, body, this));
  }

  async run(target, fixtures) {
    const spec = await import(this.path);
    spec.default(this);
    for (const c_ of this.cases) {
      await c_.run(target, fixtures);
    }
    return this;
  }
}
