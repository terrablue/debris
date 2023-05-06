import {File, Path} from "runtime-compat/fs";
import Reporter from "./Reporter.js";
import Test from "./Test.js";

const collectTests = async (base, pattern, target, fixtures) => {
  console.log(target);
  const files = await File.collect(base, pattern);
  const tests = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const test = await new Test(base, file, i).run(target, fixtures);
    tests.push(test);
  }
  return tests;
};

export default async (root, base, config, target) => {
  const fixtures = await Promise.all(
    (await File
      .collect(root.join(config.fixtures), ".js$", {recursive: false}))
      .map(({path}) => new Path(path))
      .map(async path => [path.base, (await import(path.path)).default]));
  let tests = [];
  if (target?.endsWith(".spec.js")) {
    const {file} = Path.resolve().join(target);
    const test = await new Test(base, file, 0).run(undefined, fixtures);
    tests.push(test);
  } else {
    tests = await collectTests(base, config.pattern, target, fixtures);
  }
  new Reporter(config.explicit).report(tests);
};
