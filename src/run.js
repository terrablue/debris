import {File, Path} from "runtime-compat/fs";
import Reporter from "./Reporter.js";
import Test from "./Test.js";

const collectTests = async (root, conf, target, fixtures) => {
  const files = await File.collect(new Path(root, conf.base), conf.pattern);
  const tests = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const test = await new Test(root, file, i).run(target, fixtures);
    tests.push(test);
  }
  return tests;
};

export default async (root, conf, target) => {
  const fixtures = await Promise.all(
    (await File
      .collect(new Path(root, conf.fixtures), ".js$", {recursive: false}))
      .map(({path}) => new Path(path))
      .map(async path => [path.base, (await import(path.path)).default]));
  let tests = [];
  if (target?.endsWith(".spec.js")) {
    const file = Path.resolve().join(target).file;
    const test = await new Test(root, file, 0).run(undefined, fixtures);
    tests.push(test);
  } else {
    tests = await collectTests(root, conf, target, fixtures);
  }
  new Reporter(conf.explicit).report(tests);
};
