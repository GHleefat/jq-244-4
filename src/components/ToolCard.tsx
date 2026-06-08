import { useState } from "react";
import {
  GripVertical,
  User,
  Calendar,
  AlertCircle,
  Shield,
  Star,
} from "lucide-react";
import type { Tool } from "@/types/tool";
import { CREDIT_RULES, DEFAULT_CREDIT_SCORE } from "@/types/tool";
import { formatDate, getDueStatus, getDaysRemaining } from "@/utils/date";
import { useToolStore } from "@/store/toolStore";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  onBorrow?: (tool: Tool) => void;
  onReturn?: (tool: Tool) => void;
  onViewBorrowerCredit?: (borrowerName: string) => void;
}

export default function ToolCard({
  tool,
  onBorrow,
  onReturn,
  onViewBorrowerCredit,
}: ToolCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getBorrower = useToolStore((state) => state.getBorrower);

  const dueStatus = getDueStatus(tool.dueDate);
  const daysRemaining = tool.dueDate ? getDaysRemaining(tool.dueDate) : 0;

  const borrowerInfo = tool.borrower ? getBorrower(tool.borrower) : undefined;
  const creditScore = borrowerInfo?.creditScore ?? DEFAULT_CREDIT_SCORE;

  const creditColorClass =
    creditScore <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD
      ? "text-red-600 bg-red-50 border-red-200"
      : creditScore <= CREDIT_RULES.LOW_CREDIT_THRESHOLD
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : creditScore < 80
          ? "text-blue-600 bg-blue-50 border-blue-200"
          : "text-forest-600 bg-forest-50 border-forest-200";

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("toolId", tool.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (tool.status === "available" && onBorrow) {
      onBorrow(tool);
    } else if (tool.status === "borrowed" && onReturn) {
      onReturn(tool);
    }
  };

  const handleBorrowerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tool.borrower && onViewBorrowerCredit) {
      onViewBorrowerCredit(tool.borrower);
    }
  };

  const borderColor =
    tool.status === "available"
      ? "border-l-forest-500"
      : dueStatus === "overdue"
        ? "border-l-red-500"
        : dueStatus === "due-soon"
          ? "border-l-amber-500"
          : "border-l-blue-500";

  const dueBadgeClass =
    dueStatus === "overdue"
      ? "bg-red-100 text-red-700 border-red-200"
      : dueStatus === "due-soon"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-blue-100 text-blue-700 border-blue-200";

  const cardBgClass =
    dueStatus === "overdue"
      ? "bg-red-50/50"
      : dueStatus === "due-soon"
        ? "bg-amber-50/50"
        : "bg-white";

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={cn(
        "group relative bg-white rounded-xl border border-l-4 shadow-card cursor-grab active:cursor-grabbing",
        "hover:shadow-card-hover transition-all duration-200",
        "animate-slide-up",
        borderColor,
        cardBgClass,
        isDragging && "dragging",
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{tool.icon}</div>
            <div>
              <h3 className="font-display font-semibold text-wood-900 text-base">
                {tool.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-wood-500">{tool.category}</span>
                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {tool.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-wood-100 text-wood-600 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {tool.tags.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-wood-100 text-wood-600 font-medium">
                        +{tool.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <GripVertical className="w-4 h-4 text-wood-300 group-hover:text-wood-500 transition-colors" />
        </div>

        {tool.status === "available" ? (
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-forest-100 text-forest-700 border border-forest-200">
              可借出
            </span>
            <span className="text-xs text-wood-400">拖拽或点击借出</span>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBorrowerClick}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  onViewBorrowerCredit
                    ? "hover:opacity-70 cursor-pointer"
                    : "cursor-default",
                )}
              >
                <User className="w-4 h-4 text-wood-500" />
                <span className="font-medium text-wood-700">
                  {tool.borrower}
                </span>
              </button>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                  creditColorClass,
                )}
                onClick={handleBorrowerClick}
              >
                <Shield className="w-3 h-3" />
                <Star className="w-3 h-3 fill-current" />
                {creditScore}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-wood-600">
              <Calendar className="w-3.5 h-3.5 text-wood-400" />
              <span>
                借出: {tool.borrowDate && formatDate(tool.borrowDate)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
                  dueBadgeClass,
                )}
              >
                {dueStatus === "overdue" && <AlertCircle className="w-3 h-3" />}
                {dueStatus === "overdue"
                  ? `已过期 ${Math.abs(daysRemaining)} 天`
                  : dueStatus === "due-soon"
                    ? `还剩 ${daysRemaining} 天`
                    : `到期: ${tool.dueDate && formatDate(tool.dueDate)}`}
              </span>
              <span className="text-xs text-wood-400">点击归还</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
