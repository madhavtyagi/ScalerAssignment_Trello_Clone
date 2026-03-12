const { Router } = require("express");
const prisma = require("../lib/prisma.js");

const router = Router();

// POST create comment
router.post("/", async (req, res) => {
  try {
    const { text, cardId, memberId } = req.body;
    const comment = await prisma.comment.create({
      data: { text, cardId, memberId },
      include: { member: true },
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE comment
router.delete("/:id", async (req, res) => {
  try {
    await prisma.comment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
