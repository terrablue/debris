import fs from "fs";
import Suite from "./Suite.js";
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
    return {"suites": `${base}/${suites}`, "fixtures": `${base}/${fixtures}`};
  }

  async load() {
    const path = this.path.fixtures;
    const stat_options = {"throwIfNoEntry": false};
    if (fs.lstatSync(path, stat_options)) {
      this.fixtures = (await Promise.all(fs
        .readdirSync(path)
        .filter(fixture => fixture.endsWith(".js"))
        .map(async fixture => ({
          "key": fixture.slice(0, ending),
          "value": (await import(`${path}/${fixture}`)).default,
      })))).reduce((fixtures, {key, value}) => {
        fixtures[key] = value;
        return fixtures;
      }, {});
    }
  }

  async run(target) {
    const path = this.path.suites;
    const suites = fs.readdirSync(path).filter(file => !file.endsWith(".js"));
    const reporter = new Reporter(this.conf.explicit);
    const fixtures = () =>
      Object.fromEntries(Object.entries(this.fixtures)
        .map(([key, value]) => [key, value()]));
    const runtime = {reporter, fixtures};
    for (const suite of suites) {
      this.suites.push(
        await new Suite(suite, this.suites.length).run(path, target, runtime));
    }
    reporter.show(this.suites);
  }
}
