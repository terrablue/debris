#!/usr/bin/env node

import {Path} from "runtime-compat/filesystem";
import run from "../src/run.js";

const root = await Path.moduleRoot;

const conf = await import(new Path(root, "debris.json"),
  {assert: {type: "json"}});
await run(root, conf.default, process.argv[2]);
