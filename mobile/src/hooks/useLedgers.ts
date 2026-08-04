// React Query hooks for ledgers

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLedgers,
  getDefaultLedger,
  createLedger,
  updateLedger,
  deleteLedger,
  setDefaultLedger,
} from '@/src/services/ledger.service';
import { queryKeys } from '@/src/config/queryClient';
import { LedgerCreate, LedgerRead, LedgerUpdate } from '@/src/types/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Get all ledgers
 */
export const useLedgers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.ledgers.lists(),
    queryFn: getLedgers,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get default ledger
 */
export const useDefaultLedger = () => {
  return useQuery({
    queryKey: queryKeys.ledgers.default(),
    queryFn: getDefaultLedger,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create ledger mutation
 */
export const useCreateLedger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LedgerCreate) => createLedger(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ledgers.all });
    },
  });
};

/**
 * Update ledger mutation
 */
export const useUpdateLedger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LedgerUpdate }) =>
      updateLedger(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ledgers.all });
    },
  });
};

/**
 * Delete ledger mutation
 */
export const useDeleteLedger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLedger(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ledgers.all });
    },
  });
};

/**
 * Set default ledger mutation
 */
export const useSetDefaultLedger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setDefaultLedger(id),

    onSuccess: (_response, selectedLedgerId) => {
      queryClient.setQueryData<LedgerRead[]>(
        queryKeys.ledgers.lists(),
        (currentLedgers = []) =>
          currentLedgers.map((ledger) => ({
            ...ledger,
            is_default: ledger.id === selectedLedgerId,
          }))
      );
    },
  });
};
