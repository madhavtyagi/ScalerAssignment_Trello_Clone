const { Router } = require("express");
const prisma = require("../lib/prisma.js");

const router = Router();

// GET all members
router.get("/", async (req, res) => {
  try {
    const members = await prisma.member.findMany();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create member
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const member = await prisma.member.create({
      data: { name, email },
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE member
router.delete("/:id", async (req, res) => {
  try {
    await prisma.member.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Member deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
