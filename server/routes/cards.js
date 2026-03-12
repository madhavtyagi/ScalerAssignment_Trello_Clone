const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const prisma = require("../lib/prisma.js");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

// GET search cards
router.get("/search", async (req, res) => {
  try {
    const { q, boardId, labelId, memberId, dueBefore, dueAfter } = req.query;
    const where = {};

    if (boardId) {
      where.list = { boardId: parseInt(boardId) };
    }
    if (q) {
      where.title = { contains: q, mode: "insensitive" };
    }
    if (labelId) {
      where.labels = { some: { labelId: parseInt(labelId) } };
    }
    if (memberId) {
      where.members = { some: { memberId: parseInt(memberId) } };
    }
    if (dueBefore || dueAfter) {
      where.dueDate = {};
      if (dueBefore) where.dueDate.lte = new Date(dueBefore);
      if (dueAfter) where.dueDate.gte = new Date(dueAfter);
    }
    where.isArchived = false;

    const cards = await prisma.card.findMany({
      where,
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        list: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single card
router.get("/:id", async (req, res) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: { include: { items: true } },
        comments: {
          include: { member: true },
          orderBy: { createdAt: "desc" },
        },
        attachments: { orderBy: { createdAt: "desc" } },
        list: { include: { board: true } },
      },
    });
    if (!card) return res.status(404).json({ error: "Card not found" });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create card
router.post("/", async (req, res) => {
  try {
    const { title, listId } = req.body;
    const lastCard = await prisma.card.findFirst({
      where: { listId, isArchived: false },
      orderBy: { position: "desc" },
    });
    const position = lastCard ? lastCard.position + 1024 : 1024;
    const card = await prisma.card.create({
      data: { title, listId, position },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: { include: { items: true } },
      },
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update card
router.put("/:id", async (req, res) => {
  try {
    const { title, description, dueDate, isArchived, coverColor, listId, position } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (isArchived !== undefined) data.isArchived = isArchived;
    if (coverColor !== undefined) data.coverColor = coverColor;
    if (listId !== undefined) data.listId = listId;
    if (position !== undefined) data.position = position;

    const card = await prisma.card.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: { include: { items: true } },
      },
    });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT reorder/move cards
router.put("/reorder/bulk", async (req, res) => {
  try {
    const { cards } = req.body; // [{ id, listId, position }]
    const updates = cards.map((c) =>
      prisma.card.update({
        where: { id: c.id },
        data: { listId: c.listId, position: c.position },
      })
    );
    await prisma.$transaction(updates);
    res.json({ message: "Cards reordered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE card
router.delete("/:id", async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Card deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add label to card
router.post("/:id/labels", async (req, res) => {
  try {
    const { labelId } = req.body;
    await prisma.cardLabel.create({
      data: { cardId: parseInt(req.params.id), labelId },
    });
    const card = await prisma.card.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: { include: { items: true } },
      },
    });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove label from card
router.delete("/:id/labels/:labelId", async (req, res) => {
  try {
    await prisma.cardLabel.delete({
      where: {
        cardId_labelId: {
          cardId: parseInt(req.params.id),
          labelId: parseInt(req.params.labelId),
        },
      },
    });
    res.json({ message: "Label removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add member to card
router.post("/:id/members", async (req, res) => {
  try {
    const { memberId } = req.body;
    await prisma.cardMember.create({
      data: { cardId: parseInt(req.params.id), memberId },
    });
    const card = await prisma.card.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: { include: { items: true } },
      },
    });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove member from card
router.delete("/:id/members/:memberId", async (req, res) => {
  try {
    await prisma.cardMember.delete({
      where: {
        cardId_memberId: {
          cardId: parseInt(req.params.id),
          memberId: parseInt(req.params.memberId),
        },
      },
    });
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add attachment to card
router.post("/:id/attachments", async (req, res) => {
  try {
    const { name, url } = req.body;
    const attachment = await prisma.attachment.create({
      data: { name, url, cardId: parseInt(req.params.id) },
    });
    res.status(201).json(attachment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload file attachment to card
router.post("/:id/attachments/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    const name = req.body.name || req.file.originalname;
    const attachment = await prisma.attachment.create({
      data: { name, url, cardId: parseInt(req.params.id) },
    });
    res.status(201).json(attachment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove attachment
router.delete("/attachments/:attachmentId", async (req, res) => {
  try {
    await prisma.attachment.delete({
      where: { id: parseInt(req.params.attachmentId) },
    });
    res.json({ message: "Attachment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
