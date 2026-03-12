const { Router } = require("express");
const prisma = require("../lib/prisma.js");

const router = Router();

// GET all labels
router.get("/", async (req, res) => {
  try {
    const labels = await prisma.label.findMany();
    res.json(labels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create label
router.post("/", async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await prisma.label.create({ data: { name, color } });
    res.status(201).json(label);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
