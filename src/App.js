import {File, Path} from "runtime-compat/filesystem";
import Reporter from "./Reporter.js";

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
    this.fixtures = await Promise.all(await File.collect(fixtures, ".js$",
        {recursive: false})
      .map(({path}) => new Path(path))
      .map(async path => [path.base, (await import(path.path)).default]));
  }

  async run(target) {
    const {root, conf} = this;
    const specs = await File.collect(new Path(root, conf.base), conf.pattern);
    const reporter = new Reporter(conf.explicit);
    const fixtures = () =>
      Object.fromEntries(this.fixtures.map(([key, value]) => [key, value()]));
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
