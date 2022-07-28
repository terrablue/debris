import {File, Path} from "runtime-compat/filesystem";
import Reporter from "./Reporter.js";

const ending = -3;

export default class App {
  constructor(root, conf) {
    this.root = root;
    this.conf = conf;
    this.fixtures = {};
  }

  get path() {
    const {root} = this;
    const {fixtures} = this.conf;
    return {fixtures: `${root}/${fixtures}`};
  }

  async load() {
    const {fixtures} = this.path;
    this.fixtures = await File.collect(fixtures, ".js$")
      .map(async fixture => [
        fixture.slice(0, ending),
        (await import(`${fixtures}/${fixture}`)).default,
      ]);
  }

  async run(target) {
    const {root, conf} = this;
    const specs = await File.collect(new Path(root, conf.base), conf.pattern);
    const reporter = new Reporter(conf.explicit);
    const fixtures = () =>
      Object.fromEntries(Object.entries(this.fixtures)
        .map(([key, value]) => [key, value()]));
    const runtime = {reporter, fixtures};
    let id = 0;
    const tests = [];
    for (const spec of specs) {
      const module = await import(spec.path);
      const test = module.default;
      test.path = new Path(spec.path);
      test.name = spec.path.replace(root + "/", "");
      test.id = id;
      id++;
      await test.run(target, runtime);
      tests.push(test);
    }
    reporter.show(tests);
  }
}
