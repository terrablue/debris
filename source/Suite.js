import fs from "fs";

export default class Suite {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.tests = [];
  }

  async run(directory, target, runtime) {
    let id = 0;
    const tests = fs.readdirSync(`${directory}/${this.name}`);
    for (const filename of tests) {
      if (!filename.endsWith(".js")) {
        continue;
      }
      const path = `${directory}/${this.name}/${filename}`;
      const module = await import(path);
      const test = module.default;
      test.name = filename.slice(0, -3);
      test.suite = this;
      test.id = id;
      test.path = path;
      id++;
      this.tests.push(test);
      await test.run(target, runtime);
    }
    return this;
  }
}
