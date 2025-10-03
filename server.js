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

// Root HTML page for backend confirmation and route listing
app.get("/", (req, res) => {
  const base = "/api/todos";
  const routes =
    (todoRoute.stack || [])
      .filter((l) => l.route)
      .flatMap((l) => {
        const methods = Object.keys(l.route.methods || {}).map((m) =>
          m.toUpperCase()
        );
        const subPath = l.route.path === "/" ? "" : l.route.path;
        return methods.map((m) => ({ method: m, path: `${base}${subPath}` }));
      }) || [];

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Backend Status</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1f2937; }
  h1 { margin: 0 0 8px; font-size: 24px; }
  .ok { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #e6ffed; color: #036b26; border: 1px solid #b7f7c5; font-size: 12px; }
  .routes { margin-top: 16px; }
  code { background: #f3f4f6; padding: 2px 6px; border-radius: 6px; }
  li { margin: 6px 0; }
  footer { margin-top: 24px; color: #6b7280; font-size: 12px; }
</style>
</head>
<body>
  <h1>Server is running <span class="ok">OK</span></h1>
  <p>This backend exposes <strong>${routes.length}</strong> route(s).</p>
  <div class="routes">
    <ul>
      ${routes
        .map((r) => `<li><code>${r.method}</code> <code>${r.path}</code></li>`)
        .join("")}
    </ul>
  </div>
  <footer>Visit <code>${base}</code> to interact with the Todo API.</footer>
</body>
</html>`;
  res.status(200).type("html").send(html);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
