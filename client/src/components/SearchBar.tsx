"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, Label, Member } from "@/types";
import * as api from "@/lib/api";
import { Search, X, Filter } from "lucide-react";

interface SearchBarProps {
  boardId: number;
  onCardClick: (card: Card) => void;
  labels: Label[];
  members: Member[];
}

export default function SearchBar({ boardId, onCardClick, labels, members }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Card[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterLabel, setFilterLabel] = useState<string>("");
  const [filterMember, setFilterMember] = useState<string>("");
  const [filterDue, setFilterDue] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = useCallback(async () => {
    setSearching(true);
    try {
      const params: Record<string, string> = { boardId: String(boardId) };
      if (query.trim()) params.q = query.trim();
      if (filterLabel) params.labelId = filterLabel;
      if (filterMember) params.memberId = filterMember;
      if (filterDue) params.dueBefore = filterDue;
      const data = await api.searchCards(params);
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  }, [boardId, query, filterLabel, filterMember, filterDue]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (query.trim() || filterLabel || filterMember || filterDue) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, filterLabel, filterMember, filterDue, open, handleSearch]);

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setFilterLabel("");
    setFilterMember("");
    setFilterDue("");
    setShowFilters(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/20 rounded-[3px] transition-colors duration-200"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Search</span>
      </button>

      {/* Full-screen overlay search panel */}
      {open && (
        <div ref={containerRef} className="fixed top-2 right-4 w-[380px] z-[200]">
          {/* Search input */}
          <div className="flex items-center gap-2 bg-white rounded-[8px] px-3 py-2.5 shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)]">
            <Search size={16} className="text-[#5e6c84] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards..."
              className="flex-1 text-sm bg-transparent text-[#172b4d] placeholder-[#5e6c84] focus:outline-none"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 rounded hover:bg-[#091e420f] transition-colors ${showFilters ? "text-[#0c66e4]" : "text-[#5e6c84]"}`}
              title="Toggle filters"
            >
              <Filter size={14} />
            </button>
            <button
              onClick={closeSearch}
              className="p-1 text-[#5e6c84] hover:text-[#172b4d] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-2 p-3 bg-white rounded-[8px] shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] space-y-2.5 animate-fade-in">
              <div>
                <label className="text-xs text-[#5e6c84] font-semibold">Label</label>
                <select
                  value={filterLabel}
                  onChange={(e) => setFilterLabel(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-[#091e420f] text-[#172b4d] border border-[#091e4224] rounded-[3px] focus:outline-none focus:border-[#0079bf]"
                >
                  <option value="">All labels</option>
                  {labels.map((l) => (
                    <option key={l.id} value={l.id}>{l.name || l.color}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#5e6c84] font-semibold">Member</label>
                <select
                  value={filterMember}
                  onChange={(e) => setFilterMember(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-[#091e420f] text-[#172b4d] border border-[#091e4224] rounded-[3px] focus:outline-none focus:border-[#0079bf]"
                >
                  <option value="">All members</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#5e6c84] font-semibold">Due before</label>
                <input
                  type="date"
                  value={filterDue}
                  onChange={(e) => setFilterDue(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-[#091e420f] text-[#172b4d] border border-[#091e4224] rounded-[3px] focus:outline-none focus:border-[#0079bf]"
                />
              </div>
            </div>
          )}

          {/* Results dropdown */}
          {(results.length > 0 || searching) && (
            <div className="mt-2 bg-white rounded-[8px] shadow-[0_8px_16px_-4px_rgba(9,30,66,0.25),0_0_0_1px_rgba(9,30,66,0.08)] max-h-80 overflow-y-auto">
              {searching ? (
                <div className="p-3 text-sm text-[#5e6c84] text-center">Searching...</div>
              ) : (
                results.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => { onCardClick(card); closeSearch(); }}
                    className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-[#091e420f] border-b border-[#091e4224] last:border-0 transition-colors duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#172b4d] truncate">{card.title}</p>
                      <p className="text-xs text-[#5e6c84] mt-0.5">in {card.list?.title}</p>
                    </div>
                    {card.labels?.length > 0 && (
                      <div className="flex gap-0.5 shrink-0">
                        {card.labels.slice(0, 3).map((cl) => (
                          <span
                            key={cl.labelId}
                            className="w-2 h-6 rounded-sm"
                            style={{ backgroundColor: cl.label.color }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
