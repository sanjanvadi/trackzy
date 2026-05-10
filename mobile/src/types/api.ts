// API Types - Matching Backend FastAPI Schemas

// ============================================================================
// Enums & Literal Types
// ============================================================================

export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'health'
  | 'entertainment'
  | 'bills'
  | 'grocery'
  | 'other';

export type Period = 'today' | 'this_week' | 'this_month' | 'last_month' | 'all';

export type Intent = 'add_expense' | 'edit_expense' | 'delete_expense' | 'query_expenses';

export type ExpenseSource = 'manual' | 'voice';

// ============================================================================
// User Types
// ============================================================================

export interface UserCreate {
  name: string;
  email: string;
  currency?: string;
}

export interface UserUpdate {
  name?: string;
  currency?: string;
}

export interface UserRead {
  id: string;
  name: string;
  email: string | null;
  currency: string;
  created_at: string;
}

// ============================================================================
// Ledger Types
// ============================================================================

export interface LedgerCreate {
  name: string;
  icon?: string;
}

export interface LedgerUpdate {
  name?: string;
  icon?: string;
}

export interface LedgerRead {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  is_default: boolean;
  created_at: string;
}

// ============================================================================
// Expense Types
// ============================================================================

export interface ExpenseCreate {
  amount: number;
  category: Category;
  note?: string;
  date?: string; // YYYY-MM-DD format
  source?: ExpenseSource;
}

export interface ExpenseUpdate {
  amount?: number;
  category?: Category;
  note?: string;
  date?: string;
}

export interface ExpenseRead {
  id: string;
  ledger_id: string;
  amount: number;
  category: Category;
  note: string | null;
  date: string; // YYYY-MM-DD
  source: ExpenseSource;
  created_at: string;
  updated_at: string;
}

// Query parameters for expense list endpoint
export interface ExpenseListParams {
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
  category?: Category;
}

// ============================================================================
// Summary & Analytics Types
// ============================================================================

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface ExpenseSummary {
  period: string;
  total: number;
  count: number;
  currency: string;
  breakdown: CategoryBreakdown[];
}

export interface ExpenseSummaryParams {
  period?: Period;
  category?: string;
}

// ============================================================================
// Voice Types
// ============================================================================

export interface ExpenseToolInput {
  expense_id?: string;
  ledger_name?: string;
  amount?: number;
  category?: string;
  note?: string;
  date?: string;
  period?: string;
}

export interface VoiceParseResponse {
  intent: Intent;
  ledger_id: string | null;
  message: string;
  tool_input: ExpenseToolInput;
  expense?: ExpenseRead;
  candidates?: ExpenseRead[];
  summary?: ExpenseSummary;
}

// ============================================================================
// API Error Response
// ============================================================================

export interface ApiError {
  detail: string;
}

// ============================================================================
// Grouped Transactions (for UI)
// ============================================================================

export interface GroupedTransactions {
  title: string; // "TODAY", "YESTERDAY", "Aug 10", etc.
  data: ExpenseRead[];
}
