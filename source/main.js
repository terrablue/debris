import {dirname, join} from "path";
import App from "./App.js";
import Test from "./Test.js";

const base = dirname(join(process.argv[1], ".."));
const path = join(base, process.argv[2]);
const conf_file = (await import(path, {"assert": {"type": "json"}})).default;
const app = new App(base, conf_file);
await app.load();
app.run(process.argv[3]);

export {Test};
