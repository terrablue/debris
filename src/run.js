import {File, Path} from "runtime-compat/filesystem";
import Reporter from "./Reporter.js";
import Test from "./Test.js";

export default async (root, conf, target) => {
  const fixtures = await Promise.all(
    (await File.
      collect(new Path(root, conf.fixtures), ".js$", {recursive: false}))
    .map(({path}) => new Path(path))
    .map(async path => [path.base, (await import(path.path)).default]));
  const files = await File.collect(new Path(root, conf.base), conf.pattern);
  const tests = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const test = await new Test(root, file, i).run(target, fixtures);
    tests.push(test);
  }
  new Reporter(conf.explicit).report(tests);
};
