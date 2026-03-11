# Trello Clone - Project Management Tool

A full-stack Kanban-style project management web application that replicates Trello's design and user experience.

## Tech Stack

- **Frontend:** Next.js 16 (React), TypeScript, Tailwind CSS
- **Backend:** Node.js with Express.js 5
- **Database:** PostgreSQL with Prisma ORM
- **Drag & Drop:** @hello-pangea/dnd

## Features

### Core Features
- **Board Management** - Create, view, and delete boards with custom backgrounds
- **Lists Management** - Create, edit, delete, and drag-and-drop reorder lists
- **Cards Management** - Create, edit, delete/archive cards; drag-and-drop between lists and within lists
- **Card Details** - Labels (colored tags), due dates, checklists with progress tracking, member assignment
- **Search & Filter** - Search cards by title; filter by labels, members, or due date
- **Comments** - Add and delete comments on cards with activity log

### Bonus Features
- Multiple boards support
- Responsive design
- Board background customization

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL) OR PostgreSQL installed locally

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd Scaler
```

### 2. Start PostgreSQL (via Docker)

```bash
docker run -d --name trello-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=trello_clone \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Set up the Backend

```bash
cd server
npm install

# Run database migration
npx prisma migrate dev

# Seed sample data
node prisma/seed.js

# Start the server (runs on port 5001)
npm run dev
```

### 4. Set up the Frontend

```bash
cd client
npm install

# Start the dev server (runs on port 3000)
npm run dev
```

### 5. Open the app

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The database consists of 9 tables with the following relationships:

- **Board** → has many Lists
- **List** → belongs to Board, has many Cards
- **Card** → belongs to List, has many Labels/Members/Checklists/Comments
- **Label** → many-to-many with Cards (via CardLabel)
- **Member** → many-to-many with Cards (via CardMember), has many Comments
- **Checklist** → belongs to Card, has many ChecklistItems
- **ChecklistItem** → belongs to Checklist
- **Comment** → belongs to Card and Member

## Assumptions

- No authentication required - a default user (Madhav, id=1) is assumed logged in
- Sample members are pre-seeded in the database for assignment functionality
- Sample board with lists, cards, labels, and checklists are seeded for demo
- Port 5001 is used for the backend (macOS uses 5000 for AirPlay)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/boards | List all boards |
| GET | /api/boards/:id | Get board with lists and cards |
| POST | /api/boards | Create board |
| PUT | /api/boards/:id | Update board |
| DELETE | /api/boards/:id | Delete board |
| POST | /api/lists | Create list |
| PUT | /api/lists/:id | Update list title |
| PUT | /api/lists/reorder/bulk | Reorder lists |
| DELETE | /api/lists/:id | Delete list |
| GET | /api/cards/search | Search/filter cards |
| GET | /api/cards/:id | Get card details |
| POST | /api/cards | Create card |
| PUT | /api/cards/:id | Update card |
| PUT | /api/cards/reorder/bulk | Reorder/move cards |
| DELETE | /api/cards/:id | Delete card |
| POST | /api/cards/:id/labels | Add label to card |
| DELETE | /api/cards/:id/labels/:labelId | Remove label |
| POST | /api/cards/:id/members | Add member to card |
| DELETE | /api/cards/:id/members/:memberId | Remove member |
| GET | /api/labels | List all labels |
| GET | /api/members | List all members |
| POST | /api/checklists | Create checklist |
| DELETE | /api/checklists/:id | Delete checklist |
| POST | /api/checklists/:id/items | Add checklist item |
| PUT | /api/checklists/items/:itemId | Toggle/update item |
| DELETE | /api/checklists/items/:itemId | Delete item |
| POST | /api/comments | Create comment |
| DELETE | /api/comments/:id | Delete comment |
