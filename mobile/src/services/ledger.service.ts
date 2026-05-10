// Ledger Service - API calls for ledgers

import apiClient, { endpoints } from '@/src/config/api';
import { LedgerRead, LedgerCreate, LedgerUpdate } from '@/src/types/api';

/**
 * Get all ledgers for current user
 */
export const getLedgers = async (): Promise<LedgerRead[]> => {
  const response = await apiClient.get<LedgerRead[]>(endpoints.ledgers.list);
  return response.data;
};

/**
 * Create a new ledger
 */
export const createLedger = async (data: LedgerCreate): Promise<LedgerRead> => {
  const response = await apiClient.post<LedgerRead>(endpoints.ledgers.create, data);
  return response.data;
};

/**
 * Update a ledger
 */
export const updateLedger = async (
  id: string,
  data: LedgerUpdate
): Promise<LedgerRead> => {
  const response = await apiClient.patch<LedgerRead>(
    endpoints.ledgers.update(id),
    data
  );
  return response.data;
};

/**
 * Delete a ledger
 */
export const deleteLedger = async (id: string): Promise<void> => {
  await apiClient.delete(endpoints.ledgers.delete(id));
};

/**
 * Set ledger as default
 */
export const setDefaultLedger = async (id: string): Promise<LedgerRead> => {
  const response = await apiClient.patch<LedgerRead>(
    endpoints.ledgers.setDefault(id)
  );
  return response.data;
};

/**
 * Get default ledger
 */
export const getDefaultLedger = async (): Promise<LedgerRead | null> => {
  const ledgers = await getLedgers();
  return ledgers.find((ledger) => ledger.is_default) || ledgers[0] || null;
};
