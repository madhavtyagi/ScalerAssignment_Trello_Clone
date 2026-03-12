const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv/config");

const boardRoutes = require("./routes/boards.js");
const listRoutes = require("./routes/lists.js");
const cardRoutes = require("./routes/cards.js");
const labelRoutes = require("./routes/labels.js");
const memberRoutes = require("./routes/members.js");
const checklistRoutes = require("./routes/checklists.js");
const commentRoutes = require("./routes/comments.js");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/comments", commentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
