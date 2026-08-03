import {
  View,
  Text,
  Pressable,
} from "react-native";

import { useLedger } from "@/src/contexts/LedgerContext";


export default function LedgerSelector() {

  const {
    ledgers,
    selectedLedger,
    setSelectedLedger
  } = useLedger();


  return (

    <View>

      <Text>
        {selectedLedger?.name}
      </Text>


      {ledgers.map((ledger)=>(
        <Pressable
          key={ledger.id}
          onPress={() =>
            setSelectedLedger(ledger)
          }
        >

          <Text>
            {ledger.name}
          </Text>

        </Pressable>
      ))}

    </View>

  );
}