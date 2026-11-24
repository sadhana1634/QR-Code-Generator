import express from "express";
import qr from "qr-image";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const MAX_URL_LENGTH = 2000;

app.use(express.static(path.join(__dirname, "public")));

// GET /qr?url=<url>&type=png|svg[&download=1]
app.get("/qr", (req, res) => {
  const url = (req.query.url || "").toString().trim();
  const type = req.query.type === "svg" ? "svg" : "png";

  if (!url) {
    return res.status(400).json({ error: "Please enter a URL." });
  }
  if (url.length > MAX_URL_LENGTH) {
    return res.status(400).json({ error: "That URL is too long." });
  }

  res.type(type === "svg" ? "image/svg+xml" : "image/png");
  if (req.query.download) {
    res.attachment(`qr-code.${type}`);
  }

  const options = type === "png" ? { type, size: 10, margin: 2 } : { type, margin: 2 };
  qr.image(url, options).pipe(res);
});

app.listen(PORT, () => {
  console.log(`QR Code Generator running at http://localhost:${PORT}`);
});
