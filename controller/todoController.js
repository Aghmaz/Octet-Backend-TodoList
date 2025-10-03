import { v4 as uuidv4 } from "uuid";
import { fetch, create, update, remove } from "../service/todoService.js";
export const getTodos = (req, res) => {
  res.status(200).json(fetch());
};
export const addTodo = (req, res) => {
  console.log("req.body", req.body);
  const todo = { id: uuidv4(), ...req.body };
  res.status(201).json(create(todo));
};
export const updateTodo = (req, res) => {
  const updated = update(req.params.id, req.body);
  if (!update) {
    return res.status(404).json({ message: "Not Found" });
  }
  res.status(201).json(updated);
};
export const deleteTodo = (req, res) => {
  const deleted = remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Not Deleted" });
  }
  return res.status(201).json({ message: "Todo list has been deleted" });
};
