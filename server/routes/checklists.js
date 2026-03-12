const { Router } = require("express");
const prisma = require("../lib/prisma.js");

const router = Router();

// POST create checklist
router.post("/", async (req, res) => {
  try {
    const { title, cardId } = req.body;
    const checklist = await prisma.checklist.create({
      data: { title, cardId },
      include: { items: true },
    });
    res.status(201).json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE checklist
router.delete("/:id", async (req, res) => {
  try {
    await prisma.checklist.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Checklist deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add item to checklist
router.post("/:id/items", async (req, res) => {
  try {
    const { text } = req.body;
    const item = await prisma.checklistItem.create({
      data: { text, checklistId: parseInt(req.params.id) },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update checklist item
router.put("/items/:itemId", async (req, res) => {
  try {
    const { text, isCompleted } = req.body;
    const data = {};
    if (text !== undefined) data.text = text;
    if (isCompleted !== undefined) data.isCompleted = isCompleted;
    const item = await prisma.checklistItem.update({
      where: { id: parseInt(req.params.itemId) },
      data,
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE checklist item
router.delete("/items/:itemId", async (req, res) => {
  try {
    await prisma.checklistItem.delete({
      where: { id: parseInt(req.params.itemId) },
    });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
