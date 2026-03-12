const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.label.deleteMany();
  await prisma.member.deleteMany();
  await prisma.board.deleteMany();

  // Create members (including 2 Indian names)
  const members = await Promise.all([
    prisma.member.create({
      data: { name: "Madhav", email: "madhav@example.com", avatarUrl: null },
    }),
    prisma.member.create({
      data: { name: "Alice Johnson", email: "alice@example.com", avatarUrl: null },
    }),
    prisma.member.create({
      data: { name: "Bob Smith", email: "bob@example.com", avatarUrl: null },
    }),
    prisma.member.create({
      data: { name: "Carol Williams", email: "carol@example.com", avatarUrl: null },
    }),
    prisma.member.create({
      data: { name: "Arjun Sharma", email: "arjun@example.com", avatarUrl: null },
    }),
    prisma.member.create({
      data: { name: "Priya Patel", email: "priya@example.com", avatarUrl: null },
    }),
  ]);

  const [madhav, alice, bob, carol, arjun, priya] = members;

  // Create labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: "Bug", color: "#eb5a46" } }),
    prisma.label.create({ data: { name: "Feature", color: "#61bd4f" } }),
    prisma.label.create({ data: { name: "Enhancement", color: "#f2d600" } }),
    prisma.label.create({ data: { name: "Urgent", color: "#c377e0" } }),
    prisma.label.create({ data: { name: "Documentation", color: "#0079bf" } }),
    prisma.label.create({ data: { name: "Design", color: "#ff9f1a" } }),
  ]);

  const [bugLabel, featureLabel, enhancementLabel, urgentLabel, docsLabel, designLabel] = labels;

  // ─────────────────────────────────────────────
  // BOARD 1: Project Alpha
  // ─────────────────────────────────────────────
  const board1 = await prisma.board.create({
    data: { title: "Project Alpha", background: "linear-gradient(135deg, #0079bf 0%, #5067c5 100%)" },
  });

  const b1Todo = await prisma.list.create({ data: { title: "To Do", position: 1024, boardId: board1.id } });
  const b1InProgress = await prisma.list.create({ data: { title: "In Progress", position: 2048, boardId: board1.id } });
  const b1Review = await prisma.list.create({ data: { title: "In Review", position: 3072, boardId: board1.id } });
  const b1Done = await prisma.list.create({ data: { title: "Done", position: 4096, boardId: board1.id } });

  const b1c1 = await prisma.card.create({
    data: {
      title: "Set up project repository",
      description: "Initialize the Git repo, set up CI/CD pipeline, and configure linting rules.",
      position: 1024, listId: b1Todo.id, dueDate: new Date("2026-03-20"), coverColor: "#22c55e",
    },
  });
  const b1c2 = await prisma.card.create({
    data: {
      title: "Design database schema",
      description: "Create ERD and finalize the database schema for all entities.",
      position: 2048, listId: b1Todo.id, coverColor: "#0ea5e9",
    },
  });
  const b1c3 = await prisma.card.create({
    data: { title: "Write API documentation", position: 3072, listId: b1Todo.id, coverColor: "#f97316" },
  });
  const b1c4 = await prisma.card.create({
    data: {
      title: "Implement user authentication",
      description: "Build login/signup flow with JWT tokens.",
      position: 1024, listId: b1InProgress.id, dueDate: new Date("2026-03-15"), coverColor: "#8b5cf6",
    },
  });
  const b1c5 = await prisma.card.create({
    data: { title: "Create landing page", position: 2048, listId: b1InProgress.id, coverColor: "#ec4899" },
  });
  const b1c6 = await prisma.card.create({
    data: {
      title: "Fix navigation bug on mobile",
      description: "The hamburger menu doesn't close after selecting a link.",
      position: 1024, listId: b1Review.id, coverColor: "#ef4444",
    },
  });
  const b1c7 = await prisma.card.create({
    data: {
      title: "Set up development environment",
      description: "Install all dependencies and configure the development environment.",
      position: 1024, listId: b1Done.id, coverColor: "#6b7280",
    },
  });

  // Board 1 — labels
  await prisma.cardLabel.createMany({
    data: [
      { cardId: b1c1.id, labelId: featureLabel.id },
      { cardId: b1c2.id, labelId: featureLabel.id },
      { cardId: b1c2.id, labelId: docsLabel.id },
      { cardId: b1c3.id, labelId: docsLabel.id },
      { cardId: b1c4.id, labelId: featureLabel.id },
      { cardId: b1c4.id, labelId: urgentLabel.id },
      { cardId: b1c5.id, labelId: designLabel.id },
      { cardId: b1c6.id, labelId: bugLabel.id },
    ],
  });

  // Board 1 — members
  await prisma.cardMember.createMany({
    data: [
      { cardId: b1c1.id, memberId: madhav.id },
      { cardId: b1c2.id, memberId: alice.id },
      { cardId: b1c2.id, memberId: arjun.id },
      { cardId: b1c4.id, memberId: madhav.id },
      { cardId: b1c4.id, memberId: bob.id },
      { cardId: b1c5.id, memberId: carol.id },
      { cardId: b1c6.id, memberId: priya.id },
      { cardId: b1c7.id, memberId: arjun.id },
    ],
  });

  // Board 1 — checklist
  const b1Checklist = await prisma.checklist.create({ data: { title: "Auth Tasks", cardId: b1c4.id } });
  await prisma.checklistItem.createMany({
    data: [
      { text: "Set up JWT middleware", isCompleted: true, checklistId: b1Checklist.id },
      { text: "Create login endpoint", isCompleted: true, checklistId: b1Checklist.id },
      { text: "Create signup endpoint", isCompleted: false, checklistId: b1Checklist.id },
      { text: "Add password hashing", isCompleted: false, checklistId: b1Checklist.id },
    ],
  });

  // Board 1 — comments
  await prisma.comment.createMany({
    data: [
      { text: "Let's prioritize this for the sprint.", cardId: b1c4.id, memberId: madhav.id },
      { text: "I can help with the frontend part.", cardId: b1c5.id, memberId: alice.id },
      { text: "Schema looks good, added a few suggestions in the doc.", cardId: b1c2.id, memberId: arjun.id },
    ],
  });

  // Board 1 — attachments
  await prisma.attachment.createMany({
    data: [
      { name: "API Design Doc", url: "https://docs.google.com/document/d/example", cardId: b1c4.id },
      { name: "Wireframe", url: "https://www.figma.com/file/example", cardId: b1c5.id },
    ],
  });

  // ─────────────────────────────────────────────
  // BOARD 2: Personal Tasks
  // ─────────────────────────────────────────────
  const board2 = await prisma.board.create({
    data: { title: "Personal Tasks", background: "linear-gradient(135deg, #519839 0%, #2ea87e 100%)" },
  });

  const b2Today = await prisma.list.create({ data: { title: "Today", position: 1024, boardId: board2.id } });
  const b2ThisWeek = await prisma.list.create({ data: { title: "This Week", position: 2048, boardId: board2.id } });
  const b2Goals = await prisma.list.create({ data: { title: "Monthly Goals", position: 3072, boardId: board2.id } });
  const b2Completed = await prisma.list.create({ data: { title: "Completed", position: 4096, boardId: board2.id } });

  const b2c1 = await prisma.card.create({
    data: {
      title: "Review pull requests",
      description: "Go through open PRs on the team repo and leave review comments.",
      position: 1024, listId: b2Today.id, dueDate: new Date("2026-03-12"), coverColor: "#0ea5e9",
    },
  });
  const b2c2 = await prisma.card.create({
    data: { title: "Reply to emails", position: 2048, listId: b2Today.id },
  });
  const b2c3 = await prisma.card.create({
    data: {
      title: "Prepare presentation for Friday standup",
      description: "Summarize this week's progress and blockers for the team standup.",
      position: 3072, listId: b2Today.id, dueDate: new Date("2026-03-14"), coverColor: "#f97316",
    },
  });
  const b2c4 = await prisma.card.create({
    data: {
      title: "Complete DSA practice — Trees & Graphs",
      description: "Solve at least 5 medium-level problems on LeetCode.",
      position: 1024, listId: b2ThisWeek.id, dueDate: new Date("2026-03-16"), coverColor: "#8b5cf6",
    },
  });
  const b2c5 = await prisma.card.create({
    data: {
      title: "Read System Design chapter 4",
      description: "Chapter on consistent hashing and data partitioning.",
      position: 2048, listId: b2ThisWeek.id, coverColor: "#22c55e",
    },
  });
  const b2c6 = await prisma.card.create({
    data: { title: "Update LinkedIn profile", position: 3072, listId: b2ThisWeek.id },
  });
  const b2c7 = await prisma.card.create({
    data: {
      title: "Build portfolio website",
      description: "Design and deploy a personal portfolio with project showcases.",
      position: 1024, listId: b2Goals.id, dueDate: new Date("2026-03-31"), coverColor: "#ec4899",
    },
  });
  const b2c8 = await prisma.card.create({
    data: { title: "Contribute to 2 open source projects", position: 2048, listId: b2Goals.id, coverColor: "#61bd4f" },
  });
  const b2c9 = await prisma.card.create({
    data: {
      title: "Set up Docker environment",
      description: "Installed Docker Desktop and configured PostgreSQL container.",
      position: 1024, listId: b2Completed.id, coverColor: "#6b7280",
    },
  });
  const b2c10 = await prisma.card.create({
    data: { title: "Complete React hooks tutorial", position: 2048, listId: b2Completed.id, coverColor: "#6b7280" },
  });

  // Board 2 — labels
  await prisma.cardLabel.createMany({
    data: [
      { cardId: b2c1.id, labelId: urgentLabel.id },
      { cardId: b2c3.id, labelId: enhancementLabel.id },
      { cardId: b2c4.id, labelId: featureLabel.id },
      { cardId: b2c5.id, labelId: docsLabel.id },
      { cardId: b2c7.id, labelId: designLabel.id },
      { cardId: b2c7.id, labelId: featureLabel.id },
      { cardId: b2c8.id, labelId: featureLabel.id },
    ],
  });

  // Board 2 — members
  await prisma.cardMember.createMany({
    data: [
      { cardId: b2c1.id, memberId: madhav.id },
      { cardId: b2c3.id, memberId: madhav.id },
      { cardId: b2c4.id, memberId: madhav.id },
      { cardId: b2c7.id, memberId: madhav.id },
    ],
  });

  // Board 2 — checklist
  const b2Checklist = await prisma.checklist.create({ data: { title: "DSA Topics", cardId: b2c4.id } });
  await prisma.checklistItem.createMany({
    data: [
      { text: "Binary Tree traversals", isCompleted: true, checklistId: b2Checklist.id },
      { text: "BST insert & delete", isCompleted: true, checklistId: b2Checklist.id },
      { text: "BFS & DFS on graphs", isCompleted: false, checklistId: b2Checklist.id },
      { text: "Dijkstra's algorithm", isCompleted: false, checklistId: b2Checklist.id },
      { text: "Topological sort", isCompleted: false, checklistId: b2Checklist.id },
    ],
  });

  // Board 2 — comments
  await prisma.comment.createMany({
    data: [
      { text: "Don't forget the edge cases in graph problems!", cardId: b2c4.id, memberId: madhav.id },
    ],
  });

  // ─────────────────────────────────────────────
  // BOARD 3: Sprint Planning — Q1 2026
  // ─────────────────────────────────────────────
  const board3 = await prisma.board.create({
    data: { title: "Sprint Planning — Q1 2026", background: "linear-gradient(135deg, #cd5a91 0%, #552586 100%)" },
  });

  const b3Backlog = await prisma.list.create({ data: { title: "Backlog", position: 1024, boardId: board3.id } });
  const b3Sprint = await prisma.list.create({ data: { title: "Current Sprint", position: 2048, boardId: board3.id } });
  const b3Testing = await prisma.list.create({ data: { title: "QA / Testing", position: 3072, boardId: board3.id } });
  const b3Shipped = await prisma.list.create({ data: { title: "Shipped", position: 4096, boardId: board3.id } });

  const b3c1 = await prisma.card.create({
    data: {
      title: "Integrate payment gateway",
      description: "Set up Razorpay/Stripe integration for the checkout flow. Handle success and failure callbacks.",
      position: 1024, listId: b3Backlog.id, coverColor: "#0ea5e9",
    },
  });
  const b3c2 = await prisma.card.create({
    data: {
      title: "Add email notification service",
      description: "Set up transactional emails for order confirmation, password reset, and welcome emails.",
      position: 2048, listId: b3Backlog.id, dueDate: new Date("2026-03-25"), coverColor: "#f97316",
    },
  });
  const b3c3 = await prisma.card.create({
    data: {
      title: "Implement role-based access control",
      description: "Admin, editor, and viewer roles with route-level permission guards.",
      position: 3072, listId: b3Backlog.id, coverColor: "#8b5cf6",
    },
  });
  const b3c4 = await prisma.card.create({
    data: {
      title: "Build analytics dashboard",
      description: "Create a dashboard showing user signups, DAU, and revenue metrics using charts.",
      position: 1024, listId: b3Sprint.id, dueDate: new Date("2026-03-18"), coverColor: "#22c55e",
    },
  });
  const b3c5 = await prisma.card.create({
    data: {
      title: "Optimize image uploads",
      description: "Compress images on upload, add lazy loading, and serve via CDN.",
      position: 2048, listId: b3Sprint.id, dueDate: new Date("2026-03-16"), coverColor: "#ef4444",
    },
  });
  const b3c6 = await prisma.card.create({
    data: {
      title: "API rate limiting middleware",
      description: "Add rate limiting to prevent abuse. Use sliding window algorithm.",
      position: 3072, listId: b3Sprint.id, coverColor: "#ec4899",
    },
  });
  const b3c7 = await prisma.card.create({
    data: {
      title: "Search functionality — full text search",
      description: "Implement full-text search using PostgreSQL tsvector for products and articles.",
      position: 1024, listId: b3Testing.id, coverColor: "#f2d600",
    },
  });
  const b3c8 = await prisma.card.create({
    data: {
      title: "Set up CI/CD pipeline",
      description: "GitHub Actions workflow for lint, test, build, and deploy to staging.",
      position: 1024, listId: b3Shipped.id, coverColor: "#6b7280",
    },
  });
  const b3c9 = await prisma.card.create({
    data: {
      title: "Database indexing & query optimization",
      description: "Added indexes on frequently queried columns. Reduced avg query time by 40%.",
      position: 2048, listId: b3Shipped.id, coverColor: "#6b7280",
    },
  });

  // Board 3 — labels
  await prisma.cardLabel.createMany({
    data: [
      { cardId: b3c1.id, labelId: featureLabel.id },
      { cardId: b3c1.id, labelId: urgentLabel.id },
      { cardId: b3c2.id, labelId: featureLabel.id },
      { cardId: b3c3.id, labelId: featureLabel.id },
      { cardId: b3c4.id, labelId: designLabel.id },
      { cardId: b3c4.id, labelId: featureLabel.id },
      { cardId: b3c5.id, labelId: enhancementLabel.id },
      { cardId: b3c5.id, labelId: bugLabel.id },
      { cardId: b3c6.id, labelId: enhancementLabel.id },
      { cardId: b3c7.id, labelId: featureLabel.id },
      { cardId: b3c8.id, labelId: enhancementLabel.id },
      { cardId: b3c9.id, labelId: enhancementLabel.id },
    ],
  });

  // Board 3 — members (Arjun & Priya assigned alongside existing members)
  await prisma.cardMember.createMany({
    data: [
      { cardId: b3c1.id, memberId: arjun.id },
      { cardId: b3c1.id, memberId: bob.id },
      { cardId: b3c2.id, memberId: priya.id },
      { cardId: b3c2.id, memberId: carol.id },
      { cardId: b3c3.id, memberId: arjun.id },
      { cardId: b3c3.id, memberId: alice.id },
      { cardId: b3c4.id, memberId: priya.id },
      { cardId: b3c4.id, memberId: madhav.id },
      { cardId: b3c5.id, memberId: arjun.id },
      { cardId: b3c6.id, memberId: bob.id },
      { cardId: b3c7.id, memberId: priya.id },
      { cardId: b3c7.id, memberId: arjun.id },
      { cardId: b3c8.id, memberId: madhav.id },
      { cardId: b3c9.id, memberId: arjun.id },
    ],
  });

  // Board 3 — checklists
  const b3Checklist1 = await prisma.checklist.create({ data: { title: "Payment Integration Steps", cardId: b3c1.id } });
  await prisma.checklistItem.createMany({
    data: [
      { text: "Create Razorpay account & get API keys", isCompleted: true, checklistId: b3Checklist1.id },
      { text: "Build checkout API endpoint", isCompleted: false, checklistId: b3Checklist1.id },
      { text: "Handle payment success webhook", isCompleted: false, checklistId: b3Checklist1.id },
      { text: "Handle payment failure & retries", isCompleted: false, checklistId: b3Checklist1.id },
      { text: "Write integration tests", isCompleted: false, checklistId: b3Checklist1.id },
    ],
  });

  const b3Checklist2 = await prisma.checklist.create({ data: { title: "Dashboard Components", cardId: b3c4.id } });
  await prisma.checklistItem.createMany({
    data: [
      { text: "User signup chart (line chart)", isCompleted: true, checklistId: b3Checklist2.id },
      { text: "DAU widget (bar chart)", isCompleted: true, checklistId: b3Checklist2.id },
      { text: "Revenue summary cards", isCompleted: false, checklistId: b3Checklist2.id },
      { text: "Date range filter", isCompleted: false, checklistId: b3Checklist2.id },
    ],
  });

  // Board 3 — comments
  await prisma.comment.createMany({
    data: [
      { text: "Razorpay docs are pretty good, I'll set up the sandbox first.", cardId: b3c1.id, memberId: arjun.id },
      { text: "Should we use SendGrid or Resend for emails?", cardId: b3c2.id, memberId: priya.id },
      { text: "Let's go with Resend — simpler API and better DX.", cardId: b3c2.id, memberId: madhav.id },
      { text: "Dashboard is looking great! Just need the date filter.", cardId: b3c4.id, memberId: madhav.id },
      { text: "I've added sharp for image compression, PR is up.", cardId: b3c5.id, memberId: arjun.id },
      { text: "All search tests passing with tsvector approach.", cardId: b3c7.id, memberId: priya.id },
    ],
  });

  // Board 3 — attachments
  await prisma.attachment.createMany({
    data: [
      { name: "Razorpay API Docs", url: "https://razorpay.com/docs/api", cardId: b3c1.id },
      { name: "Dashboard Figma Mockup", url: "https://www.figma.com/file/dashboard-mockup", cardId: b3c4.id },
      { name: "CI/CD Pipeline Diagram", url: "https://miro.com/app/board/pipeline", cardId: b3c8.id },
    ],
  });

  console.log("Seed data created successfully!");
  console.log("Created: 6 members, 6 labels, 3 boards with lists, cards, checklists, comments & attachments");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
