import { useState } from "react";
import {
  Search,
  X,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Filter,
} from "lucide-react";
import { useToolStore } from "@/store/toolStore";
import { CATEGORY_TAGS, CATEGORY_ICONS } from "@/types/tool";
import type { CategoryTag } from "@/types/tool";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategory,
    clearCategories,
    savedSearches,
    saveCurrentSearch,
    applySavedSearch,
    deleteSavedSearch,
    incrementSavedSearchUsage,
  } = useToolStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSavedList, setShowSavedList] = useState(false);

  const handleSaveSearch = () => {
    if (!saveName.trim()) return;
    saveCurrentSearch(saveName.trim());
    setSaveName("");
    setShowSaveDialog(false);
  };

  const handleApplySaved = (id: string) => {
    applySavedSearch(id);
    incrementSavedSearchUsage(id);
    setShowSavedList(false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCategories.length > 0;

  const sortedSavedSearches = [...savedSearches].sort((a, b) => {
    if (b.useCount !== a.useCount) return b.useCount - a.useCount;
    return new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime();
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400 pointer-events-none"
          strokeWidth={2}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索工具名称、分类、标签或借出人..."
          className="w-full pl-12 pr-24 py-3.5 rounded-xl border-2 border-wood-200 bg-white
            focus:outline-none focus:ring-2 focus:ring-wood-300 focus:border-wood-400
            text-wood-800 placeholder:text-wood-400 transition-all
            hover:border-wood-300 shadow-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {savedSearches.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowSavedList(!showSavedList);
                  setShowSaveDialog(false);
                }}
                className="p-2 rounded-lg text-wood-500 hover:text-wood-700 hover:bg-wood-100 transition-colors"
                title="常用搜索"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              {showSavedList && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-wood-200 z-30 overflow-hidden animate-fade-in">
                  <div className="px-4 py-2.5 bg-wood-50 border-b border-wood-200">
                    <span className="text-sm font-medium text-wood-700">
                      常用搜索条件
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {sortedSavedSearches.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-wood-500">
                        暂无保存的搜索条件
                      </div>
                    ) : (
                      sortedSavedSearches.map((saved) => (
                        <div
                          key={saved.id}
                          className="group px-4 py-3 hover:bg-wood-50 border-b border-wood-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              onClick={() => handleApplySaved(saved.id)}
                              className="flex-1 text-left"
                            >
                              <div className="font-medium text-wood-800 text-sm">
                                {saved.name}
                              </div>
                              <div className="text-xs text-wood-500 mt-0.5 flex flex-wrap gap-1">
                                {saved.query && (
                                  <span className="bg-wood-100 px-1.5 py-0.5 rounded">
                                    「{saved.query}」
                                  </span>
                                )}
                                {saved.categories.map((c) => (
                                  <span
                                    key={c}
                                    className="bg-wood-100 px-1.5 py-0.5 rounded text-xs"
                                  >
                                    {CATEGORY_ICONS[c as CategoryTag]} {c}
                                  </span>
                                ))}
                                {!saved.query &&
                                  saved.categories.length === 0 && (
                                    <span className="text-wood-400">全部</span>
                                  )}
                              </div>
                              <div className="text-xs text-wood-400 mt-1">
                                使用 {saved.useCount} 次
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSavedSearch(saved.id);
                              }}
                              className="p-1 rounded text-wood-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => {
              setShowSaveDialog(!showSaveDialog);
              setShowSavedList(false);
            }}
            disabled={!hasActiveFilters}
            className={cn(
              "p-2 rounded-lg transition-colors",
              hasActiveFilters
                ? "text-wood-500 hover:text-wood-700 hover:bg-wood-100"
                : "text-wood-300 cursor-not-allowed",
            )}
            title="保存当前搜索"
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-2 rounded-lg text-wood-400 hover:text-wood-600 hover:bg-wood-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showSaveDialog && (
        <div className="flex items-center gap-2 p-3 bg-wood-50 rounded-xl border border-wood-200 animate-fade-in">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveSearch()}
            placeholder="输入搜索条件名称..."
            autoFocus
            className="flex-1 px-3 py-2 rounded-lg border border-wood-200 bg-white text-sm
              focus:outline-none focus:ring-2 focus:ring-wood-300 focus:border-wood-400
              text-wood-800 placeholder:text-wood-400"
          />
          <button
            onClick={handleSaveSearch}
            disabled={!saveName.trim()}
            className="px-4 py-2 rounded-lg bg-wood-600 text-white text-sm font-medium
              hover:bg-wood-700 disabled:bg-wood-300 disabled:cursor-not-allowed transition-colors"
          >
            保存
          </button>
          <button
            onClick={() => {
              setShowSaveDialog(false);
              setSaveName("");
            }}
            className="px-4 py-2 rounded-lg border border-wood-200 text-wood-600 text-sm font-medium
              hover:bg-white transition-colors"
          >
            取消
          </button>
        </div>
      )}

      <div className="flex items-start gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2 py-1.5 text-wood-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">分类:</span>
        </div>
        {CATEGORY_TAGS.map((tag) => {
          const isSelected = selectedCategories.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleCategory(tag)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                isSelected
                  ? "bg-wood-600 text-white border-wood-600 shadow-md shadow-wood-500/20"
                  : "bg-white text-wood-600 border-wood-200 hover:border-wood-400 hover:bg-wood-50",
              )}
            >
              <span>{CATEGORY_ICONS[tag]}</span>
              <span>{tag}</span>
            </button>
          );
        })}
        {selectedCategories.length > 0 && (
          <button
            onClick={clearCategories}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
              text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>清除筛选</span>
          </button>
        )}
      </div>
    </div>
  );
}
