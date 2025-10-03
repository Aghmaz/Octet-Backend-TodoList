import fs from "fs";
import path from "path";
const dbPath = "db.json";

function readDb() {
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
}
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
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
