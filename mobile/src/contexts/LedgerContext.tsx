import { createContext, useContext, useEffect, useState } from "react";
import { LedgerRead } from "@/src/types/api";
import { useLedgers } from "@/src/hooks/useLedgers";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LedgerContextType {
  ledgers: LedgerRead[];
  selectedLedger: LedgerRead | null;
  setSelectedLedger: (ledger: LedgerRead) => void;
  loading: boolean;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);


export function LedgerProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const {
    data: ledgers = [],
    isLoading,
  } = useLedgers();


  const [selectedLedger, setSelectedLedger] =
    useState<LedgerRead | null>(null);


  useEffect(() => {

    if (ledgers.length > 0 && !selectedLedger) {

      const defaultLedger =
        ledgers.find(
          ledger => ledger.is_default
        ) ?? ledgers[0];


      setSelectedLedger(defaultLedger);
    }

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

  const context =
    useContext(LedgerContext);

  if (!context) {
    throw new Error(
      "useLedger must be used inside LedgerProvider"
    );
  }

  return context;
}