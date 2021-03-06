import {Path} from "runtime-compat/filesystem";
import Assert from "./Assert.js";

export default class Case {
  constructor(description, body, test, id) {
    this.description = description;
    this.body = body;
    this.test = test;
    this.id = id;
    this.asserts = [];
  }

  get number() {
    return `${this.test.id}.${this.id}`;
  }

  get name() {
    return `${this.number} ${this.test.name}`;
  }

  report(passed, actual, expected) {
    this.asserts.push(passed, actual, expected);
  }

  get snapshot_directory() {
    const {test, description} = this;
    return new Path(test.path.directory, btoa(description));
  }

  async snapshot(assert_name, data) {
    const directory = await File.recreate(this.snapshot_directory);
    const file = new File(directory, assert_name, ".data");
    if (!await file.exists) {
      await file.write(data);
    }
    return file.read();
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
