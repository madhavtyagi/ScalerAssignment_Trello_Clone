import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Boards
export const getBoards = () => api.get("/boards").then((r) => r.data);
export const getBoard = (id: number) => api.get(`/boards/${id}`).then((r) => r.data);
export const createBoard = (data: { title: string; background?: string }) =>
  api.post("/boards", data).then((r) => r.data);
export const updateBoard = (id: number, data: { title?: string; background?: string }) =>
  api.put(`/boards/${id}`, data).then((r) => r.data);
export const deleteBoard = (id: number) => api.delete(`/boards/${id}`).then((r) => r.data);

// Lists
export const createList = (data: { title: string; boardId: number }) =>
  api.post("/lists", data).then((r) => r.data);
export const updateList = (id: number, data: { title: string }) =>
  api.put(`/lists/${id}`, data).then((r) => r.data);
export const deleteList = (id: number) => api.delete(`/lists/${id}`).then((r) => r.data);
export const reorderLists = (lists: { id: number; position: number }[]) =>
  api.put("/lists/reorder/bulk", { lists }).then((r) => r.data);

// Cards
export const createCard = (data: { title: string; listId: number }) =>
  api.post("/cards", data).then((r) => r.data);
export const getCard = (id: number) => api.get(`/cards/${id}`).then((r) => r.data);
export const updateCard = (id: number, data: Partial<{
  title: string;
  description: string | null;
  dueDate: string | null;
  isArchived: boolean;
  coverColor: string | null;
  listId: number;
  position: number;
}>) => api.put(`/cards/${id}`, data).then((r) => r.data);
export const deleteCard = (id: number) => api.delete(`/cards/${id}`).then((r) => r.data);
export const reorderCards = (cards: { id: number; listId: number; position: number }[]) =>
  api.put("/cards/reorder/bulk", { cards }).then((r) => r.data);
export const searchCards = (params: Record<string, string>) =>
  api.get("/cards/search", { params }).then((r) => r.data);

// Labels
export const getLabels = () => api.get("/labels").then((r) => r.data);
export const addLabelToCard = (cardId: number, labelId: number) =>
  api.post(`/cards/${cardId}/labels`, { labelId }).then((r) => r.data);
export const removeLabelFromCard = (cardId: number, labelId: number) =>
  api.delete(`/cards/${cardId}/labels/${labelId}`).then((r) => r.data);

// Members
export const getMembers = () => api.get("/members").then((r) => r.data);
export const createMember = (data: { name: string; email: string }) =>
  api.post("/members", data).then((r) => r.data);
export const deleteMember = (id: number) => api.delete(`/members/${id}`).then((r) => r.data);
export const addMemberToCard = (cardId: number, memberId: number) =>
  api.post(`/cards/${cardId}/members`, { memberId }).then((r) => r.data);
export const removeMemberFromCard = (cardId: number, memberId: number) =>
  api.delete(`/cards/${cardId}/members/${memberId}`).then((r) => r.data);

// Checklists
export const createChecklist = (data: { title: string; cardId: number }) =>
  api.post("/checklists", data).then((r) => r.data);
export const deleteChecklist = (id: number) =>
  api.delete(`/checklists/${id}`).then((r) => r.data);
export const addChecklistItem = (checklistId: number, text: string) =>
  api.post(`/checklists/${checklistId}/items`, { text }).then((r) => r.data);
export const updateChecklistItem = (itemId: number, data: { text?: string; isCompleted?: boolean }) =>
  api.put(`/checklists/items/${itemId}`, data).then((r) => r.data);
export const deleteChecklistItem = (itemId: number) =>
  api.delete(`/checklists/items/${itemId}`).then((r) => r.data);

// Comments
export const createComment = (data: { text: string; cardId: number; memberId: number }) =>
  api.post("/comments", data).then((r) => r.data);
export const deleteComment = (id: number) =>
  api.delete(`/comments/${id}`).then((r) => r.data);

// Attachments
export const addAttachment = (cardId: number, data: { name: string; url: string }) =>
  api.post(`/cards/${cardId}/attachments`, data).then((r) => r.data);
export const uploadAttachment = (cardId: number, file: File, name?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (name) formData.append("name", name);
  return api.post(`/cards/${cardId}/attachments/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
export const deleteAttachment = (attachmentId: number) =>
  api.delete(`/cards/attachments/${attachmentId}`).then((r) => r.data);
