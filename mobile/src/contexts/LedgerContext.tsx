import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LedgerRead } from "@/src/types/api";
import { useLedgers } from "@/src/hooks/useLedgers";

interface LedgerContextType {
  ledgers: LedgerRead[];
  selectedLedger: LedgerRead | null;
  setSelectedLedger: (ledger: LedgerRead) => Promise<void>;
  loading: boolean;
}

const SELECTED_LEDGER_KEY = "selectedLedgerId";

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const { data: ledgers = [], isLoading } = useLedgers();

  const [selectedLedger, setSelectedLedgerState] = useState<LedgerRead | null>(
    null
  );

  /**
   * Load saved ledger when ledgers are available
   */
  useEffect(() => {
    const loadSelectedLedger = async () => {
      if (ledgers.length === 0) return;

      try {
        const savedLedgerId = await AsyncStorage.getItem(SELECTED_LEDGER_KEY);

        const savedLedger = ledgers.find(
          (ledger) => ledger.id === savedLedgerId
        );

        if (savedLedger) {
          setSelectedLedgerState(savedLedger);
        } else {
          // First time user / invalid saved ledger
          const defaultLedger =
            ledgers.find((ledger) => ledger.is_default) ?? ledgers[0];

          setSelectedLedgerState(defaultLedger);

          await AsyncStorage.setItem(SELECTED_LEDGER_KEY, defaultLedger.id);
        }
      } catch (error) {
        console.error("Failed to load selected ledger:", error);

        // Fallback to default ledger
        const defaultLedger =
          ledgers.find((ledger) => ledger.is_default) ?? ledgers[0];

        setSelectedLedgerState(defaultLedger);
      }
    };

    loadSelectedLedger();
  }, [ledgers]);

  /**
   * Change active ledger
   * Saves selection locally
   */
  const setSelectedLedger = async (ledger: LedgerRead) => {
    setSelectedLedgerState(ledger);

    try {
      await AsyncStorage.setItem(SELECTED_LEDGER_KEY, ledger.id);
    } catch (error) {
      console.error("Failed to save selected ledger:", error);
    }
  };

  return (
    <LedgerContext.Provider
      value={{
        ledgers,
        selectedLedger,
        setSelectedLedger,
        loading: isLoading,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);

  if (!context) {
    throw new Error("useLedger must be used inside LedgerProvider");
  }

  return context;
}
