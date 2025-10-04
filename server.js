import express from "express";
import cors from "cors";
import todoRoute from "./routes/todoRoutes.js";
import upload from "./middleware/uploadMidleware.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
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
app.use("/uploads", express.static("uploads")); //express default middleware
app.use("/api/todos", todoRoute);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// db.json lives at server/db.json (same directory as server.js)
const seedPath = path.join(__dirname, "db.json");

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

// End Point or API
app.post("/upload", upload.single("file"), (req, res) => {
  const db = readDb();
  const fileData = {
    id: Date.now(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    date: new Date().toISOString(), // server time use
  };
  db.files.push(fileData);
  writeDb(db);
  res.status(200).json({ success: true, file: fileData });
});

// get files
app.get("/files", (req, res) => res.json(readDb().files));

// Serve uploaded files with proper headers
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Set proper headers for different file types
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  const mimeType = mimeTypes[ext] || "application/octet-stream";

  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  // For images, allow caching
  if (mimeType.startsWith("image/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000");
  }

  res.sendFile(filePath);
});

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
