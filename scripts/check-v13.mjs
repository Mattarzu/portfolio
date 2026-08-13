import fs from "node:fs";
import assert from "node:assert/strict";

const config = fs.readFileSync("contact-config.js", "utf8");
const drawer = fs.readFileSync("assets/js/home-v11.js", "utf8");
const handoff = fs.readFileSync("assets/js/home-v13.js", "utf8");
const styles = fs.readFileSync("assets/css/home-v13.css", "utf8");

assert.match(config, /home-v13\.js/);
assert.match(config, /home-v13\.css/);
assert.match(drawer, /allfiction:brief-approved/);
assert.match(handoff, /allfiction_prepared_project_brief/);
assert.match(handoff, /data-af13-review-form/);
assert.match(handoff, /classList\.remove\("is-open"\)/);
assert.match(handoff, /getElementById\("contacto"\)/);
assert.match(styles, /\.af13-contact-brief/);

console.log("V13 conversion handoff contracts: OK");
