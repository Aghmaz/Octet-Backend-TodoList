import express from "express";
import cors from "cors";
import todoRoute from "./routes/todoRoutes.js";
const app = express();
app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/api/todos", todoRoute);
const PORT = 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
