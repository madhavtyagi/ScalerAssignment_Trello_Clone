"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Board, Card } from "@/types";
import * as api from "@/lib/api";
import ListColumn from "./ListColumn";
import { Plus, X } from "lucide-react";

interface BoardViewProps {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board | null>>;
  onRefresh: () => void;
  onCardClick: (card: Card) => void;
}

export default function BoardView({ board, setBoard, onRefresh, onCardClick }: BoardViewProps) {
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const lists = board.lists || [];

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "LIST") {
      const reordered = Array.from(lists);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      const updatedLists = reordered.map((list, idx) => ({
        ...list,
        position: (idx + 1) * 1024,
      }));

      // Optimistic update
      setBoard((prev) => prev ? { ...prev, lists: updatedLists } : prev);

      // Persist in background
      const updates = updatedLists.map((l) => ({ id: l.id, position: l.position }));
      api.reorderLists(updates).catch((err) => {
        console.error("Failed to reorder lists:", err);
        onRefresh(); // Rollback on error
      });
    } else if (type === "CARD") {
      const sourceListId = parseInt(source.droppableId);
      const destListId = parseInt(destination.droppableId);
      const sourceList = lists.find((l) => l.id === sourceListId);
      const destList = lists.find((l) => l.id === destListId);
      if (!sourceList || !destList) return;

      const sourceCards = Array.from(sourceList.cards);
      const [movedCard] = sourceCards.splice(source.index, 1);

      let allUpdates: { id: number; listId: number; position: number }[];

      if (sourceListId === destListId) {
        sourceCards.splice(destination.index, 0, movedCard);
        const updatedCards = sourceCards.map((card, idx) => ({
          ...card,
          position: (idx + 1) * 1024,
        }));

        // Optimistic update
        setBoard((prev) => {
          if (!prev || !prev.lists) return prev;
          return {
            ...prev,
            lists: prev.lists.map((l) =>
              l.id === sourceListId ? { ...l, cards: updatedCards } : l
            ),
          };
        });

        allUpdates = updatedCards.map((c) => ({ id: c.id, listId: sourceListId, position: c.position }));
      } else {
        const destCards = Array.from(destList.cards);
        destCards.splice(destination.index, 0, { ...movedCard, listId: destListId });

        const updatedSourceCards = sourceCards.map((card, idx) => ({
          ...card,
          position: (idx + 1) * 1024,
        }));
        const updatedDestCards = destCards.map((card, idx) => ({
          ...card,
          position: (idx + 1) * 1024,
        }));

        // Optimistic update
        setBoard((prev) => {
          if (!prev || !prev.lists) return prev;
          return {
            ...prev,
            lists: prev.lists.map((l) => {
              if (l.id === sourceListId) return { ...l, cards: updatedSourceCards };
              if (l.id === destListId) return { ...l, cards: updatedDestCards };
              return l;
            }),
          };
        });

        allUpdates = [
          ...updatedSourceCards.map((c) => ({ id: c.id, listId: sourceListId, position: c.position })),
          ...updatedDestCards.map((c) => ({ id: c.id, listId: destListId, position: c.position })),
        ];
      }

      api.reorderCards(allUpdates).catch((err) => {
        console.error("Failed to reorder cards:", err);
        onRefresh(); // Rollback on error
      });
    }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      await api.createList({ title: newListTitle.trim(), boardId: board.id });
      setNewListTitle("");
      setAddingList(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to create list:", err);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" type="LIST" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="board-lists flex-1 flex items-start gap-3 px-3 py-3 overflow-x-auto overflow-y-hidden"
          >
            {lists.map((list, index) => (
              <Draggable key={list.id} draggableId={`list-${list.id}`} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`shrink-0 ${snapshot.isDragging ? "opacity-95 rotate-[3deg] scale-[1.02] shadow-xl z-50" : "transition-transform duration-200"}`}
                  >
                    <ListColumn
                      list={list}
                      onRefresh={onRefresh}
                      onCardClick={onCardClick}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Add List */}
            <div className="shrink-0 w-[85vw] sm:w-[272px]">
              {!addingList ? (
                <button
                  onClick={() => setAddingList(true)}
                  className="btn-press w-full flex items-center gap-2 p-3 rounded-xl text-white/90 bg-[#ffffff3d] hover:bg-[#ffffff52] transition-all duration-200 text-sm font-medium cursor-pointer"
                >
                  <Plus size={16} />
                  Add another list
                </button>
              ) : (
                <div className="list-column bg-[#f1f2f4] rounded-xl p-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddList();
                      if (e.key === "Escape") { setAddingList(false); setNewListTitle(""); }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border-2 border-[#0079bf] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none"
                  />
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={handleAddList}
                      className="px-3 py-1.5 text-sm bg-[#0c66e4] text-white rounded-[3px] font-semibold hover:bg-[#0055cc]"
                    >
                      Add list
                    </button>
                    <button
                      onClick={() => { setAddingList(false); setNewListTitle(""); }}
                      className="p-1.5 text-[#5e6c84] hover:text-[#172b4d] rounded cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
