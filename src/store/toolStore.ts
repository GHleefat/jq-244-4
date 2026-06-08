import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Tool,
  ToolStatus,
  Borrower,
  CategoryTag,
  SavedSearch,
  BorrowLimit,
  BorrowHistoryItem,
  CreditRecord,
} from "@/types/tool";
import {
  DEFAULT_CREDIT_SCORE,
  MIN_CREDIT_SCORE,
  CREDIT_RULES,
  CATEGORY_TAGS,
} from "@/types/tool";
import { getDueStatus, getTodayISO, getDaysRemaining } from "@/utils/date";

const initialTools: Tool[] = [
  {
    id: "1",
    name: "电钻",
    icon: "🔧",
    category: "电动工具",
    tags: ["电动类", "手动类"],
    status: "available",
  },
  {
    id: "2",
    name: "割草机",
    icon: "🌿",
    category: "园艺工具",
    tags: ["园艺类", "电动类"],
    status: "available",
  },
  {
    id: "3",
    name: "梯子",
    icon: "🪜",
    category: "登高设备",
    tags: ["登高类"],
    status: "borrowed",
    borrower: "张三",
    borrowDate: "2026-06-01",
    dueDate: "2026-06-10",
  },
  {
    id: "4",
    name: "扳手套装",
    icon: "🔩",
    category: "手动工具",
    tags: ["手动类", "木工类"],
    status: "available",
  },
  {
    id: "5",
    name: "手推车",
    icon: "🛒",
    category: "运输设备",
    tags: ["运输类"],
    status: "borrowed",
    borrower: "李四",
    borrowDate: "2026-06-05",
    dueDate: "2026-06-15",
  },
  {
    id: "6",
    name: "电锯",
    icon: "🪚",
    category: "电动工具",
    tags: ["电动类", "木工类"],
    status: "available",
  },
  {
    id: "7",
    name: "高压水枪",
    icon: "💧",
    category: "清洁设备",
    tags: ["清洁类", "电动类"],
    status: "available",
  },
  {
    id: "8",
    name: "锤子",
    icon: "🔨",
    category: "手动工具",
    tags: ["手动类", "木工类"],
    status: "borrowed",
    borrower: "王五",
    borrowDate: "2026-06-07",
    dueDate: "2026-06-09",
  },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function clampCredit(score: number): number {
  return Math.max(MIN_CREDIT_SCORE, Math.min(100, score));
}

function createBorrower(name: string): Borrower {
  return {
    name,
    creditScore: DEFAULT_CREDIT_SCORE,
    totalBorrows: 0,
    overdueCount: 0,
    history: [],
    creditRecords: [],
    createdAt: getTodayISO(),
  };
}

interface ToolStore {
  tools: Tool[];
  borrowers: Record<string, Borrower>;
  searchQuery: string;
  selectedCategories: CategoryTag[];
  savedSearches: SavedSearch[];

  setSearchQuery: (query: string) => void;
  toggleCategory: (category: CategoryTag) => void;
  clearCategories: () => void;
  saveCurrentSearch: (name: string) => void;
  applySavedSearch: (id: string) => void;
  deleteSavedSearch: (id: string) => void;
  incrementSavedSearchUsage: (id: string) => void;

  getOrCreateBorrower: (name: string) => Borrower;
  getBorrower: (name: string) => Borrower | undefined;
  getAllBorrowers: () => Borrower[];
  getBorrowLimit: (name: string) => BorrowLimit;
  getActiveBorrowCount: (name: string) => number;
  checkAndApplyOverduePenalties: () => void;

  borrowTool: (id: string, borrower: string, dueDate: string) => boolean;
  returnTool: (id: string) => void;
  moveTool: (
    id: string,
    targetStatus: ToolStatus,
    borrower?: string,
    dueDate?: string,
  ) => boolean;
  getFilteredTools: (status: ToolStatus) => Tool[];
  getStats: () => {
    available: number;
    borrowed: number;
    dueSoon: number;
    overdue: number;
  };
}

export const useToolStore = create<ToolStore>()(
  persist(
    (set, get) => ({
      tools: initialTools,
      borrowers: {},
      searchQuery: "",
      selectedCategories: [],
      savedSearches: [],

      setSearchQuery: (query) => set({ searchQuery: query }),

      toggleCategory: (category) =>
        set((state) => ({
          selectedCategories: state.selectedCategories.includes(category)
            ? state.selectedCategories.filter((c) => c !== category)
            : [...state.selectedCategories, category],
        })),

      clearCategories: () => set({ selectedCategories: [] }),

      saveCurrentSearch: (name) =>
        set((state) => {
          const newSearch: SavedSearch = {
            id: generateId(),
            name,
            query: state.searchQuery,
            categories: [...state.selectedCategories],
            usedAt: getTodayISO(),
            useCount: 1,
          };
          return { savedSearches: [newSearch, ...state.savedSearches] };
        }),

      applySavedSearch: (id) =>
        set((state) => {
          const saved = state.savedSearches.find((s) => s.id === id);
          if (!saved) return state;
          return {
            searchQuery: saved.query,
            selectedCategories: [...saved.categories],
          };
        }),

      deleteSavedSearch: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.filter((s) => s.id !== id),
        })),

      incrementSavedSearchUsage: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.map((s) =>
            s.id === id
              ? { ...s, useCount: s.useCount + 1, usedAt: getTodayISO() }
              : s,
          ),
        })),

      getOrCreateBorrower: (name) => {
        const { borrowers } = get();
        if (borrowers[name]) return borrowers[name];
        const newBorrower = createBorrower(name);
        set((state) => ({
          borrowers: { ...state.borrowers, [name]: newBorrower },
        }));
        return newBorrower;
      },

      getBorrower: (name) => {
        return get().borrowers[name];
      },

      getAllBorrowers: () => {
        return Object.values(get().borrowers);
      },

      getActiveBorrowCount: (name) => {
        return get().tools.filter(
          (t) => t.status === "borrowed" && t.borrower === name,
        ).length;
      },

      getBorrowLimit: (name) => {
        const borrower = get().getBorrower(name);
        const score = borrower?.creditScore ?? DEFAULT_CREDIT_SCORE;
        const activeCount = get().getActiveBorrowCount(name);

        if (score <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD) {
          return {
            maxBorrowCount: 0,
            maxBorrowDays: 0,
            canBorrow: false,
            reason: `信用分过低（${score}分），暂不可借用。请先归还逾期物品恢复信用。`,
          };
        }
        if (score <= CREDIT_RULES.LOW_CREDIT_THRESHOLD) {
          const remaining = Math.max(0, 1 - activeCount);
          return {
            maxBorrowCount: 1,
            maxBorrowDays: 3,
            canBorrow: remaining > 0,
            reason:
              remaining > 0
                ? `信用分较低（${score}分），限借1件，最长3天`
                : `信用分较低（${score}分），已达借用上限`,
          };
        }
        if (score < 80) {
          const remaining = Math.max(0, 2 - activeCount);
          return {
            maxBorrowCount: 2,
            maxBorrowDays: 7,
            canBorrow: remaining > 0,
            reason:
              remaining > 0
                ? `信用分中等（${score}分），限借2件，最长7天`
                : `已达借用上限（2件）`,
          };
        }
        const remaining = Math.max(0, 5 - activeCount);
        return {
          maxBorrowCount: 5,
          maxBorrowDays: 30,
          canBorrow: remaining > 0,
          reason:
            remaining > 0
              ? `信用良好（${score}分），最多可借5件，最长30天`
              : `已达借用上限（5件）`,
        };
      },

      checkAndApplyOverduePenalties: () => {
        const { tools, borrowers } = get();
        const today = getTodayISO();
        let hasChanges = false;
        const newBorrowers = { ...borrowers };

        tools.forEach((tool) => {
          if (tool.status === "borrowed" && tool.dueDate && tool.borrower) {
            const dueStatus = getDueStatus(tool.dueDate);
            if (dueStatus === "overdue") {
              const borrower = newBorrowers[tool.borrower];
              if (!borrower) return;

              const daysOverdue = Math.abs(getDaysRemaining(tool.dueDate));
              const alreadyPenalized = borrower.creditRecords.some(
                (r) =>
                  r.type === "overdue_deduct" &&
                  r.toolName === tool.name &&
                  r.date === today,
              );

              if (!alreadyPenalized) {
                const penalty =
                  daysOverdue * CREDIT_RULES.OVERDUE_PER_DAY_DEDUCT;
                const record: CreditRecord = {
                  id: generateId(),
                  date: today,
                  type: "overdue_deduct",
                  change: -penalty,
                  reason: `「${tool.name}」逾期 ${daysOverdue} 天`,
                  toolName: tool.name,
                };
                newBorrowers[tool.borrower] = {
                  ...borrower,
                  creditScore: clampCredit(borrower.creditScore - penalty),
                  creditRecords: [record, ...borrower.creditRecords],
                };
                hasChanges = true;
              }

              const historyItem = borrower.history.find(
                (h) => h.toolId === tool.id && h.status === "borrowed",
              );
              if (historyItem && historyItem.status !== "overdue") {
                newBorrowers[tool.borrower] = {
                  ...newBorrowers[tool.borrower],
                  history: newBorrowers[tool.borrower].history.map((h) =>
                    h.id === historyItem.id
                      ? { ...h, status: "overdue" as const }
                      : h,
                  ),
                  overdueCount: borrower.overdueCount + 1,
                };
                hasChanges = true;
              }
            }
          }
        });

        if (hasChanges) {
          set({ borrowers: newBorrowers });
        }
      },

      borrowTool: (id, borrowerName, dueDate) => {
        const limit = get().getBorrowLimit(borrowerName);
        if (!limit.canBorrow) {
          return false;
        }

        get().checkAndApplyOverduePenalties();

        const borrower = get().getOrCreateBorrower(borrowerName);

        set((state) => {
          const tool = state.tools.find((t) => t.id === id);
          if (!tool) return state;

          const today = getTodayISO();
          const historyItem: BorrowHistoryItem = {
            id: generateId(),
            toolId: tool.id,
            toolName: tool.name,
            toolIcon: tool.icon,
            borrowDate: today,
            dueDate,
            status: "borrowed",
          };

          const borrowRecord: CreditRecord = {
            id: generateId(),
            date: today,
            type: "borrow",
            change: 0,
            reason: `借出「${tool.name}」`,
            toolName: tool.name,
          };

          const updatedBorrower = {
            ...state.borrowers[borrowerName],
            totalBorrows:
              (state.borrowers[borrowerName]?.totalBorrows ?? 0) + 1,
            history: [
              historyItem,
              ...(state.borrowers[borrowerName]?.history ?? []),
            ],
            creditRecords: [
              borrowRecord,
              ...(state.borrowers[borrowerName]?.creditRecords ?? []),
            ],
          };

          return {
            tools: state.tools.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "borrowed" as ToolStatus,
                    borrower: borrowerName,
                    borrowDate: today,
                    dueDate,
                    returnDate: undefined,
                  }
                : t,
            ),
            borrowers: {
              ...state.borrowers,
              [borrowerName]: updatedBorrower,
            },
          };
        });

        return true;
      },

      returnTool: (id) => {
        get().checkAndApplyOverduePenalties();

        set((state) => {
          const tool = state.tools.find((t) => t.id === id);
          if (
            !tool ||
            tool.status !== "borrowed" ||
            !tool.borrower ||
            !tool.dueDate
          )
            return state;

          const today = getTodayISO();
          const dueStatus = getDueStatus(tool.dueDate);
          const isLate =
            dueStatus === "overdue" ||
            (dueStatus === "due-soon" &&
              new Date(today) > new Date(tool.dueDate));
          const isOverdue = dueStatus === "overdue";

          const daysOverdue = isOverdue
            ? Math.abs(getDaysRemaining(tool.dueDate))
            : 0;
          const bonus =
            !isOverdue && !isLate ? CREDIT_RULES.NORMAL_RETURN_BONUS : 0;
          const lateDeduct =
            isLate && !isOverdue ? CREDIT_RULES.LATE_RETURN_DEDUCT : 0;
          const netChange = bonus - lateDeduct;

          const returnRecord: CreditRecord = {
            id: generateId(),
            date: today,
            type: isOverdue
              ? "return_late"
              : isLate
                ? "return_late"
                : "return_on_time",
            change: netChange,
            reason: isOverdue
              ? `逾期归还「${tool.name}」${daysOverdue}天`
              : isLate
                ? `延迟归还「${tool.name}」`
                : `按时归还「${tool.name}」，信用+${bonus}`,
            toolName: tool.name,
          };

          const currentBorrower = state.borrowers[tool.borrower];

          return {
            tools: state.tools.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "available" as ToolStatus,
                    borrower: undefined,
                    borrowDate: undefined,
                    dueDate: undefined,
                    returnDate: today,
                  }
                : t,
            ),
            borrowers: currentBorrower
              ? {
                  ...state.borrowers,
                  [tool.borrower]: {
                    ...currentBorrower,
                    creditScore: clampCredit(
                      currentBorrower.creditScore + netChange,
                    ),
                    history: currentBorrower.history.map((h) =>
                      h.toolId === tool.id && h.status !== "returned"
                        ? {
                            ...h,
                            status: "returned" as const,
                            returnDate: today,
                          }
                        : h,
                    ),
                    creditRecords: [
                      returnRecord,
                      ...currentBorrower.creditRecords,
                    ],
                  },
                }
              : state.borrowers,
          };
        });
      },

      moveTool: (id, targetStatus, borrower, dueDate) => {
        if (targetStatus === "available") {
          get().returnTool(id);
          return true;
        } else if (targetStatus === "borrowed" && borrower && dueDate) {
          return get().borrowTool(id, borrower, dueDate);
        }
        return false;
      },

      getFilteredTools: (status) => {
        const { tools, searchQuery, selectedCategories } = get();
        const query = searchQuery.trim().toLowerCase();
        return tools.filter((tool) => {
          const matchesStatus = tool.status === status;
          const matchesSearch =
            query === "" ||
            tool.name.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query) ||
            tool.tags.some((t) => t.toLowerCase().includes(query)) ||
            (tool.borrower && tool.borrower.toLowerCase().includes(query));
          const matchesCategories =
            selectedCategories.length === 0 ||
            selectedCategories.some((c) => tool.tags.includes(c));
          return matchesStatus && matchesSearch && matchesCategories;
        });
      },

      getStats: () => {
        const { tools } = get();
        get().checkAndApplyOverduePenalties();
        let available = 0;
        let borrowed = 0;
        let dueSoon = 0;
        let overdue = 0;

        tools.forEach((tool) => {
          if (tool.status === "available") {
            available++;
          } else {
            borrowed++;
            const dueStatus = getDueStatus(tool.dueDate);
            if (dueStatus === "due-soon") dueSoon++;
            if (dueStatus === "overdue") overdue++;
          }
        });

        return { available, borrowed, dueSoon, overdue };
      },
    }),
    {
      name: "tool-library-storage",
    },
  ),
);
