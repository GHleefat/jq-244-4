import { useState } from "react";
import {
  X,
  Shield,
  Star,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { Borrower, CreditChangeType } from "@/types/tool";
import { CREDIT_RULES } from "@/types/tool";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";

interface BorrowerCreditPanelProps {
  borrower: Borrower;
  isOpen: boolean;
  onClose: () => void;
}

function getCreditTypeIcon(type: CreditChangeType) {
  switch (type) {
    case "borrow":
      return Package;
    case "return_on_time":
      return CheckCircle;
    case "return_late":
      return Clock;
    case "overdue_deduct":
      return AlertTriangle;
    case "manual_adjust":
      return Shield;
    default:
      return Minus;
  }
}

function getCreditTypeColor(type: CreditChangeType, change: number) {
  if (change > 0) return "text-forest-600 bg-forest-50 border-forest-200";
  if (change < 0) return "text-red-600 bg-red-50 border-red-200";
  return "text-wood-600 bg-wood-50 border-wood-200";
}

export default function BorrowerCreditPanel({
  borrower,
  isOpen,
  onClose,
}: BorrowerCreditPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "records"
  >("overview");

  const creditScore = borrower.creditScore;

  const creditColorClass =
    creditScore <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD
      ? "text-red-600"
      : creditScore <= CREDIT_RULES.LOW_CREDIT_THRESHOLD
        ? "text-amber-600"
        : creditScore < 80
          ? "text-blue-600"
          : "text-forest-600";

  const creditBgClass =
    creditScore <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD
      ? "bg-red-50 border-red-200"
      : creditScore <= CREDIT_RULES.LOW_CREDIT_THRESHOLD
        ? "bg-amber-50 border-amber-200"
        : creditScore < 80
          ? "bg-blue-50 border-blue-200"
          : "bg-forest-50 border-forest-200";

  const creditBarColor =
    creditScore <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD
      ? "bg-red-500"
      : creditScore <= CREDIT_RULES.LOW_CREDIT_THRESHOLD
        ? "bg-amber-500"
        : creditScore < 80
          ? "bg-blue-500"
          : "bg-forest-500";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-wood-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-wood-500 to-wood-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  借用人信用详情
                </h2>
                <p className="text-wood-100 text-sm">{borrower.name}</p>
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

        <div className="border-b border-wood-200 px-6">
          <div className="flex gap-1">
            {[
              { key: "overview", label: "信用概览" },
              { key: "history", label: "借还历史" },
              { key: "records", label: "信用记录" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-wood-600 text-wood-800"
                    : "border-transparent text-wood-500 hover:text-wood-700",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className={cn("rounded-2xl p-6 border", creditBgClass)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className={cn("w-5 h-5", creditColorClass)} />
                    <span className="font-medium text-wood-700">
                      当前信用分
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star
                      className={cn("w-6 h-6 fill-current", creditColorClass)}
                    />
                    <span
                      className={cn(
                        "text-4xl font-bold font-display",
                        creditColorClass,
                      )}
                    >
                      {creditScore}
                    </span>
                    <span className="text-lg text-wood-500">/100</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden mb-4">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      creditBarColor,
                    )}
                    style={{ width: `${creditScore}%` }}
                  />
                </div>
                <div className="text-sm text-wood-600">
                  {creditScore <= CREDIT_RULES.VERY_LOW_CREDIT_THRESHOLD
                    ? "信用严重不足，暂不可借用物品。请先归还逾期物品，保持良好借还习惯以恢复信用。"
                    : creditScore <= CREDIT_RULES.LOW_CREDIT_THRESHOLD
                      ? "信用分较低，借用将受到限制（限借1件，最长3天）。请按时归还以提升信用。"
                      : creditScore < 80
                        ? "信用分中等，借用有一定限制（限借2件，最长7天）。保持良好习惯可继续提升。"
                        : "信用优秀！您可以享受最高借用额度（最多5件，最长30天）。"}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-wood-50 rounded-xl p-4 border border-wood-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRightLeft className="w-4 h-4 text-wood-500" />
                    <span className="text-xs text-wood-500 font-medium">
                      累计借出
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-display text-wood-800">
                    {borrower.totalBorrows}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">
                      逾期次数
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-display text-red-700">
                    {borrower.overdueCount}
                  </div>
                </div>
                <div className="bg-forest-50 rounded-xl p-4 border border-forest-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-forest-500" />
                    <span className="text-xs text-forest-600 font-medium">
                      按时归还
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-display text-forest-700">
                    {
                      borrower.creditRecords.filter(
                        (r) => r.type === "return_on_time",
                      ).length
                    }
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">
                      加入时间
                    </span>
                  </div>
                  <div className="text-sm font-bold font-display text-blue-700 mt-1.5">
                    {formatDate(borrower.createdAt)}
                  </div>
                </div>
              </div>

              <div className="bg-wood-50 rounded-xl p-4 border border-wood-200">
                <h3 className="font-medium text-wood-700 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  信用规则说明
                </h3>
                <ul className="space-y-2 text-sm text-wood-600">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-forest-500 mt-0.5 flex-shrink-0" />
                    <span>
                      按时归还：信用分 +{CREDIT_RULES.NORMAL_RETURN_BONUS}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingDown className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>
                      延迟归还：信用分 -{CREDIT_RULES.LATE_RETURN_DEDUCT}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      逾期未还：每日扣信用分 -
                      {CREDIT_RULES.OVERDUE_PER_DAY_DEDUCT}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {borrower.history.length === 0 ? (
                <div className="text-center py-12 text-wood-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无借还历史记录</p>
                </div>
              ) : (
                borrower.history.map((item) => {
                  const statusConfig =
                    item.status === "returned"
                      ? {
                          label: "已归还",
                          class:
                            "bg-forest-100 text-forest-700 border-forest-200",
                          icon: CheckCircle,
                        }
                      : item.status === "overdue"
                        ? {
                            label: "已逾期",
                            class: "bg-red-100 text-red-700 border-red-200",
                            icon: AlertTriangle,
                          }
                        : {
                            label: "借出中",
                            class: "bg-blue-100 text-blue-700 border-blue-200",
                            icon: Package,
                          };
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-wood-200 bg-white hover:bg-wood-50 transition-colors"
                    >
                      <div className="text-3xl">{item.toolIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-wood-800 truncate">
                            {item.toolName}
                          </h4>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                              statusConfig.class,
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-wood-500">
                          <span>借出: {formatDate(item.borrowDate)}</span>
                          <span>到期: {formatDate(item.dueDate)}</span>
                          {item.returnDate && (
                            <span>归还: {formatDate(item.returnDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "records" && (
            <div className="space-y-3">
              {borrower.creditRecords.length === 0 ? (
                <div className="text-center py-12 text-wood-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无信用变动记录</p>
                </div>
              ) : (
                borrower.creditRecords.map((record) => {
                  const RecordIcon = getCreditTypeIcon(record.type);
                  const colorClass = getCreditTypeColor(
                    record.type,
                    record.change,
                  );

                  return (
                    <div
                      key={record.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-wood-200 bg-white hover:bg-wood-50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border",
                          colorClass,
                        )}
                      >
                        <RecordIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-wood-800 text-sm">
                          {record.reason}
                        </div>
                        <div className="text-xs text-wood-500 mt-0.5">
                          {formatDate(record.date)}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "text-sm font-bold font-display",
                          record.change > 0
                            ? "text-forest-600"
                            : record.change < 0
                              ? "text-red-600"
                              : "text-wood-500",
                        )}
                      >
                        {record.change > 0
                          ? `+${record.change}`
                          : record.change}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
