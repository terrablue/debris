import {File} from "runtime-compat/filesystem";
import fs from "fs";
import Reporter from "./Reporter.js";

const ending = -3;

export default class App {
  constructor(base, conf) {
    this.base = base;
    this.conf = conf;
    this.suites = [];
    this.fixtures = {};
  }

  get path() {
    const {base} = this;
    const {suites, fixtures} = this.conf;
    return {suites: `${base}/${suites}`, fixtures: `${base}/${fixtures}`};
  }

  async load() {
    const path = this.path.fixtures;
    const stat_options = {throwIfNoEntry: false};
    if (fs.lstatSync(path, stat_options)) {
      this.fixtures = (await Promise.all(fs
        .readdirSync(path)
        .filter(fixture => fixture.endsWith(".js"))
        .map(async fixture => ({
          key: fixture.slice(0, ending),
          value: (await import(`${path}/${fixture}`)).default,
      })))).reduce((fixtures, {key, value}) => {
        fixtures[key] = value;
        return fixtures;
      }, {});
    }
  }

  async run(target) {
    const path = this.path.suites;
    const specs = await File.collect(this.base, ".*/src/.*.spec.js$");
    const reporter = new Reporter(this.conf.explicit);
    const fixtures = () =>
      Object.fromEntries(Object.entries(this.fixtures)
        .map(([key, value]) => [key, value()]));
    const runtime = {reporter, fixtures};
    let id = 0;
    const tests = [];
    for (const spec of specs) {
      const module = await import(spec.path);
      const test = module.default;
      test.name = spec.path.replace(`${this.base}/`, "");
      test.id = id;
      test.path = path;
      id++;
      await test.run(target, runtime);
      tests.push(test);
    }
    reporter.show(tests);
  }
}
