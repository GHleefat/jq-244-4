import { useState, useCallback, useMemo, useEffect } from "react";
import { Wrench, Users, Shield } from "lucide-react";
import { useToolStore } from "@/store/toolStore";
import type { Tool, Borrower } from "@/types/tool";
import { CREDIT_RULES, DEFAULT_CREDIT_SCORE } from "@/types/tool";
import SearchBar from "@/components/SearchBar";
import StatsBar from "@/components/StatsBar";
import KanbanColumn from "@/components/KanbanColumn";
import BorrowModal from "@/components/BorrowModal";
import BorrowerCreditPanel from "@/components/BorrowerCreditPanel";
import { cn } from "@/lib/utils";

export default function Home() {
  const tools = useToolStore((state) => state.tools);
  const searchQuery = useToolStore((state) => state.searchQuery);
  const selectedCategories = useToolStore((state) => state.selectedCategories);
  const getFilteredTools = useToolStore((state) => state.getFilteredTools);
  const borrowTool = useToolStore((state) => state.borrowTool);
  const returnTool = useToolStore((state) => state.returnTool);
  const getAllBorrowers = useToolStore((state) => state.getAllBorrowers);
  const getBorrower = useToolStore((state) => state.getBorrower);
  const checkAndApplyOverduePenalties = useToolStore(
    (state) => state.checkAndApplyOverduePenalties,
  );

  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [creditPanelOpen, setCreditPanelOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(
    null,
  );
  const [showBorrowerList, setShowBorrowerList] = useState(false);
  const [borrowModalError, setBorrowModalError] = useState<string | null>(null);

  useEffect(() => {
    checkAndApplyOverduePenalties();
    const interval = setInterval(checkAndApplyOverduePenalties, 60000);
    return () => clearInterval(interval);
  }, [checkAndApplyOverduePenalties]);

  const availableTools = useMemo(
    () => getFilteredTools("available"),
    [tools, searchQuery, selectedCategories, getFilteredTools],
  );
  const borrowedTools = useMemo(
    () => getFilteredTools("borrowed"),
    [tools, searchQuery, selectedCategories, getFilteredTools],
  );

  const allBorrowers = useMemo(() => {
    const activeBorrowers = new Set(
      tools
        .filter((t) => t.status === "borrowed" && t.borrower)
        .map((t) => t.borrower!),
    );
    const registered = getAllBorrowers();
    const all = new Map<string, Borrower>();
    registered.forEach((b) => all.set(b.name, b));
    activeBorrowers.forEach((name) => {
      if (!all.has(name)) {
        all.set(
          name,
          getBorrower(name) || {
            name,
            creditScore: DEFAULT_CREDIT_SCORE,
            totalBorrows: 0,
            overdueCount: 0,
            history: [],
            creditRecords: [],
            createdAt: new Date().toISOString().split("T")[0],
          },
        );
      }
    });
    return Array.from(all.values()).sort(
      (a, b) => b.creditScore - a.creditScore,
    );
  }, [tools, getAllBorrowers, getBorrower]);

  const handleBorrow = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    setBorrowModalError(null);
    setBorrowModalOpen(true);
  }, []);

  const handleReturn = useCallback(
    (tool: Tool) => {
      if (window.confirm(`确认归还「${tool.name}」吗？`)) {
        returnTool(tool.id);
      }
    },
    [returnTool],
  );

  const handleDropAvailable = useCallback(
    (toolId: string) => {
      const tool = borrowedTools.find((t) => t.id === toolId);
      if (tool) {
        handleReturn(tool);
      }
    },
    [borrowedTools, handleReturn],
  );

  const handleDropBorrowed = useCallback(
    (toolId: string) => {
      const tool = availableTools.find((t) => t.id === toolId);
      if (tool) {
        handleBorrow(tool);
      }
    },
    [availableTools, handleBorrow],
  );

  const handleConfirmBorrow = useCallback(
    (toolId: string, borrower: string, dueDate: string) => {
      const success = borrowTool(toolId, borrower, dueDate);
      if (!success) {
        setBorrowModalError("无法借出，请检查借用人信用额度");
        setTimeout(() => setBorrowModalError(null), 3000);
      }
    },
    [borrowTool],
  );

  const handleViewBorrowerCredit = useCallback(
    (borrowerName: string) => {
      const borrower = getBorrower(borrowerName);
      if (borrower) {
        setSelectedBorrower(borrower);
        setCreditPanelOpen(true);
      }
    },
    [getBorrower],
  );

  const handleOpenBorrowerFromList = useCallback((borrower: Borrower) => {
    setShowBorrowerList(false);
    setSelectedBorrower(borrower);
    setCreditPanelOpen(true);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-wood-600 via-wood-700 to-wood-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48" />
        </div>

        <div className="relative container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Wrench
                  className="w-7 h-7 md:w-8 md:h-8 text-white"
                  strokeWidth={2}
                />
              </div>
              <div>
                <h1 className="font-display font-bold text-white text-2xl md:text-3xl tracking-tight">
                  社区工具图书馆
                </h1>
                <p className="text-wood-200 text-sm md:text-base">
                  借还记录看板 · 让共享更简单
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowBorrowerList(!showBorrowerList)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white
                    hover:bg-white/25 transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">借用人信用</span>
                  {allBorrowers.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                      {allBorrowers.length}
                    </span>
                  )}
                </button>

                {showBorrowerList && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-wood-200 z-30 overflow-hidden animate-fade-in">
                    <div className="px-4 py-2.5 bg-wood-50 border-b border-wood-200 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-wood-600" />
                      <span className="text-sm font-medium text-wood-700">
                        借用人列表
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {allBorrowers.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-wood-500">
                          暂无借用人记录
                        </div>
                      ) : (
                        allBorrowers.map((b) => {
                          const creditClass =
                            b.creditScore <=
                            CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD
                              ? "text-red-600 bg-red-50"
                              : b.creditScore <=
                                  CREDIT_RULES.LOW_CREDIT_THRESHOLD
                                ? "text-amber-600 bg-amber-50"
                                : b.creditScore < 80
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-forest-600 bg-forest-50";
                          const activeCount = tools.filter(
                            (t) =>
                              t.status === "borrowed" && t.borrower === b.name,
                          ).length;
                          return (
                            <button
                              key={b.name}
                              onClick={() => handleOpenBorrowerFromList(b)}
                              className="w-full px-4 py-3 hover:bg-wood-50 border-b border-wood-100 last:border-b-0 text-left transition-colors flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-wood-200 flex items-center justify-center flex-shrink-0">
                                  <Users className="w-4 h-4 text-wood-600" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-wood-800 text-sm truncate">
                                    {b.name}
                                  </div>
                                  <div className="text-xs text-wood-500">
                                    借{b.totalBorrows}次 · 持有{activeCount}件
                                  </div>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0",
                                  creditClass,
                                )}
                              >
                                {b.creditScore}分
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-full mb-6">
            <SearchBar />
          </div>

          <StatsBar />
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-[calc(100vh-420px)] min-h-[500px]">
          <KanbanColumn
            title="在库工具"
            status="available"
            tools={availableTools}
            onDrop={handleDropAvailable}
            onBorrow={handleBorrow}
            onReturn={handleReturn}
            onViewBorrowerCredit={handleViewBorrowerCredit}
          />
          <KanbanColumn
            title="借出中"
            status="borrowed"
            tools={borrowedTools}
            onDrop={handleDropBorrowed}
            onBorrow={handleBorrow}
            onReturn={handleReturn}
            onViewBorrowerCredit={handleViewBorrowerCredit}
          />
        </div>
      </main>

      {borrowModalError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-red-500 text-white shadow-lg animate-fade-in">
          {borrowModalError}
        </div>
      )}

      <BorrowModal
        tool={selectedTool}
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onConfirm={handleConfirmBorrow}
      />

      <BorrowerCreditPanel
        borrower={selectedBorrower!}
        isOpen={creditPanelOpen && selectedBorrower !== null}
        onClose={() => {
          setCreditPanelOpen(false);
          setSelectedBorrower(null);
        }}
      />
    </div>
  );
}
