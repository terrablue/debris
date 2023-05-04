import {Path} from "runtime-compat/fs";
import {yellow} from "runtime-compat/colors";
import Case from "./Case.js";

const reduce = (array, initial) =>
  array.reduce(async (previous, current) =>
    current(previous), initial);

export default class Test {
  #reasserts = [];
  #fixes = [];
  #lifecycle = Object.fromEntries(["setup", "before", "after", "teardown"]
    .map(operation => [operation, async () => null]));

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

  lifecycle(lifecycle = {}) {
    this.#lifecycle = {...this.#lifecycle, ...lifecycle};
  }

  setup(setup = () => null) {
    this.lifecycle({setup});
  }

  before(before = () => null) {
    this.lifecycle({before});
  }

  after(after = () => null) {
    this.lifecycle({after});
  }

  teardown(teardown = () => null) {
    this.lifecycle({teardown});
  }

  async run(target, fixtures) {
    const spec = await import(this.path);
    if (spec.default === undefined) {
      const path = this.path.replace(`${Path.resolve()}/`, "");
      console.log(`${yellow("??")} ${path} doesn't export a default function`);
      return this;
    }
    spec.default(this);

    const {setup, before, after, teardown} = this.#lifecycle;
    await setup();
    for (const c_ of this.cases) {
      await before();
      await c_.run(target, fixtures);
      await after();
    }
    await teardown();
    return this;
  }
}
