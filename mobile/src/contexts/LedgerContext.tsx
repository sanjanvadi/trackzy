import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { LedgerRead } from "@/src/types/api";
import { useLedgers } from "@/src/hooks/useLedgers";
import { useAuth } from "./AuthContext";

interface LedgerContextType {
  ledgers: LedgerRead[];
  selectedLedger: LedgerRead | null;
  setSelectedLedger: (ledger: LedgerRead) => void;
  loading: boolean;
}

const LedgerContext =
  createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({
  children,
}: {
  children: ReactNode;
}) {

  const {user} = useAuth();

  const {
    data: ledgers = [],
    isLoading,
  } = useLedgers();

  const [selectedLedger, setSelectedLedger] =
    useState<LedgerRead | null>(null);

  useEffect(() => {
    if (!user) {
      setSelectedLedger(null);
    }
  }, [user]);

  useEffect(() => {
    if (ledgers.length === 0) {
      setSelectedLedger(null);
      return;
    }

    const defaultLedger =
      ledgers.find((ledger) => ledger.is_default) ??
      ledgers[0];

    setSelectedLedger(defaultLedger);
  }, [ledgers]);

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
    throw new Error(
      "useLedger must be used inside LedgerProvider"
    );
  }

  return context;
}