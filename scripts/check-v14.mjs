import fs from "node:fs";
import assert from "node:assert/strict";

const contact = fs.readFileSync("assets/js/contact-form.js", "utf8");
const drawer = fs.readFileSync("assets/js/home-v11.js", "utf8");
const handoff = fs.readFileSync("assets/js/home-v13.js", "utf8");
const styles = fs.readFileSync("assets/css/home-v13.css", "utf8");
const config = fs.readFileSync("contact-config.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

assert.match(contact, /allfiction:contact-sent/);
assert.match(contact, /af-agent-brief/);
assert.match(contact, /contactSource/);
assert.match(drawer, /allfiction:contact-sent/);
assert.match(handoff, /CONTACTO ENVIADO/);
assert.match(handoff, /data-af14-new-enquiry/);
assert.match(handoff, /event\.detail\?\.source !== "af-agent-brief"/);
assert.match(styles, /\.ai-v11-approval\.is-sent/);
assert.match(config, /V14 conversion state sync/);
assert.match(html, /contact-form\.js\?v=20260813-v14/);

console.log("V14 conversion state sync contracts: OK");
