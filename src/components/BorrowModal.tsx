import { useState, useEffect, useMemo } from "react";
import {
  X,
  User,
  Calendar,
  ArrowRight,
  Shield,
  AlertTriangle,
  Star,
  Info,
} from "lucide-react";
import type { Tool } from "@/types/tool";
import { CREDIT_RULES, DEFAULT_CREDIT_SCORE } from "@/types/tool";
import { getTodayISO, getDefaultDueDate, formatDate } from "@/utils/date";
import { useToolStore } from "@/store/toolStore";
import { cn } from "@/lib/utils";

interface BorrowModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (toolId: string, borrower: string, dueDate: string) => void;
}

function getMaxDueDate(maxDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + maxDays);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BorrowModal({
  tool,
  isOpen,
  onClose,
  onConfirm,
}: BorrowModalProps) {
  const [borrower, setBorrower] = useState("");
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [errors, setErrors] = useState<{
    borrower?: string;
    dueDate?: string;
    general?: string;
  }>({});

  const getBorrower = useToolStore((state) => state.getBorrower);
  const getBorrowLimit = useToolStore((state) => state.getBorrowLimit);
  const getActiveBorrowCount = useToolStore(
    (state) => state.getActiveBorrowCount,
  );

  const borrowerInfo = useMemo(() => {
    if (!borrower.trim()) return null;
    return getBorrower(borrower.trim());
  }, [borrower, getBorrower]);

  const borrowLimit = useMemo(() => {
    if (!borrower.trim()) return null;
    return getBorrowLimit(borrower.trim());
  }, [borrower, getBorrowLimit]);

  const creditScore = borrowerInfo?.creditScore ?? DEFAULT_CREDIT_SCORE;
  const activeCount = borrower.trim()
    ? getActiveBorrowCount(borrower.trim())
    : 0;

  const creditColorClass = useMemo(() => {
    if (creditScore <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD)
      return "text-red-600";
    if (creditScore <= CREDIT_RULES.LOW_CREDIT_THRESHOLD)
      return "text-amber-600";
    if (creditScore < 80) return "text-blue-600";
    return "text-forest-600";
  }, [creditScore]);

  const creditBgClass = useMemo(() => {
    if (creditScore <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD)
      return "bg-red-50 border-red-200";
    if (creditScore <= CREDIT_RULES.LOW_CREDIT_THRESHOLD)
      return "bg-amber-50 border-amber-200";
    if (creditScore < 80) return "bg-blue-50 border-blue-200";
    return "bg-forest-50 border-forest-200";
  }, [creditScore]);

  const creditBarColor = useMemo(() => {
    if (creditScore <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD)
      return "bg-red-500";
    if (creditScore <= CREDIT_RULES.LOW_CREDIT_THRESHOLD) return "bg-amber-500";
    if (creditScore < 80) return "bg-blue-500";
    return "bg-forest-500";
  }, [creditScore]);

  useEffect(() => {
    if (isOpen) {
      setBorrower("");
      setDueDate(getDefaultDueDate());
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (borrowLimit && borrowLimit.maxBorrowDays > 0) {
      const maxDate = getMaxDueDate(borrowLimit.maxBorrowDays);
      if (dueDate > maxDate) {
        setDueDate(maxDate);
      }
    }
  }, [borrowLimit, dueDate]);

  if (!isOpen || !tool) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { borrower?: string; dueDate?: string; general?: string } =
      {};

    if (!borrower.trim()) {
      newErrors.borrower = "请输入借出人姓名";
    } else if (borrowLimit && !borrowLimit.canBorrow) {
      newErrors.general = borrowLimit.reason;
    }

    if (!dueDate) {
      newErrors.dueDate = "请选择到期日期";
    } else if (new Date(dueDate) < new Date(getTodayISO())) {
      newErrors.dueDate = "到期日期不能早于今天";
    } else if (borrowLimit && borrowLimit.maxBorrowDays > 0) {
      const maxDate = getMaxDueDate(borrowLimit.maxBorrowDays);
      if (dueDate > maxDate) {
        newErrors.dueDate = `到期日期不能超过最长 ${borrowLimit.maxBorrowDays} 天`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(tool.id, borrower.trim(), dueDate);
    onClose();
  };

  const maxDueDate = borrowLimit
    ? getMaxDueDate(borrowLimit.maxBorrowDays)
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-wood-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-wood-500 to-wood-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{tool.icon}</span>
              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  借出登记
                </h2>
                <p className="text-wood-100 text-sm">
                  {tool.name} · {tool.category}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-wood-50 rounded-xl p-4 border border-wood-100">
            <div className="flex items-center gap-2 text-sm text-wood-600">
              <Calendar className="w-4 h-4" />
              <span>借出日期：</span>
              <span className="font-medium text-wood-800">
                {formatDate(getTodayISO())}
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-wood-700 mb-2">
              <User className="w-4 h-4" />
              借出人姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={borrower}
              onChange={(e) => {
                setBorrower(e.target.value);
                if (errors.borrower)
                  setErrors({
                    ...errors,
                    borrower: undefined,
                    general: undefined,
                  });
              }}
              placeholder="请输入借出人姓名"
              className={cn(
                "w-full px-4 py-3 rounded-xl border-2 bg-wood-50/50 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-wood-300 focus:border-wood-400",
                errors.borrower
                  ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
                  : "border-wood-200 hover:border-wood-300",
              )}
            />
            {errors.borrower && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-shake">
                <span>{errors.borrower}</span>
              </p>
            )}
          </div>

          {borrower.trim() && (
            <div className={cn("rounded-xl p-4 border", creditBgClass)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className={cn("w-4 h-4", creditColorClass)} />
                  <span className="text-sm font-medium text-wood-700">
                    信用分
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star
                    className={cn("w-4 h-4 fill-current", creditColorClass)}
                  />
                  <span
                    className={cn(
                      "text-lg font-bold font-display",
                      creditColorClass,
                    )}
                  >
                    {creditScore}
                  </span>
                  <span className="text-xs text-wood-500">/100</span>
                </div>
              </div>
              <div className="w-full h-2 bg-wood-200/60 rounded-full overflow-hidden mb-3">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    creditBarColor,
                  )}
                  style={{ width: `${creditScore}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <div className="font-medium text-wood-800">
                    {borrowerInfo?.totalBorrows ?? 0}
                  </div>
                  <div className="text-wood-500">累计借出</div>
                </div>
                <div>
                  <div className="font-medium text-wood-800">{activeCount}</div>
                  <div className="text-wood-500">当前持有</div>
                </div>
                <div>
                  <div className="font-medium text-wood-800">
                    {borrowerInfo?.overdueCount ?? 0}
                  </div>
                  <div className="text-wood-500">逾期次数</div>
                </div>
              </div>
              {borrowLimit && (
                <div
                  className={cn(
                    "mt-3 pt-3 border-t flex items-start gap-2 text-xs",
                    borrowLimit.canBorrow ? "text-wood-600" : "text-red-600",
                  )}
                >
                  {borrowLimit.canBorrow ? (
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{borrowLimit.reason}</span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-wood-700 mb-2">
              <Calendar className="w-4 h-4" />
              到期日期 <span className="text-red-500">*</span>
              {borrowLimit && borrowLimit.maxBorrowDays > 0 && (
                <span className="text-xs font-normal text-wood-500 ml-auto">
                  最长 {borrowLimit.maxBorrowDays} 天
                </span>
              )}
            </label>
            <input
              type="date"
              value={dueDate}
              min={getTodayISO()}
              max={maxDueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate)
                  setErrors({ ...errors, dueDate: undefined });
              }}
              className={cn(
                "w-full px-4 py-3 rounded-xl border-2 bg-wood-50/50 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-wood-300 focus:border-wood-400",
                errors.dueDate
                  ? "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400"
                  : "border-wood-200 hover:border-wood-300",
              )}
            />
            {errors.dueDate && (
              <p className="mt-1.5 text-sm text-red-500 animate-shake">
                {errors.dueDate}
              </p>
            )}
          </div>

          {errors.general && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-wood-200 text-wood-700 font-medium
                hover:bg-wood-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!!(borrowLimit && !borrowLimit.canBorrow)}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2",
                borrowLimit && !borrowLimit.canBorrow
                  ? "bg-wood-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-wood-500 to-wood-600 hover:from-wood-600 hover:to-wood-700 shadow-lg shadow-wood-500/25",
              )}
            >
              <span>确认借出</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
