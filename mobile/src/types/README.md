# TypeScript Types Documentation

## Overview
Complete type safety for the FinAssistant app, matching backend API schemas exactly.

---

## Files Created

### 1. API Types (`api.ts`)
**Purpose**: Types matching FastAPI backend schemas

#### Categories
- `Category` - 8 expense categories (food, transport, shopping, health, entertainment, bills, grocery, other)
- `Period` - Time periods for summaries (today, this_week, this_month, last_month, all)
- `Intent` - Voice command intents (add_expense, edit_expense, delete_expense, query_expenses)
- `ExpenseSource` - Transaction source (manual, voice)

#### User Types
- `UserCreate` - Create user (name, email, currency)
- `UserUpdate` - Update user (name?, currency?)
- `UserRead` - User response (id, name, email, currency, created_at)

#### Ledger Types
- `LedgerCreate` - Create ledger (name, icon?)
- `LedgerUpdate` - Update ledger (name?, icon?)
- `LedgerRead` - Ledger response (id, user_id, name, icon, is_default, created_at)

#### Expense Types
- `ExpenseCreate` - Create expense (amount, category, note?, date?, source?)
- `ExpenseUpdate` - Update expense (all fields optional)
- `ExpenseRead` - Expense response (all fields)
- `ExpenseListParams` - Query params (page, per_page, start_date, end_date, category)

#### Summary Types
- `CategoryBreakdown` - Category spending (category, total, count)
- `ExpenseSummary` - Summary response (period, total, count, currency, breakdown[])
- `ExpenseSummaryParams` - Query params (period?, category?)

#### Voice Types
- `ExpenseToolInput` - Parsed voice data
- `VoiceParseResponse` - Voice API response

#### UI Types
- `GroupedTransactions` - For grouped transaction lists

---

### 2. Auth Types (`auth.ts`)
**Purpose**: Authentication and user session types

- `AuthState` - Current auth state (user, loading, error)
- `SignUpData` - Signup form (name, email, password)
- `SignInData` - Login form (email, password)
- `ResetPasswordData` - Password reset (email)
- `AuthContextType` - Auth context interface

---

### 3. Navigation Types (`navigation.ts`)
**Purpose**: Type-safe routing with Expo Router

- `RootStackParamList` - Root navigation params
- `AuthStackParamList` - Auth flow params
- `TabsParamList` - Tab navigation params
- `VoiceConfirmationProps` - Voice screen props

---

## Usage Examples

### Importing Types

```typescript
// Import from index for convenience
import { UserRead, ExpenseCreate, Category } from '@/src/types';

// Or import specific files
import { ExpenseRead } from '@/src/types/api';
import { AuthState } from '@/src/types/auth';
```

### Using Types in Components

```typescript
import { ExpenseRead, Category } from '@/src/types';

interface TransactionItemProps {
  expense: ExpenseRead;
  onPress: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ expense, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(expense.id)}>
      <Text>{expense.note}</Text>
      <Text>${expense.amount}</Text>
    </TouchableOpacity>
  );
};
```

### Using Types with API Calls

```typescript
import apiClient, { endpoints } from '@/src/config/api';
import { ExpenseCreate, ExpenseRead } from '@/src/types';

const createExpense = async (ledgerId: string, data: ExpenseCreate): Promise<ExpenseRead> => {
  const response = await apiClient.post<ExpenseRead>(
    endpoints.expenses.create(ledgerId),
    data
  );
  return response.data;
};
```

### Using Types with React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { ExpenseRead } from '@/src/types';

const { data: expenses } = useQuery<ExpenseRead[]>({
  queryKey: ['expenses', ledgerId],
  queryFn: () => fetchExpenses(ledgerId),
});
```

---

## Type Safety Benefits

✅ **Compile-time error checking**
```typescript
// ❌ TypeScript error: Property 'category' is required
const expense: ExpenseCreate = {
  amount: 50,
  // missing category!
};

// ✅ Correct
const expense: ExpenseCreate = {
  amount: 50,
  category: 'food',
};
```

✅ **IntelliSense autocomplete**
```typescript
expense.category // Autocompletes with 8 category options
```

✅ **Prevents typos**
```typescript
// ❌ TypeScript error
category: 'foods' // Not a valid Category

// ✅ Correct
category: 'food' // Valid Category
```

✅ **Backend sync**
```typescript
// Types match backend exactly
// If backend changes, types update = compile errors = early detection
```

---

## Next Steps

With types in place, you can now:
1. Create service layer with full type safety
2. Build React Query hooks with typed responses
3. Create components with typed props
4. Ensure frontend/backend schema consistency
