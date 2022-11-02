#!/usr/bin/env node

import {Path, File} from "runtime-compat/filesystem";
import App from "../src/App.js";

const base = Path.resolve();

const getConfigPath = async projectDirectory => {
  const filename = "debris.json";
  const file = new File(projectDirectory, filename);
  return await file.exists ? file.path : `../${filename}`;
};

const conf = import(await getConfigPath(base), {assert: {type: "json"}});
const app = new App(base, (await conf).default);
await app.load();
app.run(process.argv[2]);
