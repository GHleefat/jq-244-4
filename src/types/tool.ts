export type ToolStatus = 'available' | 'borrowed';

export type CategoryTag = '电动类' | '园艺类' | '木工类' | '手动类' | '登高类' | '清洁类' | '运输类';

export const CATEGORY_TAGS: CategoryTag[] = ['电动类', '园艺类', '木工类', '手动类', '登高类', '清洁类', '运输类'];

export const CATEGORY_ICONS: Record<CategoryTag, string> = {
  '电动类': '⚡',
  '园艺类': '🌿',
  '木工类': '🪚',
  '手动类': '🔧',
  '登高类': '🪜',
  '清洁类': '💧',
  '运输类': '🛒',
};

export interface Tool {
  id: string;
  name: string;
  icon: string;
  category: string;
  tags: CategoryTag[];
  status: ToolStatus;
  borrower?: string;
  borrowDate?: string;
  dueDate?: string;
  returnDate?: string;
  description?: string;
}

export type DueStatus = 'normal' | 'due-soon' | 'overdue';

export type CreditChangeType = 'borrow' | 'return_on_time' | 'return_late' | 'overdue_deduct' | 'manual_adjust';

export interface CreditRecord {
  id: string;
  date: string;
  type: CreditChangeType;
  change: number;
  reason: string;
  toolName?: string;
}

export interface BorrowHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  toolIcon: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'returned' | 'borrowed' | 'overdue';
}

export interface Borrower {
  name: string;
  creditScore: number;
  totalBorrows: number;
  overdueCount: number;
  history: BorrowHistoryItem[];
  creditRecords: CreditRecord[];
  createdAt: string;
}

export const DEFAULT_CREDIT_SCORE = 100;
export const MIN_CREDIT_SCORE = 0;
export const MAX_CREDIT_SCORE = 100;

export const CREDIT_RULES = {
  LATE_RETURN_DEDUCT: 5,
  OVERDUE_PER_DAY_DEDUCT: 2,
  NORMAL_RETURN_BONUS: 1,
  BORROW_DEDUCT: 0,
  LOW_CREDIT_THRESHOLD: 60,
  VERY_LOW_CREDIT_THRESHOLD: 40,
};

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  categories: CategoryTag[];
  usedAt: string;
  useCount: number;
}

export interface BorrowLimit {
  maxBorrowCount: number;
  maxBorrowDays: number;
  canBorrow: boolean;
  reason?: string;
}
