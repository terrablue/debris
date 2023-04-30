#!/usr/bin/env node

import {Path} from "runtime-compat/filesystem";
import run from "../src/run.js";

const root = await Path.moduleRoot;

const getConfigPath = async moduleDirectory => {
  const filename = "debris.json";
  const path = new Path(moduleDirectory, filename);
  return await path.exists ? path : `../${filename}`;
};

const conf = await import(await getConfigPath(root), {assert: {type: "json"}});
await run(root, conf.default, process.argv[2]);
