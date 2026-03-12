const { Router } = require("express");
const prisma = require("../lib/prisma.js");

const router = Router();

// POST create list
router.post("/", async (req, res) => {
  try {
    const { title, boardId } = req.body;
    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
    });
    const position = lastList ? lastList.position + 1024 : 1024;
    const list = await prisma.list.create({
      data: { title, boardId, position },
      include: { cards: true },
    });
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update list
router.put("/:id", async (req, res) => {
  try {
    const { title } = req.body;
    const list = await prisma.list.update({
      where: { id: parseInt(req.params.id) },
      data: { title },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT reorder lists
router.put("/reorder/bulk", async (req, res) => {
  try {
    const { lists } = req.body; // [{ id, position }]
    const updates = lists.map((l) =>
      prisma.list.update({
        where: { id: l.id },
        data: { position: l.position },
      })
    );
    await prisma.$transaction(updates);
    res.json({ message: "Lists reordered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE list
router.delete("/:id", async (req, res) => {
  try {
    await prisma.list.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "List deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
