export interface Board {
  id: number;
  title: string;
  background: string;
  createdAt: string;
  updatedAt: string;
  lists?: List[];
}

export interface List {
  id: number;
  title: string;
  position: number;
  boardId: number;
  cards: Card[];
}

export interface Card {
  id: number;
  title: string;
  description: string | null;
  position: number;
  dueDate: string | null;
  isArchived: boolean;
  coverColor: string | null;
  listId: number;
  labels: CardLabel[];
  members: CardMember[];
  checklists: Checklist[];
  comments?: Comment[];
  attachments?: Attachment[];
  list?: List & { board?: Board };
}

export interface Label {
  id: number;
  name: string | null;
  color: string;
}

export interface CardLabel {
  cardId: number;
  labelId: number;
  label: Label;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface CardMember {
  cardId: number;
  memberId: number;
  member: Member;
}

export interface Checklist {
  id: number;
  title: string;
  cardId: number;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: number;
  text: string;
  isCompleted: boolean;
  checklistId: number;
}

export interface Comment {
  id: number;
  text: string;
  cardId: number;
  memberId: number;
  member: Member;
  createdAt: string;
}

export interface Attachment {
  id: number;
  name: string;
  url: string;
  cardId: number;
  createdAt: string;
}
