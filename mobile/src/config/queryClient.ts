import { QueryClient } from '@tanstack/react-query';

// Configure React Query client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes (data considered fresh for 5 min)
      staleTime: 1000 * 60 * 5,

      // Cache time: 10 minutes (unused data kept in cache for 10 min)
      gcTime: 1000 * 60 * 10,

      // Retry failed requests 2 times before showing error
      retry: false,

      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (useful for keeping data fresh)
      refetchOnWindowFocus: true,

      // Refetch on network reconnect
      refetchOnReconnect: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: false,

      // Don't retry on specific error codes
      retryDelay: 1000,
    },
  },
});

// Query keys factory for consistent cache management
export const queryKeys = {
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },

  // Ledgers
  ledgers: {
    all: ['ledgers'] as const,
    lists: () => [...queryKeys.ledgers.all, 'list'] as const,
    default: () => [...queryKeys.ledgers.all, 'default'] as const,
    detail: (id: string) => [...queryKeys.ledgers.all, 'detail', id] as const,
  },

  // Expenses
  expenses: {
    all: ['expenses'] as const,
    lists: () => [...queryKeys.expenses.all, 'list'] as const,
    list: (ledgerId: string, filters?: any) =>
      [...queryKeys.expenses.lists(), ledgerId, filters] as const,
    summaries: () => [...queryKeys.expenses.all, 'summary'] as const,
    summary: (ledgerId: string, params?: any) =>
      [...queryKeys.expenses.summaries(), ledgerId, params] as const,
    detail: (ledgerId: string, expenseId: string) =>
      [...queryKeys.expenses.all, 'detail', ledgerId, expenseId] as const,
  },

  // Voice
  voice: {
    all: ['voice'] as const,
  },
};
