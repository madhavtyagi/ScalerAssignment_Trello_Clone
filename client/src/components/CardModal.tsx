"use client";

import { useState, useEffect, useRef } from "react";
import { Card, Label, Member } from "@/types";
import * as api from "@/lib/api";
import { format } from "date-fns";
import {
  X, Tag, Clock, CheckSquare, Users, MessageSquare,
  Trash2, AlignLeft, CreditCard, Archive, Paperclip, ExternalLink, Image
} from "lucide-react";

interface CardModalProps {
  card: Card;
  labels: Label[];
  members: Member[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function CardModal({ card, labels, members, onClose, onUpdate }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split("T")[0] : "");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<number, string>>({});
  const [commentText, setCommentText] = useState("");
  const [showAttachForm, setShowAttachForm] = useState(false);
  const [attachName, setAttachName] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [attachTab, setAttachTab] = useState<"url" | "file">("file");
  const [uploading, setUploading] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  const labelsRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  const cardLabels = card.labels.map((cl) => cl.labelId);
  const cardMembers = card.members.map((cm) => cm.memberId);

  const coverColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#8b5cf6", "#ec4899", "#6b7280"];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showLabels && labelsRef.current && !labelsRef.current.contains(target)) setShowLabels(false);
      if (showMembers && membersRef.current && !membersRef.current.contains(target)) setShowMembers(false);
      if (showDatePicker && dateRef.current && !dateRef.current.contains(target)) setShowDatePicker(false);
      if (showAddChecklist && checklistRef.current && !checklistRef.current.contains(target)) setShowAddChecklist(false);
      if (showAttachForm && attachRef.current && !attachRef.current.contains(target)) setShowAttachForm(false);
      if (showCoverPicker && coverRef.current && !coverRef.current.contains(target)) setShowCoverPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLabels, showMembers, showDatePicker, showAddChecklist, showAttachForm, showCoverPicker]);

  const handleTitleUpdate = async () => {
    if (title.trim() && title.trim() !== card.title) {
      await api.updateCard(card.id, { title: title.trim() });
      onUpdate();
    }
    setEditingTitle(false);
  };

  const handleDescriptionSave = async () => {
    await api.updateCard(card.id, { description: description || null });
    setEditingDesc(false);
    onUpdate();
  };

  const handleToggleLabel = async (labelId: number) => {
    if (cardLabels.includes(labelId)) {
      await api.removeLabelFromCard(card.id, labelId);
    } else {
      await api.addLabelToCard(card.id, labelId);
    }
    onUpdate();
  };

  const handleToggleMember = async (memberId: number) => {
    if (cardMembers.includes(memberId)) {
      await api.removeMemberFromCard(card.id, memberId);
    } else {
      await api.addMemberToCard(card.id, memberId);
    }
    onUpdate();
  };

  const handleDueDateSave = async () => {
    await api.updateCard(card.id, { dueDate: dueDate || null });
    setShowDatePicker(false);
    onUpdate();
  };

  const handleRemoveDueDate = async () => {
    await api.updateCard(card.id, { dueDate: null });
    setDueDate("");
    setShowDatePicker(false);
    onUpdate();
  };

  const handleArchive = async () => {
    await api.updateCard(card.id, { isArchived: true });
    onClose();
  };

  const handleDelete = async () => {
    if (confirm("Permanently delete this card?")) {
      await api.deleteCard(card.id);
      onClose();
    }
  };

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    await api.createChecklist({ title: newChecklistTitle.trim(), cardId: card.id });
    setNewChecklistTitle("");
    setShowAddChecklist(false);
    onUpdate();
  };

  const handleDeleteChecklist = async (id: number) => {
    await api.deleteChecklist(id);
    onUpdate();
  };

  const handleAddItem = async (checklistId: number) => {
    const text = newItemTexts[checklistId]?.trim();
    if (!text) return;
    await api.addChecklistItem(checklistId, text);
    setNewItemTexts((prev) => ({ ...prev, [checklistId]: "" }));
    onUpdate();
  };

  const handleToggleItem = async (itemId: number, isCompleted: boolean) => {
    await api.updateChecklistItem(itemId, { isCompleted: !isCompleted });
    onUpdate();
  };

  const handleDeleteItem = async (itemId: number) => {
    await api.deleteChecklistItem(itemId);
    onUpdate();
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const currentMember = members.find((m) => m.name === "Madhav") || members[0];
    if (!currentMember) return;
    await api.createComment({ text: commentText.trim(), cardId: card.id, memberId: currentMember.id });
    setCommentText("");
    onUpdate();
  };

  const handleAddAttachment = async () => {
    if (!attachUrl.trim()) return;
    const name = attachName.trim() || new URL(attachUrl).hostname;
    await api.addAttachment(card.id, { name, url: attachUrl.trim() });
    setAttachName("");
    setAttachUrl("");
    setShowAttachForm(false);
    onUpdate();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadAttachment(card.id, file, attachName.trim() || undefined);
      setAttachName("");
      setShowAttachForm(false);
      onUpdate();
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSetCover = async (color: string | null) => {
    await api.updateCard(card.id, { coverColor: color });
    setShowCoverPicker(false);
    onUpdate();
  };

  const isImageUrl = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);

  const resolveUrl = (url: string) => {
    if (url.startsWith("/uploads/")) {
      const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/api$/, "");
      return `${base}${url}`;
    }
    return url;
  };

  const closeAllDropdowns = () => {
    setShowLabels(false);
    setShowMembers(false);
    setShowDatePicker(false);
    setShowAddChecklist(false);
    setShowAttachForm(false);
    setShowCoverPicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-12 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="relative w-full max-w-[768px] bg-[#f4f5f7] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12),0_24px_60px_rgba(0,0,0,0.2)] mx-4 mb-8 animate-modal-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-[#626f86] hover:bg-[#091e420f] rounded-full z-10 cursor-pointer transition-colors duration-200 hover:text-[#172b4d]"
        >
          <X size={20} />
        </button>

        {/* Cover color */}
        {card.coverColor && (
          <div className="h-[116px] rounded-t-xl transition-colors duration-300" style={{ backgroundColor: card.coverColor }} />
        )}

        <div className="flex flex-col md:flex-row gap-4 p-6 pt-5">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-start gap-3 mb-4">
              <CreditCard size={22} className="text-[#626f86] mt-0.5 shrink-0" />
              <div className="flex-1">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleUpdate}
                    onKeyDown={(e) => { if (e.key === "Enter") handleTitleUpdate(); }}
                    className="w-full text-xl font-semibold bg-white text-[#172b4d] px-2 py-1 rounded-[3px] border-2 border-[#0c66e4] focus:outline-none"
                  />
                ) : (
                  <h2
                    onClick={() => setEditingTitle(true)}
                    className="text-xl font-semibold text-[#172b4d] cursor-pointer hover:bg-[#091e420f] px-2 py-1 rounded-[3px] -ml-2 transition-colors duration-200 leading-7"
                  >
                    {card.title}
                  </h2>
                )}
                <p className="text-[13px] text-[#626f86] mt-1 ml-0.5">
                  in list <span className="underline font-semibold">{card.list?.title}</span>
                </p>
              </div>
            </div>

            {/* Labels & Members & Due date inline display */}
            <div className="flex flex-wrap gap-4 mb-5 ml-8">
              {card.labels.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-[#5e6c84] mb-1 uppercase tracking-wide">Labels</p>
                  <div className="flex flex-wrap gap-1">
                    {card.labels.map((cl) => (
                      <span
                        key={cl.labelId}
                        className="px-3 py-1 rounded-[3px] text-xs font-semibold text-white min-w-[48px] text-center"
                        style={{ backgroundColor: cl.label.color }}
                      >
                        {cl.label.name || ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {card.members.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-[#5e6c84] mb-1 uppercase tracking-wide">Members</p>
                  <div className="flex flex-wrap gap-1">
                    {card.members.map((cm) => (
                      <div
                        key={cm.memberId}
                        className="w-8 h-8 rounded-full bg-[#0079bf] flex items-center justify-center text-xs font-bold text-white"
                        title={cm.member.name}
                      >
                        {cm.member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {card.dueDate && (
                <div>
                  <p className="text-[11px] font-semibold text-[#5e6c84] mb-1 uppercase tracking-wide">Due date</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#091e420f] text-[#172b4d] rounded-[3px]">
                    <Clock size={14} />
                    {format(new Date(card.dueDate), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <AlignLeft size={20} className="text-[#5e6c84]" />
                <h3 className="text-base font-semibold text-[#172b4d]">Description</h3>
              </div>
              <div className="ml-8">
                {editingDesc ? (
                  <>
                    <textarea
                      autoFocus
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a more detailed description..."
                      className="w-full min-h-[120px] px-3 py-2 text-sm rounded-[3px] bg-white border border-[#091e4224] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0079bf] resize-y"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleDescriptionSave}
                        className="px-3 py-1.5 text-sm bg-[#0c66e4] text-white rounded-[3px] font-semibold hover:bg-[#0055cc] transition-colors duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingDesc(false); setDescription(card.description || ""); }}
                        className="px-3 py-1.5 text-sm text-[#5e6c84] hover:text-[#172b4d] hover:bg-[#091e420f] rounded-[3px] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => setEditingDesc(true)}
                    className={`min-h-[56px] px-3 py-2 text-sm rounded-[3px] cursor-pointer transition-colors ${
                      description
                        ? "text-[#172b4d] hover:bg-[#091e420f]"
                        : "bg-[#091e420f] text-[#5e6c84] hover:bg-[#091e4224]"
                    }`}
                  >
                    {description || "Add a more detailed description..."}
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {(card.attachments?.length || 0) > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Paperclip size={20} className="text-[#5e6c84]" />
                  <h3 className="text-base font-semibold text-[#172b4d]">Attachments</h3>
                </div>
                <div className="ml-8 space-y-2">
                  {card.attachments!.map((att) => {
                    const fullUrl = resolveUrl(att.url);
                    return (
                    <div key={att.id} className="flex items-center gap-3 p-2 rounded-[3px] bg-white group hover:bg-[#f4f5f7] transition-colors border border-[#091e4224]">
                      {isImageUrl(att.url) ? (
                        <div className="w-20 h-14 rounded bg-[#dfe1e6] overflow-hidden shrink-0">
                          <img src={fullUrl} alt={att.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-14 rounded bg-[#dfe1e6] flex items-center justify-center shrink-0">
                          <ExternalLink size={20} className="text-[#5e6c84]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-[#0c66e4] hover:underline truncate block"
                        >
                          {att.name}
                        </a>
                        <p className="text-xs text-[#5e6c84] mt-0.5">
                          {format(new Date(att.createdAt), "MMM d 'at' h:mm a")}
                        </p>
                      </div>
                      <button
                        onClick={() => api.deleteAttachment(att.id).then(onUpdate)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#5e6c84] hover:text-red-600 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Checklists */}
            {card.checklists.map((checklist) => {
              const total = checklist.items.length;
              const completed = checklist.items.filter((i) => i.isCompleted).length;
              const progress = total > 0 ? (completed / total) * 100 : 0;

              return (
                <div key={checklist.id} className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckSquare size={20} className="text-[#5e6c84]" />
                    <h3 className="flex-1 text-base font-semibold text-[#172b4d]">{checklist.title}</h3>
                    <button
                      onClick={() => handleDeleteChecklist(checklist.id)}
                      className="px-3 py-1 text-xs bg-[#091e420f] text-[#5e6c84] rounded-[3px] hover:bg-[#091e4224] transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="ml-8 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#5e6c84] w-8">{Math.round(progress)}%</span>
                      <div className="flex-1 h-2 bg-[#091e4224] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress === 100 ? "bg-[#1f845a]" : "bg-[#0c66e4]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="ml-8 space-y-0.5">
                    {checklist.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 group py-1.5 px-2 rounded-[3px] hover:bg-[#091e420f] transition-colors">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => handleToggleItem(item.id, item.isCompleted)}
                          className="w-4 h-4 accent-[#0c66e4] cursor-pointer rounded"
                        />
                        <span className={`flex-1 text-sm transition-all ${item.isCompleted ? "line-through text-[#5e6c84]" : "text-[#172b4d]"}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#5e6c84] hover:text-red-600 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add an item"
                        value={newItemTexts[checklist.id] || ""}
                        onChange={(e) => setNewItemTexts((prev) => ({ ...prev, [checklist.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(checklist.id); }}
                        className="flex-1 px-3 py-1.5 text-sm rounded-[3px] bg-white border border-[#091e4224] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0079bf]"
                      />
                      <button
                        onClick={() => handleAddItem(checklist.id)}
                        className="px-3 py-1.5 text-xs bg-[#0c66e4] text-white rounded-[3px] font-semibold hover:bg-[#0055cc] transition-colors duration-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Comments / Activity */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare size={20} className="text-[#5e6c84]" />
                <h3 className="text-base font-semibold text-[#172b4d]">Activity</h3>
              </div>
              <div className="ml-8">
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#0079bf] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    M
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-3 py-2 text-sm rounded-[3px] bg-white border border-[#091e4224] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0079bf] resize-none min-h-[36px]"
                    />
                    {commentText && (
                      <button
                        onClick={handleAddComment}
                        className="mt-2 px-3 py-1.5 text-sm bg-[#0c66e4] text-white rounded-[3px] font-semibold hover:bg-[#0055cc] transition-colors duration-200"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>

                {card.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3 mb-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-[#0079bf] flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {comment.member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#172b4d]">{comment.member.name}</span>
                        <span className="text-xs text-[#5e6c84]">
                          {format(new Date(comment.createdAt), "MMM d 'at' h:mm a")}
                        </span>
                      </div>
                      <div className="mt-1 px-3 py-2 text-sm bg-white text-[#172b4d] rounded-[3px] border border-[#091e4224] shadow-sm">
                        {comment.text}
                      </div>
                      <button
                        onClick={() => api.deleteComment(comment.id).then(onUpdate)}
                        className="text-xs text-[#5e6c84] hover:text-red-600 mt-1 underline transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="w-full md:w-[168px] shrink-0 space-y-1">
            <p className="text-[12px] font-semibold text-[#44546f] mb-1.5 uppercase tracking-wide">Add to card</p>

            {/* Labels */}
            <div className="relative" ref={labelsRef}>
              <button
                onClick={() => { closeAllDropdowns(); setShowLabels(!showLabels); }}
                className="btn-press w-full flex items-center gap-2 px-3 py-1.5 text-sm bg-[#091e420f] text-[#44546f] rounded-[3px] hover:bg-[#091e4224] text-left transition-all duration-200 font-medium"
              >
                <Tag size={14} /> Labels
              </button>
              {showLabels && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] p-3 z-20 animate-scale-in">
                  <p className="text-sm font-semibold text-[#172b4d] mb-2 text-center">Labels</p>
                  <hr className="border-[#091e4224] mb-2" />
                  <div className="space-y-1">
                    {labels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleToggleLabel(label.id)}
                        className="w-full flex items-center gap-2 p-1 rounded hover:bg-[#091e420f] transition-colors"
                      >
                        <div
                          className="flex-1 h-8 rounded-[3px] flex items-center px-3 text-sm font-semibold text-white"
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </div>
                        {cardLabels.includes(label.id) && (
                          <span className="text-[#0c66e4] text-lg">&#10003;</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Members */}
            <div className="relative" ref={membersRef}>
              <button
                onClick={() => { closeAllDropdowns(); setShowMembers(!showMembers); }}
                className="btn-press w-full flex items-center gap-2 px-3 py-1.5 text-sm bg-[#091e420f] text-[#44546f] rounded-[3px] hover:bg-[#091e4224] text-left transition-all duration-200 font-medium"
              >
                <Users size={14} /> Members
              </button>
              {showMembers && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] p-3 z-20 animate-scale-in">
                  <p className="text-sm font-semibold text-[#172b4d] mb-2 text-center">Members</p>
                  <hr className="border-[#091e4224] mb-2" />
                  <div className="space-y-1">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleToggleMember(member.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#091e420f] transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#0079bf] flex items-center justify-center text-xs font-bold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1 text-sm text-[#172b4d] text-left">{member.name}</span>
                        {cardMembers.includes(member.id) && (
                          <span className="text-[#0c66e4] text-lg">&#10003;</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="relative" ref={dateRef}>
              <button
                onClick={() => { closeAllDropdowns(); setShowDatePicker(!showDatePicker); }}
                className="btn-press w-full flex items-center gap-2 px-3 py-1.5 text-sm bg-[#091e420f] text-[#44546f] rounded-[3px] hover:bg-[#091e4224] text-left transition-all duration-200 font-medium"
              >
                <Clock size={14} /> Dates
              </button>
              {showDatePicker && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] p-3 z-20 animate-scale-in">
                  <p className="text-sm font-semibold text-[#172b4d] mb-2 text-center">Due Date</p>
                  <hr className="border-[#091e4224] mb-2" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-[3px] bg-[#091e420f] border border-[#091e4224] text-[#172b4d] focus:outline-none focus:border-[#0079bf]"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleDueDateSave}
                      className="flex-1 px-3 py-1.5 text-sm bg-[#0c66e4] text-white rounded-[3px] font-semibold hover:bg-[#0055cc] transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleRemoveDueDate}
                      className="px-3 py-1.5 text-sm bg-[#091e420f] text-[#5e6c84] rounded-[3px] hover:bg-[#091e4224] transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="relative" ref={checklistRef}>
              <button
                onClick={() => { closeAllDropdowns(); setShowAddChecklist(!showAddChecklist); }}
                className="btn-press w-full flex items-center gap-2 px-3 py-1.5 text-sm bg-[#091e420f] text-[#44546f] rounded-[3px] hover:bg-[#091e4224] text-left transition-all duration-200 font-medium"
              >
                <CheckSquare size={14} /> Checklist
              </button>
              {showAddChecklist && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] p-3 z-20 animate-scale-in">
                  <p className="text-sm font-semibold text-[#172b4d] mb-2 text-center">Add Checklist</p>
                  <hr className="border-[#091e4224] mb-2" />
                  <input
                    autoFocus
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddChecklist(); }}
                    placeholder="Checklist title..."
                    className="w-full px-3 py-1.5 text-sm rounded-[3px] bg-[#091e420f] border border-[#091e4224] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0079bf]"
                  />
                  <button
                    onClick={handleAddChecklist}
                    className="w-full mt-2 px-3 py-1.5 text-sm bg-[#0c66e4] text-white rounded-[3px] font-semibold hover:bg-[#0055cc] transition-colors duration-200"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Attachment */}
            <div className="relative" ref={attachRef}>
              <button
                onClick={() => { closeAllDropdowns(); setShowAttachForm(!showAttachForm); }}
                className="btn-press w-full flex items-center gap-2 px-3 py-1.5 text-sm bg-[#091e420f] text-[#44546f] rounded-[3px] hover:bg-[#091e4224] text-left transition-all duration-200 font-medium"
              >
                <Paperclip size={14} /> Attachment
              </button>
              {showAttachForm && (
                <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-lg shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] p-3 z-20 animate-scale-in">
                  <p className="text-sm font-semibold text-[#172b4d] mb-2 text-center">Attach</p>
                  <hr className="border-[#091e4224] mb-2" />
                  <div className="flex mb-3 bg-[#091e420f] rounded-[3px] p-0.5">
                    <button
                      onClick={() => setAttachTab("file")}
                      className={`flex-1 text-xs font-semibold py-1.5 rounded-[2px] transition-colors ${attachTab === "file" ? "bg-white text-[#172b4d] shadow-sm" : "text-[#5e6c84] hover:text-[#172b4d]"}`}
                    >
                      Upload file
                    </button>
                    <button
                      onClick={() => setAttachTab("url")}
                      className={`flex-1 text-xs font-semibold py-1.5 rounded-[2px] transition-colors ${attachTab === "url" ? "bg-white text-[#172b4d] shadow-sm" : "text-[#5e6c84] hover:text-[#172b4d]"}`}
                    >
                      Link (URL)
                    </button>
                  </div>
                  {attachTab === "file" ? (
                    <>
                      <input
                        type="text"
                        value={attachName}
                        onChange={(e) => setAttachName(e.target.value)}
                        placeholder="Display name (optional)"
                        className="w-full px-3 py-1.5 text-sm rounded-[3px] bg-[#091e420f] border border-[#091e4224] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0079bf] mb-2"
                      />
                      <label className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-[3px] font-semibold transition-colors cursor-pointer ${uploading ? "bg-[#091e420f] text-[#5e6c84]" : "bg-[#0c66e4] text-white hover:bg-[#0055cc]"}`}>
                        <Paperclip size={14} />
                        {uploading ? "Uploading..." : "Choose a file"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <input
                        autoFocus
                        type="url"
                        value={attachUrl}
                        onChange={(e) => setAttachUrl(e.target.value)}
                        placeholder="Paste any link here..."
                        className="w-full px-3 py-1.5 text-sm rounded-[3px] bg-[#091e420f] border border-[#091e4224] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0079bf] mb-2"
                      />
                      <input
                        type="text"
                        value={attachName}
                        onChange={(e) => setAttachName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddAttachment(); }}
                        placeholder="Display name (optional)"
                        className="w-full px-3 py-1.5 text-sm rounded-[3px] bg-[#091e420f] border border-[#091e4224] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0079bf]"
                      />
                      <button
                        onClick={handleAddAttachment}
                        disabled={!attachUrl.trim()}
                        className="w-full mt-2 px-3 py-1.5 text-sm bg-[#0c66e4] text-white rounded-[3px] font-semibold hover:bg-[#0055cc] disabled:opacity-40 transition-colors"
                      >
                        Attach
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cover */}
            <div className="relative" ref={coverRef}>
              <button
                onClick={() => { closeAllDropdowns(); setShowCoverPicker(!showCoverPicker); }}
                className="btn-press w-full flex items-center gap-2 px-3 py-1.5 text-sm bg-[#091e420f] text-[#44546f] rounded-[3px] hover:bg-[#091e4224] text-left transition-all duration-200 font-medium"
              >
                <Image size={14} /> Cover
              </button>
              {showCoverPicker && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] p-3 z-20 animate-scale-in">
                  <p className="text-sm font-semibold text-[#172b4d] mb-2 text-center">Card Cover</p>
                  <hr className="border-[#091e4224] mb-2" />
                  <div className="grid grid-cols-4 gap-1.5">
                    {coverColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleSetCover(color)}
                        className={`h-9 rounded-[3px] transition-all hover:scale-105 ${card.coverColor === color ? "ring-2 ring-[#0c66e4] ring-offset-1" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {card.coverColor && (
                    <button
                      onClick={() => handleSetCover(null)}
                      className="w-full mt-2 px-3 py-1.5 text-xs bg-[#091e420f] text-[#5e6c84] rounded-[3px] hover:bg-[#091e4224] transition-colors"
                    >
                      Remove cover
                    </button>
                  )}
                </div>
              )}
            </div>

            <hr className="border-[#091e4224] my-3" />
            <p className="text-[12px] font-semibold text-[#44546f] mb-1.5 uppercase tracking-wide">Actions</p>

            <button
              onClick={handleArchive}
              className="btn-press w-full flex items-center gap-2 px-3 py-1.5 text-sm bg-[#091e420f] text-[#44546f] rounded-[3px] hover:bg-[#091e4224] text-left transition-all duration-200 font-medium"
            >
              <Archive size={14} /> Archive
            </button>
            <button
              onClick={handleDelete}
              className="btn-press w-full flex items-center gap-2 px-3 py-1.5 text-sm bg-[#091e420f] text-[#ae2e24] rounded-[3px] hover:bg-[#ffeceb] text-left transition-all duration-200 font-medium"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
