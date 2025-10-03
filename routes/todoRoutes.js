import express from "express";
import {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} from "../controller//todoController.js";
const router = express.Router();
router.get("/", getTodos);
router.post("/", addTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
