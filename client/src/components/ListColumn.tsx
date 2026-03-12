"use client";

import { useState } from "react";
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { List, Card } from "@/types";
import * as api from "@/lib/api";
import CardItem from "./CardItem";
import { Plus, X, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface ListColumnProps {
  list: List;
  onRefresh: () => void;
  onCardClick: (card: Card) => void;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
}

export default function ListColumn({ list, onRefresh, onCardClick, dragHandleProps }: ListColumnProps) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    try {
      await api.createCard({ title: newCardTitle.trim(), listId: list.id });
      setNewCardTitle("");
      setAddingCard(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to create card:", err);
    }
  };

  const handleUpdateTitle = async () => {
    if (!listTitle.trim() || listTitle.trim() === list.title) {
      setListTitle(list.title);
      setEditingTitle(false);
      return;
    }
    try {
      await api.updateList(list.id, { title: listTitle.trim() });
      setEditingTitle(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to update list:", err);
    }
  };

  const handleDeleteList = async () => {
    if (confirm("Delete this list and all its cards?")) {
      try {
        await api.deleteList(list.id);
        onRefresh();
      } catch (err) {
        console.error("Failed to delete list:", err);
      }
    }
    setShowMenu(false);
  };

  return (
    <div className="list-column w-[85vw] sm:w-[272px] bg-[#f1f2f4] rounded-xl flex flex-col max-h-[calc(100vh-150px)]">
      {/* List Header */}
      <div
        {...dragHandleProps}
        className="flex items-center justify-between px-2 pt-2 pb-1 cursor-grab active:cursor-grabbing"
      >
        {editingTitle ? (
          <input
            autoFocus
            type="text"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdateTitle();
              if (e.key === "Escape") { setListTitle(list.title); setEditingTitle(false); }
            }}
            className="flex-1 px-2 py-1 text-sm font-semibold rounded-[3px] bg-white border-2 border-[#0c66e4] text-[#172b4d] focus:outline-none"
          />
        ) : (
          <h3
            onClick={() => setEditingTitle(true)}
            className="flex-1 px-2 py-[6px] text-[14px] font-semibold text-[#172b4d] cursor-pointer rounded-[3px] hover:bg-[#091e420f] transition-colors leading-5"
          >
            {list.title}
          </h3>
        )}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-[#626f86] hover:bg-[#091e420f] rounded-[8px] transition-colors duration-200 cursor-pointer"
          >
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-9 z-20 w-[304px] bg-white rounded-[8px] shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] py-1 animate-scale-in">
                <p className="text-sm font-semibold text-[#44546f] text-center py-2 border-b border-[#091e4224]">List actions</p>
                <button
                  onClick={() => { setEditingTitle(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-[6px] text-sm text-[#172b4d] hover:bg-[#091e420f] text-left transition-colors duration-200"
                >
                  <Pencil size={14} className="text-[#626f86]" /> Rename list
                </button>
                <hr className="border-[#091e4224] my-1" />
                <button
                  onClick={handleDeleteList}
                  className="w-full flex items-center gap-2 px-3 py-[6px] text-sm text-[#ae2e24] hover:bg-[#ffeceb] text-left transition-colors duration-200"
                >
                  <Trash2 size={14} /> Delete list
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards */}
      <Droppable droppableId={String(list.id)} type="CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`list-cards flex-1 overflow-y-auto px-1 py-0.5 min-h-[2px] transition-colors duration-200 rounded-lg mx-1 ${
              snapshot.isDraggingOver ? "bg-[#091e420f]" : ""
            }`}
          >
            {list.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={`card-${card.id}`} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? "rotate-[4deg] opacity-95 scale-[1.02] shadow-lg z-50" : "transition-transform duration-200"}`}
                  >
                    <CardItem card={card} onClick={() => onCardClick(card)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Card */}
      <div className="px-2 pb-2 pt-1">
        {!addingCard ? (
          <button
            onClick={() => setAddingCard(true)}
            className="btn-press w-full flex items-center gap-2 px-2 py-1.5 rounded-[8px] text-[#44546f] hover:bg-[#091e420f] transition-colors duration-200 text-sm cursor-pointer"
          >
            <Plus size={16} />
            Add a card
          </button>
        ) : (
          <div className="animate-fade-in">
            <textarea
              autoFocus
              placeholder="Enter a title for this card..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
                if (e.key === "Escape") { setAddingCard(false); setNewCardTitle(""); }
              }}
              className="w-full px-3 py-2 text-sm rounded-[8px] bg-white shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_0_rgba(9,30,66,0.31)] text-[#172b4d] placeholder-[#626f86] focus:outline-none resize-none min-h-[56px]"
            />
            <div className="flex items-center gap-1 mt-2">
              <button
                onClick={handleAddCard}
                className="btn-press px-3 py-1.5 text-sm bg-[#0c66e4] text-white rounded-[3px] font-semibold hover:bg-[#0055cc] transition-colors duration-200"
              >
                Add card
              </button>
              <button
                onClick={() => { setAddingCard(false); setNewCardTitle(""); }}
                className="p-1.5 text-[#626f86] hover:text-[#172b4d] rounded-[3px] hover:bg-[#091e420f] cursor-pointer transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
