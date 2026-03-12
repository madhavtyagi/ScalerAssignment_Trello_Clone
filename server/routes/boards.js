const { Router } = require("express");
const prisma = require("../lib/prisma.js");

const router = Router();

// GET all boards
router.get("/", async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: "asc" },
              include: {
                labels: { include: { label: true } },
                members: { include: { member: true } },
                checklists: { include: { items: true } },
              },
            },
          },
        },
      },
    });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single board with lists and cards
router.get("/:id", async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: "asc" },
              include: {
                labels: { include: { label: true } },
                members: { include: { member: true } },
                checklists: { include: { items: true } },
              },
            },
          },
        },
      },
    });
    if (!board) return res.status(404).json({ error: "Board not found" });
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create board
router.post("/", async (req, res) => {
  try {
    const { title, background } = req.body;
    const board = await prisma.board.create({
      data: { title, background },
    });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update board
router.put("/:id", async (req, res) => {
  try {
    const { title, background } = req.body;
    const board = await prisma.board.update({
      where: { id: parseInt(req.params.id) },
      data: { title, background },
    });
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE board
router.delete("/:id", async (req, res) => {
  try {
    await prisma.board.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Board deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
