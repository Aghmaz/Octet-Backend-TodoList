import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// db.json lives at server/db.json
const seedPath = path.join(__dirname, "..", "db.json");

// On Vercel, writeable filesystem is /tmp; locally we can use the seed file directly
const isVercel = !!process.env.VERCEL;
const runtimePath = isVercel ? "/tmp/db.json" : seedPath;

function ensureRuntimeDb() {
  if (!isVercel) return;
  // If /tmp/db.json does not exist, seed it from bundled db.json
  if (!fs.existsSync(runtimePath)) {
    const seed = fs.readFileSync(seedPath, "utf8");
    fs.writeFileSync(runtimePath, seed);
  }
}

function readDb() {
  ensureRuntimeDb();
  const p = isVercel ? runtimePath : seedPath;
  const data = fs.readFileSync(p, "utf8");
  return JSON.parse(data || "[]");
}

function writeDb(data) {
  if (isVercel) {
    ensureRuntimeDb();
    fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2));
  } else {
    fs.writeFileSync(seedPath, JSON.stringify(data, null, 2));
  }
}

export const fetch = () => {
  const todos = readDb();
  return todos;
};
export const create = (todo) => {
  const db = readDb();
  db.push(todo);
  writeDb(db);
  return todo;
};
export const update = (id, updates) => {
  const db = readDb();
  const index = db.findIndex((t) => t.id === id);
  if (index !== -1 && updates.text) {
    db[index] = { ...db[index], text: updates.text };
    writeDb(db);
    console.log(db[index], "here is res");
    return db[index];
  }
  if (!updates.text) {
    return db[index];
  }
  return null;
};
export const remove = (id) => {
  console.log(id, "id");
  let db = readDb();
  db = db.filter((t) => t.id !== id);
  writeDb(db);
  return true;
};
