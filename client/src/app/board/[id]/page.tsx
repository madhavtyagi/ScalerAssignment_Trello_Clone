"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Board, Card, Label, Member } from "@/types";
import * as api from "@/lib/api";
import BoardView from "@/components/BoardView";
import CardModal from "@/components/CardModal";
import SearchBar from "@/components/SearchBar";
import { Loader2, Star, Lock } from "lucide-react";

export default function BoardPage() {
  const params = useParams();
  const boardId = Number(params.id);

  const [board, setBoard] = useState<Board | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [starred, setStarred] = useState(false);

  const loadBoard = useCallback(async () => {
    try {
      const data = await api.getBoard(boardId);
      setBoard(data);
    } catch (err) {
      console.error("Failed to load board:", err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoard();
    api.getLabels().then(setLabels).catch(console.error);
    api.getMembers().then(setMembers).catch(console.error);
  }, [loadBoard]);

  const openCard = async (card: Card) => {
    try {
      const fullCard = await api.getCard(card.id);
      setSelectedCard(fullCard);
    } catch (err) {
      console.error("Failed to load card:", err);
    }
  };

  const closeCard = () => {
    setSelectedCard(null);
    loadBoard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="flex items-center gap-3 text-[#5e6c84]">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-lg">Loading board...</span>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="text-center">
          <p className="text-[#172b4d] text-lg mb-4">Board not found</p>
          <Link href="/" className="text-[#0079bf] hover:underline">Go back to boards</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: board.background }}>
      {/* Top Nav */}
      <nav className="flex items-center h-12 px-4 bg-[#00000052] backdrop-blur-sm shrink-0 relative z-[60]">
        <div className="flex items-center gap-3 w-full">
          <Link href="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <rect x="1" y="1" width="10" height="20" rx="2" opacity="0.9" />
              <rect x="13" y="1" width="10" height="12" rx="2" opacity="0.9" />
            </svg>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <SearchBar boardId={boardId} onCardClick={openCard} labels={labels} members={members} />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0079bf] to-[#5067c5] flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/20 ml-1 cursor-pointer hover:ring-white/40 transition-all duration-200">
              M
            </div>
          </div>
        </div>
      </nav>

      {/* Board Header Bar */}
      <div className="flex items-center h-[52px] px-4 bg-[#0000003d] backdrop-blur-[2px] shrink-0">
        <div className="flex items-center gap-2 w-full">
          <h1 className="text-lg font-bold text-white tracking-[-0.01em]">{board.title}</h1>
          <button
            onClick={() => setStarred(!starred)}
            className="p-1.5 hover:bg-white/20 rounded-[3px] transition-colors duration-200"
          >
            <Star size={16} className={`transition-all duration-200 ${starred ? "text-yellow-300 fill-yellow-300 scale-110" : "text-white/60 hover:text-white/80"}`} />
          </button>
          <div className="h-5 w-px bg-white/20 mx-1" />
          <span className="text-white/60 text-sm hidden sm:inline">Board</span>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn-press flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#ffffff3d] text-white rounded-[3px] hover:bg-[#ffffff52] transition-all duration-200 font-medium">
              <Lock size={13} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <BoardView
        board={board}
        onRefresh={loadBoard}
        onCardClick={openCard}
      />

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          labels={labels}
          members={members}
          onClose={closeCard}
          onUpdate={async () => {
            const updated = await api.getCard(selectedCard.id);
            setSelectedCard(updated);
          }}
        />
      )}
    </div>
  );
}
