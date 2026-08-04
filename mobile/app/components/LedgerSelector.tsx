// import { useState } from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   StyleSheet,
// } from "react-native";

// import { Feather } from "@expo/vector-icons";
// import { useLedger } from "@/src/contexts/LedgerContext";

// export default function LedgerSelector() {
//   const {
//     ledgers,
//     selectedLedger,
//     setSelectedLedger,
//   } = useLedger();

//   const [isOpen, setIsOpen] = useState(false);

//   if (!selectedLedger) {
//     return null;
//   }

//   const handleSelect = async (ledger: typeof selectedLedger) => {
//     await setSelectedLedger(ledger);
//     setIsOpen(false);
//   };

//   return (
//     <View style={styles.container}>
//       <Pressable
//         style={styles.selector}
//         onPress={() => setIsOpen((prev) => !prev)}
//       >
//         <Text style={styles.selectedText}>
//           {selectedLedger.name}
//         </Text>

//         <Feather
//           name={isOpen ? "chevron-up" : "chevron-down"}
//           size={18}
//         />
//       </Pressable>

//       {isOpen && (
//         <View style={styles.dropdown}>
//           {ledgers.map((ledger) => (
//             <Pressable
//               key={ledger.id}
//               style={styles.item}
//               onPress={() => handleSelect(ledger)}
//             >
//               <Text>{ledger.name}</Text>

//               {ledger.id === selectedLedger.id && (
//                 <Feather
//                   name="check"
//                   size={16}
//                 />
//               )}
//             </Pressable>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     width: 180,
//   },

//   selector: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderRadius: 10,
//   },

//   dropdown: {
//     marginTop: 4,
//     borderWidth: 1,
//     borderRadius: 10,
//     overflow: "hidden",
//   },

//   item: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 12,
//   },

//   selectedText: {
//     fontWeight: "600",
//   },
// });


import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useLedger } from "@/src/contexts/LedgerContext";

export default function LedgerSelector() {
  const {
    ledgers,
    selectedLedger,
    setSelectedLedger,
  } = useLedger();

  const [isOpen, setIsOpen] = useState(false);

  if (!selectedLedger) {
    return null;
  }

  const handleSelect = async (
    ledger: typeof selectedLedger
  ) => {
    await setSelectedLedger(ledger);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.selector}
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <Text style={styles.selectedText}>
          {selectedLedger.name}
        </Text>

        <Feather
          name={
            isOpen
              ? "chevron-up"
              : "chevron-down"
          }
          size={18}
        />
      </Pressable>

      {isOpen && (
        <View style={styles.dropdown}>
          {ledgers.map((ledger) => (
            <Pressable
              key={ledger.id}
              style={styles.item}
              onPress={() =>
                handleSelect(ledger)
              }
            >
              <Text style={styles.itemText}>
                {ledger.name}
              </Text>

              {ledger.id === selectedLedger.id && (
                <Feather
                  name="check"
                  size={16}
                />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    position: "relative",
    zIndex: 1000,
  },

  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    zIndex: 1001,
  },

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,

    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",

    overflow: "hidden",

    zIndex: 1000,
    elevation: 12,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },

  itemText: {
    fontSize: 15,
  },

  selectedText: {
    fontWeight: "600",
  },
});