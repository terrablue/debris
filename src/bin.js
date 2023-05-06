#!/usr/bin/env node

import {Path} from "runtime-compat/fs";
import run from "./run.js";

const getConfig = async base => {
  const filename = "debris.config.js";
  const path = base.join(filename);
  return (await import(await path.exists ? path : `./${filename}`)).default;
};

const root = await Path.root();
const current = Path.resolve();
const config = await getConfig(root);
const base = `${root}` === `${current}` ? root.join(config.base) : current;

await run(root, base, config, process.argv[2]);
