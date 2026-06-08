import { useState } from "react";
import { Package, ArrowRightLeft } from "lucide-react";
import type { Tool, ToolStatus } from "@/types/tool";
import ToolCard from "./ToolCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  status: ToolStatus;
  tools: Tool[];
  onDrop: (toolId: string) => void;
  onBorrow?: (tool: Tool) => void;
  onReturn?: (tool: Tool) => void;
  onViewBorrowerCredit?: (borrowerName: string) => void;
}

export default function KanbanColumn({
  title,
  status,
  tools,
  onDrop,
  onBorrow,
  onReturn,
  onViewBorrowerCredit,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const isAvailable = status === "available";
  const Icon = isAvailable ? Package : ArrowRightLeft;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const toolId = e.dataTransfer.getData("toolId");
    if (toolId) {
      onDrop(toolId);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className={cn(
          "flex items-center justify-between px-5 py-4 rounded-t-xl border-b-0",
          isAvailable
            ? "bg-gradient-to-r from-forest-500 to-forest-600"
            : "bg-gradient-to-r from-blue-500 to-blue-600",
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          <h2 className="text-lg font-display font-bold text-white">{title}</h2>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-sm font-bold",
            isAvailable ? "bg-white/20 text-white" : "bg-white/20 text-white",
          )}
        >
          {tools.length}
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 p-4 rounded-b-xl border-2 border-t-0 min-h-[400px] transition-all duration-200",
          "overflow-y-auto",
          isAvailable
            ? "bg-forest-50/30 border-forest-200"
            : "bg-blue-50/30 border-blue-200",
          isDragOver && (isAvailable ? "drag-over" : "drag-over-borrowed"),
        )}
      >
        {tools.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-3",
                isAvailable ? "bg-forest-100" : "bg-blue-100",
              )}
            >
              <Icon
                className={cn(
                  "w-8 h-8",
                  isAvailable ? "text-forest-500" : "text-blue-500",
                )}
              />
            </div>
            <p
              className={cn(
                "font-medium",
                isAvailable ? "text-forest-700" : "text-blue-700",
              )}
            >
              暂无{isAvailable ? "在库工具" : "借出记录"}
            </p>
            <p className="text-sm text-wood-500 mt-1">
              {isAvailable ? "所有工具都已借出" : "拖拽工具卡片到此处登记借出"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tools.map((tool, index) => (
              <div key={tool.id} style={{ animationDelay: `${index * 50}ms` }}>
                <ToolCard
                  tool={tool}
                  onBorrow={onBorrow}
                  onReturn={onReturn}
                  onViewBorrowerCredit={onViewBorrowerCredit}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
