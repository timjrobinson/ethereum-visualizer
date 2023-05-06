import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

// Serve the static index.html file
app.use(express.static(path.join(__dirname, "../public")));

// Default route to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
