import {File, Path} from "runtime-compat/filesystem";
import Reporter from "./Reporter.js";
import Test from "./Test.js";

export default async (root, conf, target) => {
  const fixtures = await Promise.all(File
    .collect(new Path(root, conf.fixtures), ".js$", {recursive: false})
    .map(({path}) => new Path(path))
    .map(async path => [path.base, (await import(path.path)).default]));
  const files = await File.collect(new Path(root, conf.base), conf.pattern);
  const tests = await Promise.all(files.map((spec, i) =>
    new Test(root, spec, i).run(target, () =>
      Object.fromEntries(fixtures.map(([key, value]) => [key, value()]))
    )));
  new Reporter(conf.explicit).report(tests);
};
