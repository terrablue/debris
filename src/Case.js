import Assert from "./Assert.js";
import fs from "fs";

export default class Case {
  constructor(description, body, test, id) {
    this.description = description;
    this.body = body;
    this.test = test;
    this.id = id;
    this.asserts = [];
  }

  get suite() {
    return this.test.suite;
  }

  get number() {
    return `${this.suite.id}.${this.test.id}.${this.id}`;
  }

  get name() {
    return `${this.number} ${this.suite.name}.${this.test.name}`;
  }

  report(passed, actual, expected) {
    this.asserts.push(passed, actual, expected);
  }

  get snapshot_directory() {
    const {test, description} = this;
    return `${test.path.slice(0, -3)}/${description.replaceAll(" ", "-")}`;
  }

  snapshot(assert_name, data) {
    const {snapshot_directory} = this;
    const stat_options = {"throwIfNoEntry": false};
    if (!fs.lstatSync(snapshot_directory, stat_options)) {
      // create directory
      fs.mkdirSync(snapshot_directory, {"recursive": true});
    }
    const path = `${snapshot_directory}/${assert_name}.data`;
    const exists = fs.lstatSync(path, {"throwIfNoEntry": false});
    const read_options = {"encoding": "utf8"};
    if (exists) {
      return fs.readFileSync(path, read_options);
    }

    fs.writeFileSync(path, data, read_options);
  }

  get passed() {
    // not one assert which did not pass
    return !this.asserts.some(assert => !assert.passed);
  }

  async run(target, runtime) {
    if (target !== undefined && target !== this.number) {
      this.disabled = true;
      return;
    }
    try {
      const {fixtures} = runtime;
      const assert = actual => {
        const assert = new Assert(actual, this.asserts.length, this);
        this.asserts.push(assert);
        return assert;
      };
      assert.fail = () => assert(true).false();
      await this.test.per(assert, fixtures(), this);
    } catch (error) {
      console.log(error);
    }
  }
}
