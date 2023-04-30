#!/usr/bin/env node

import {Path} from "runtime-compat/fs";
import run from "./run.js";

const root = await Path.root();

const getConfig = async base => {
  const filename = "debris.config.js";
  const path = base.join(filename);
  return (await import(await path.exists ? path : `./${filename}`)).default;
};

await run(root, await getConfig(root), process.argv[2]);
