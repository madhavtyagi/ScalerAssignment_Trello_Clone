"use client";

import { useEffect, useState, useRef } from "react";
import { Board, Card, Label, Member } from "@/types";
import { getBoards, createBoard, deleteBoard, updateBoard, getMembers, createMember, deleteMember, getLabels } from "@/lib/api";
import Link from "next/link";
import CardModal from "@/components/CardModal";
import { Plus, Trash2, X, LayoutGrid, ChevronLeft, Palette, Upload, Table, Calendar, Clock } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

const BOARD_GRADIENTS = [
  "linear-gradient(135deg, #0079bf 0%, #5067c5 100%)",
  "linear-gradient(135deg, #d29034 0%, #eb5a46 100%)",
  "linear-gradient(135deg, #519839 0%, #2ea87e 100%)",
  "linear-gradient(135deg, #b04632 0%, #89609e 100%)",
  "linear-gradient(135deg, #89609e 0%, #cd5a91 100%)",
  "linear-gradient(135deg, #00aecc 0%, #0079bf 100%)",
  "linear-gradient(135deg, #4bbf6b 0%, #00aecc 100%)",
  "linear-gradient(135deg, #0c66e4 0%, #1f845a 100%)",
  "linear-gradient(135deg, #943d73 0%, #b04632 100%)",
];

type ViewMode = "boards" | "table" | "calendar";

export default function HomePage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState(BOARD_GRADIENTS[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editBg, setEditBg] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("boards");
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBoards();
    loadMembers();
    loadLabels();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      console.error("Failed to load boards:", err);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  };

  const loadLabels = async () => {
    try {
      const data = await getLabels();
      setAllLabels(data);
    } catch (err) {
      console.error("Failed to load labels:", err);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    try {
      await createMember({ name: newMemberName.trim(), email: newMemberEmail.trim() });
      setNewMemberName("");
      setNewMemberEmail("");
      setAddingMember(false);
      loadMembers();
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await deleteMember(id);
      loadMembers();
    } catch (err) {
      console.error("Failed to delete member:", err);
    }
  };

  const handleCreateBoard = async () => {
    if (!newTitle.trim()) return;
    try {
      await createBoard({ title: newTitle.trim(), background: selectedBg });
      setNewTitle("");
      setShowCreate(false);
      setSelectedBg(BOARD_GRADIENTS[0]);
      loadBoards();
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this board?")) {
      try {
        await deleteBoard(id);
        loadBoards();
      } catch (err) {
        console.error("Failed to delete board:", err);
      }
    }
  };

  const handleFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await handleFileToDataUrl(file);
    setSelectedBg(`url(${dataUrl}) center/cover`);
    e.target.value = "";
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await handleFileToDataUrl(file);
    setEditBg(`url(${dataUrl}) center/cover`);
    e.target.value = "";
  };

  const handleEditBoardBg = (board: Board) => {
    setEditingBoard(board);
    setEditBg(board.background);
  };

  const handleSaveBoardBg = async () => {
    if (!editingBoard) return;
    try {
      await updateBoard(editingBoard.id, { background: editBg });
      setEditingBoard(null);
      loadBoards();
    } catch (err) {
      console.error("Failed to update board:", err);
    }
  };

  // Gather all cards across all boards for table/calendar views
  const allCards: (Card & { boardName: string; listName: string })[] = [];
  boards.forEach((board) => {
    board.lists?.forEach((list) => {
      list.cards?.forEach((card) => {
        allCards.push({ ...card, boardName: board.title, listName: list.title });
      });
    });
  });

  return (
    <div className="min-h-screen bg-[#f9fafc] flex flex-col">
      {/* Top Navbar */}
      <nav className="flex items-center h-12 px-4 bg-[#1d2125] sticky top-0 z-50">
        <div className="flex items-center gap-4 w-full">
          <Link href="/" className="flex items-center gap-2 text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="1" y="1" width="10" height="20" rx="2" opacity="0.9" />
              <rect x="13" y="1" width="10" height="12" rx="2" opacity="0.9" />
            </svg>
            <span className="text-lg font-bold tracking-tight">Trello</span>
          </Link>

          <button
            onClick={() => setShowCreate(true)}
            className="ml-2 px-3 py-1.5 text-sm font-medium bg-[#579dff] text-white rounded hover:bg-[#85b8ff] transition-colors"
          >
            Create
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0079bf] flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              M
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className={`${sidebarCollapsed ? "w-4" : "w-[260px]"} shrink-0 border-r border-[#dfe1e6] bg-white transition-all duration-200 relative hidden lg:block`}>
          {!sidebarCollapsed ? (
            <div className="py-4">
              <div className="flex items-center gap-3 px-4 mb-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0079bf] to-[#5067c5] flex items-center justify-center text-sm font-bold text-white">
                  T
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#172b4d] truncate">Trello Workspace</p>
                  <p className="text-xs text-[#5e6c84]">Free</p>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 hover:bg-[#091e420f] rounded transition-colors text-[#5e6c84]"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              <div className="mt-3">
                <button
                  onClick={() => setViewMode("boards")}
                  className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm text-left transition-colors ${viewMode === "boards" ? "bg-[#e9f2ff] text-[#0c66e4] font-semibold" : "text-[#172b4d] hover:bg-[#091e420f]"}`}
                >
                  <LayoutGrid size={16} />
                  Boards
                </button>
              </div>

              <div className="mt-4 px-4">
                <p className="text-xs font-semibold text-[#5e6c84] mb-1 uppercase tracking-wider">Workspace views</p>
              </div>
              <button
                onClick={() => setViewMode("table")}
                className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm text-left transition-colors ${viewMode === "table" ? "bg-[#e9f2ff] text-[#0c66e4] font-semibold" : "text-[#172b4d] hover:bg-[#091e420f]"}`}
              >
                <Table size={16} />
                Table
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm text-left transition-colors ${viewMode === "calendar" ? "bg-[#e9f2ff] text-[#0c66e4] font-semibold" : "text-[#172b4d] hover:bg-[#091e420f]"}`}
              >
                <Calendar size={16} />
                Calendar
              </button>

              {/* Members Section */}
              <div className="mt-4 px-4 flex items-center justify-between">
                <p className="text-xs font-semibold text-[#5e6c84] uppercase tracking-wider">Members</p>
                <button
                  onClick={() => setAddingMember(true)}
                  className="p-1 hover:bg-[#091e420f] rounded transition-colors text-[#5e6c84]"
                  title="Add member"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="mt-1">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 px-4 py-1.5 hover:bg-[#091e420f] transition-colors group/member">
                    <div className="w-7 h-7 rounded-full bg-[#0079bf] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[#172b4d] truncate flex-1">{member.name}</span>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-1 text-[#5e6c84] hover:text-[#ae2e24] opacity-0 group-hover/member:opacity-100 transition-all rounded hover:bg-[#091e420f]"
                      title="Remove member"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {addingMember && (
                <div className="px-4 py-2 space-y-1.5">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border border-[#dfe1e6] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0c66e4]"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                    className="w-full px-2 py-1.5 text-sm rounded border border-[#dfe1e6] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0c66e4]"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleAddMember}
                      disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                      className="px-3 py-1 text-sm bg-[#0c66e4] text-white rounded font-medium hover:bg-[#0055cc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingMember(false); setNewMemberName(""); setNewMemberEmail(""); }}
                      className="p-1 text-[#5e6c84] hover:text-[#172b4d] rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 px-4 flex items-center justify-between">
                <p className="text-xs font-semibold text-[#5e6c84] uppercase tracking-wider">Your boards</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="p-1 hover:bg-[#091e420f] rounded transition-colors text-[#5e6c84]"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="mt-1">
                {boards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className="flex items-center gap-3 px-4 py-1.5 hover:bg-[#091e420f] transition-colors"
                  >
                    <div className="w-6 h-5 rounded-sm shrink-0" style={{ background: board.background }} />
                    <span className="text-sm text-[#172b4d] truncate">{board.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="absolute top-4 -right-3 w-6 h-6 bg-white border border-[#dfe1e6] rounded-full flex items-center justify-center shadow-sm hover:bg-[#f4f5f7] z-10"
            >
              <ChevronLeft size={12} className="rotate-180 text-[#5e6c84]" />
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-[960px] mx-auto py-10 px-6 min-h-[calc(100vh-48px)]">
            {/* Mobile view switcher */}
            <div className="flex items-center gap-1 mb-4 lg:hidden bg-white rounded-lg border border-[#dfe1e6] p-1">
              {([["boards", LayoutGrid, "Boards"], ["table", Table, "Table"], ["calendar", Calendar, "Calendar"]] as const).map(([mode, Icon, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors ${viewMode === mode ? "bg-[#e9f2ff] text-[#0c66e4] font-semibold" : "text-[#5e6c84] hover:bg-[#091e420f]"}`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-[#0079bf] to-[#5067c5] flex items-center justify-center text-lg font-bold text-white">
                T
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#172b4d]">Trello Workspace</h1>
                <p className="text-xs text-[#5e6c84] flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  Private
                </p>
              </div>
            </div>

            <hr className="border-[#dfe1e6] mb-6" />

            {/* View: Boards */}
            {viewMode === "boards" && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid size={20} className="text-[#172b4d]" />
                  <h2 className="text-base font-semibold text-[#172b4d]">Boards</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {boards.map((board) => (
                    <div key={board.id} className="relative group">
                      <Link
                        href={`/board/${board.id}`}
                        className="board-tile block h-24 rounded-[3px] overflow-hidden"
                        style={{ background: board.background }}
                      >
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                        <div className="relative h-full flex flex-col justify-between p-2">
                          <span className="text-sm font-bold text-white drop-shadow-sm">{board.title}</span>
                        </div>
                      </Link>
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.preventDefault(); handleEditBoardBg(board); }}
                          className="p-1.5 rounded bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors"
                          title="Change background"
                        >
                          <Palette size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteBoard(e, board.id)}
                          className="p-1.5 rounded bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors"
                          title="Delete board"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowCreate(true)}
                    className="h-24 rounded-[3px] bg-[#091e420f] hover:bg-[#091e4214] transition-colors text-[#172b4d] text-sm flex items-center justify-center cursor-pointer"
                  >
                    Create new board
                  </button>
                </div>
              </>
            )}

            {/* View: Table */}
            {viewMode === "table" && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Table size={20} className="text-[#172b4d]" />
                  <h2 className="text-base font-semibold text-[#172b4d]">Table View</h2>
                </div>
                {allCards.length === 0 ? (
                  <div className="text-center py-16 text-[#5e6c84]">
                    <Table size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No cards yet. Create a board and add some cards to see them here.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-[#dfe1e6] overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f4f5f7] text-left text-[#5e6c84]">
                          <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Card</th>
                          <th className="px-4 py-2.5 font-semibold whitespace-nowrap">List</th>
                          <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Board</th>
                          <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Labels</th>
                          <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Due Date</th>
                          <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Members</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allCards.map((card) => (
                          <tr key={card.id} onClick={() => setSelectedCard(card)} className="border-t border-[#dfe1e6] hover:bg-[#f9fafc] transition-colors cursor-pointer">
                            <td className="px-4 py-2.5 text-[#172b4d] font-medium max-w-[200px] truncate">{card.title}</td>
                            <td className="px-4 py-2.5 text-[#5e6c84] whitespace-nowrap">{card.listName}</td>
                            <td className="px-4 py-2.5 text-[#5e6c84] whitespace-nowrap">{card.boardName}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex gap-1 flex-wrap">
                                {card.labels?.map((cl) => (
                                  <span
                                    key={cl.labelId}
                                    className="px-2 py-0.5 rounded-sm text-[10px] font-semibold text-white"
                                    style={{ backgroundColor: cl.label.color }}
                                  >
                                    {cl.label.name}
                                  </span>
                                ))}
                                {(!card.labels || card.labels.length === 0) && <span className="text-[#b3bac5]">—</span>}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              {card.dueDate ? (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs ${
                                  isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate))
                                    ? "bg-[#ffd5d2] text-[#ae2e24]"
                                    : isToday(new Date(card.dueDate))
                                    ? "bg-[#f5cd47] text-[#172b4d]"
                                    : "bg-[#091e420f] text-[#5e6c84]"
                                }`}>
                                  <Clock size={10} />
                                  {format(new Date(card.dueDate), "MMM d")}
                                </span>
                              ) : (
                                <span className="text-[#b3bac5]">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex -space-x-1">
                                {card.members?.slice(0, 3).map((cm) => (
                                  <div
                                    key={cm.memberId}
                                    className="w-6 h-6 rounded-full bg-[#0079bf] flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white"
                                    title={cm.member.name}
                                  >
                                    {cm.member.name.charAt(0).toUpperCase()}
                                  </div>
                                ))}
                                {(!card.members || card.members.length === 0) && <span className="text-[#b3bac5]">—</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* View: Calendar */}
            {viewMode === "calendar" && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-[#172b4d]" />
                  <h2 className="text-base font-semibold text-[#172b4d]">Calendar View</h2>
                </div>
                <CalendarView cards={allCards} onCardClick={setSelectedCard} />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#1d2125] mt-auto">
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <rect x="1" y="1" width="10" height="20" rx="2" opacity="0.9" />
                  <rect x="13" y="1" width="10" height="12" rx="2" opacity="0.9" />
                </svg>
                <span className="text-base font-bold text-white">Trello</span>
              </div>
              <p className="text-xs text-[#9fadbc] leading-relaxed">
                A Kanban-style project management tool built for the Scaler SDE Intern Assignment.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#b6c2cf] uppercase tracking-wider mb-3">About</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Trello Clone</span></li>
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Built with Next.js</span></li>
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Express.js Backend</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#b6c2cf] uppercase tracking-wider mb-3">Tech Stack</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">React / Next.js</span></li>
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">PostgreSQL</span></li>
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Prisma ORM</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#b6c2cf] uppercase tracking-wider mb-3">Features</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Drag & Drop</span></li>
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Labels & Members</span></li>
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Search & Filter</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#b6c2cf] uppercase tracking-wider mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Checklists</span></li>
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Comments</span></li>
                <li><span className="text-sm text-[#9fadbc] hover:text-white transition-colors cursor-default">Attachments</span></li>
              </ul>
            </div>
          </div>
          <hr className="border-[#2c333a] my-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#9fadbc]">Built by Madhav for Scaler SDE Intern Assignment</p>
            <p className="text-xs text-[#596773]">Trello is a trademark of Atlassian. This is a clone for educational purposes.</p>
          </div>
        </div>
      </footer>

      {/* Create Board Modal */}
      {showCreate && (
        <BoardBgModal
          title="Create board"
          selectedBg={selectedBg}
          onSelectBg={setSelectedBg}
          onClose={() => { setShowCreate(false); setNewTitle(""); setSelectedBg(BOARD_GRADIENTS[0]); }}
          fileInputRef={fileInputRef}
        >
          <p className="text-xs font-semibold text-[#9fadbc] mb-1">
            Board title <span className="text-red-400">*</span>
          </p>
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
            className="w-full px-3 py-2 text-sm rounded-[3px] bg-[#22272b] border border-[#738496] text-[#b6c2cf] placeholder-[#738496] focus:outline-none focus:border-[#579dff] mb-1"
          />
          {!newTitle.trim() && (
            <p className="text-xs text-[#ef5c48] mb-2">Board title is required</p>
          )}
          <button
            onClick={handleCreateBoard}
            disabled={!newTitle.trim()}
            className="w-full mt-2 px-3 py-2 text-sm bg-[#579dff] text-[#1d2125] rounded-[3px] font-semibold hover:bg-[#85b8ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
        </BoardBgModal>
      )}

      {/* Edit Board Background Modal */}
      {editingBoard && (
        <BoardBgModal
          title="Change background"
          selectedBg={editBg}
          onSelectBg={setEditBg}
          onClose={() => setEditingBoard(null)}
          fileInputRef={editFileInputRef}
        >
          <button
            onClick={handleSaveBoardBg}
            className="w-full mt-1 px-3 py-2 text-sm bg-[#579dff] text-[#1d2125] rounded-[3px] font-semibold hover:bg-[#85b8ff] transition-colors"
          >
            Save
          </button>
        </BoardBgModal>
      )}

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          labels={allLabels}
          members={members}
          onClose={() => setSelectedCard(null)}
          onUpdate={() => { loadBoards(); setSelectedCard(null); }}
        />
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} />
    </div>
  );
}

/* Calendar View Component */
function CalendarView({ cards, onCardClick }: { cards: (Card & { boardName: string; listName: string })[]; onCardClick: (card: Card) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = format(currentDate, "MMMM yyyy");

  const cardsWithDue = cards.filter((c) => c.dueDate);

  const getCardsForDay = (day: number) => {
    return cardsWithDue.filter((c) => {
      const d = new Date(c.dueDate!);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  if (cardsWithDue.length === 0 && cards.length > 0) {
    return (
      <div className="text-center py-16 text-[#5e6c84]">
        <Calendar size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">No cards with due dates. Add due dates to cards to see them on the calendar.</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-16 text-[#5e6c84]">
        <Calendar size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">No cards yet. Create a board and add some cards to see them here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#dfe1e6] overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f4f5f7] border-b border-[#dfe1e6]">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="px-3 py-1 text-sm text-[#5e6c84] hover:bg-[#091e420f] rounded transition-colors"
        >
          &larr; Prev
        </button>
        <h3 className="text-sm font-semibold text-[#172b4d]">{monthName}</h3>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="px-3 py-1 text-sm text-[#5e6c84] hover:bg-[#091e420f] rounded transition-colors"
        >
          Next &rarr;
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-[#f4f5f7]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-2 py-2 text-[11px] font-semibold text-[#5e6c84] text-center uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayCards = day ? getCardsForDay(day) : [];
          const isTodayCell = isCurrentMonth && day === today.getDate();
          return (
            <div
              key={i}
              className={`min-h-[90px] border-t border-r border-[#dfe1e6] p-1.5 ${!day ? "bg-[#f9fafc]" : "hover:bg-[#f4f5f7]"} transition-colors`}
            >
              {day && (
                <>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isTodayCell ? "bg-[#0c66e4] text-white" : "text-[#5e6c84]"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayCards.slice(0, 3).map((card) => (
                      <div
                        key={card.id}
                        onClick={() => onCardClick(card)}
                        className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#0c66e4] text-white truncate cursor-pointer hover:brightness-110"
                        title={`${card.title} (${card.listName} - ${card.boardName})`}
                      >
                        {card.title}
                      </div>
                    ))}
                    {dayCards.length > 3 && (
                      <div className="text-[10px] text-[#5e6c84] px-1">+{dayCards.length - 3} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Board Background Picker Modal */
function BoardBgModal({
  title,
  selectedBg,
  onSelectBg,
  onClose,
  fileInputRef,
  children,
}: {
  title: string;
  selectedBg: string;
  onSelectBg: (bg: string) => void;
  onClose: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[80px]">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[304px] bg-[#282e33] rounded-lg shadow-2xl animate-modal-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-[#9fadbc] hover:text-white rounded hover:bg-white/10 z-10"
        >
          <X size={16} />
        </button>

        <div className="p-4 pb-2">
          <p className="text-sm font-semibold text-[#b6c2cf] text-center mb-2">{title}</p>
          <div
            className="h-[120px] rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: selectedBg }}
          >
            <svg width="186" height="90" viewBox="0 0 186 90" fill="none" className="opacity-80">
              <rect x="5" y="5" width="50" height="80" rx="4" fill="rgba(255,255,255,0.25)" />
              <rect x="10" y="12" width="40" height="5" rx="1" fill="rgba(255,255,255,0.4)" />
              <rect x="10" y="22" width="40" height="12" rx="2" fill="rgba(255,255,255,0.5)" />
              <rect x="10" y="38" width="40" height="12" rx="2" fill="rgba(255,255,255,0.5)" />
              <rect x="10" y="54" width="40" height="12" rx="2" fill="rgba(255,255,255,0.5)" />
              <rect x="65" y="5" width="50" height="60" rx="4" fill="rgba(255,255,255,0.25)" />
              <rect x="70" y="12" width="40" height="5" rx="1" fill="rgba(255,255,255,0.4)" />
              <rect x="70" y="22" width="40" height="12" rx="2" fill="rgba(255,255,255,0.5)" />
              <rect x="70" y="38" width="40" height="12" rx="2" fill="rgba(255,255,255,0.5)" />
              <rect x="125" y="5" width="50" height="45" rx="4" fill="rgba(255,255,255,0.25)" />
              <rect x="130" y="12" width="40" height="5" rx="1" fill="rgba(255,255,255,0.4)" />
              <rect x="130" y="22" width="40" height="12" rx="2" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
        </div>

        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-[#9fadbc] mb-2">Background</p>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {BOARD_GRADIENTS.map((bg, i) => (
              <button
                key={i}
                onClick={() => onSelectBg(bg)}
                className={`h-10 rounded-sm transition-all ${selectedBg === bg ? "ring-2 ring-[#579dff] ring-offset-1 ring-offset-[#282e33]" : "hover:opacity-80"}`}
                style={{ background: bg }}
              />
            ))}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-[#22272b] text-[#b6c2cf] rounded-[3px] hover:bg-[#3d444d] transition-colors mb-4 border border-[#3d444d]"
          >
            <Upload size={14} />
            Upload image
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
