#!/usr/bin/env node

import {Path, File} from "runtime-compat/filesystem";
import run from "../src/run.js";

const base = Path.resolve();

const getConfigPath = async projectDirectory => {
  const filename = "debris.json";
  const file = new File(projectDirectory, filename);
  return await file.exists ? file.path : `../${filename}`;
};

const conf = await import(await getConfigPath(base), {assert: {type: "json"}});
await run(base, conf.default, process.argv[2]);
