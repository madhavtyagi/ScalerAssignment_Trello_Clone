"use client";

import { Card } from "@/types";
import { Clock, CheckSquare, MessageSquare, AlignLeft } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

interface CardItemProps {
  card: Card;
  onClick: () => void;
}

export default function CardItem({ card, onClick }: CardItemProps) {
  const hasLabels = card.labels && card.labels.length > 0;
  const hasMembers = card.members && card.members.length > 0;
  const hasDueDate = !!card.dueDate;
  const hasChecklist = card.checklists && card.checklists.length > 0;
  const hasComments = (card.comments?.length || 0) > 0;
  const hasDescription = !!card.description;

  const totalItems = card.checklists?.reduce((sum, cl) => sum + cl.items.length, 0) || 0;
  const completedItems = card.checklists?.reduce(
    (sum, cl) => sum + cl.items.filter((i) => i.isCompleted).length, 0
  ) || 0;

  const getDueDateStyle = () => {
    if (!card.dueDate) return "bg-[#091e420f] text-[#5e6c84]";
    const date = new Date(card.dueDate);
    if (isPast(date) && !isToday(date)) return "bg-[#ffd5d2] text-[#ae2e24]";
    if (isToday(date)) return "bg-[#f5cd47] text-[#172b4d]";
    return "bg-[#091e420f] text-[#5e6c84]";
  };

  return (
    <div
      onClick={onClick}
      className="card-item group mb-2 bg-white rounded-[8px] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_0_rgba(9,30,66,0.31)] cursor-pointer outline-2 outline-transparent hover:outline-[#0c66e4] outline-offset-0"
    >
      {/* Cover color */}
      {card.coverColor && (
        <div
          className="h-9 rounded-t-[8px] min-h-[36px]"
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      <div className="px-3 py-2 pb-1.5">
        {/* Labels */}
        {hasLabels && (
          <div className="flex flex-wrap gap-1 mb-1">
            {card.labels.map((cl) => (
              <span
                key={cl.labelId}
                className="inline-block h-2 w-10 rounded-full"
                style={{ backgroundColor: cl.label.color }}
                title={cl.label.name || ""}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <p className="text-[14px] text-[#172b4d] leading-5 mb-1 break-words">{card.title}</p>

        {/* Badges row */}
        {(hasDueDate || hasChecklist || hasMembers || hasComments || hasDescription) && (
          <div className="flex items-center flex-wrap gap-1 mt-1.5 mb-0.5">
            {hasDueDate && (
              <span className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-[1px] rounded-sm ${getDueDateStyle()}`}>
                <Clock size={12} />
                {format(new Date(card.dueDate!), "MMM d")}
              </span>
            )}
            {hasDescription && (
              <span className="flex items-center text-[#5e6c84] opacity-70">
                <AlignLeft size={14} />
              </span>
            )}
            {hasChecklist && (
              <span className={`flex items-center gap-1 text-[11px] font-medium ${
                completedItems === totalItems && totalItems > 0 ? "bg-[#1f845a] text-white" : "text-[#5e6c84]"
              } px-1.5 py-[1px] rounded-sm`}>
                <CheckSquare size={12} />
                {completedItems}/{totalItems}
              </span>
            )}
            {hasComments && (
              <span className="flex items-center gap-1 text-[11px] text-[#5e6c84]">
                <MessageSquare size={12} />
                {card.comments?.length}
              </span>
            )}
            {hasMembers && (
              <div className="flex -space-x-1.5 ml-auto">
                {card.members.slice(0, 3).map((cm) => (
                  <div
                    key={cm.memberId}
                    className="w-[26px] h-[26px] rounded-full bg-[#0079bf] flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white"
                    title={cm.member.name}
                  >
                    {cm.member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {card.members.length > 3 && (
                  <div className="w-[26px] h-[26px] rounded-full bg-[#dfe1e6] flex items-center justify-center text-[10px] font-bold text-[#5e6c84] ring-2 ring-white">
                    +{card.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
