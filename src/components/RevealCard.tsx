import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import commonStyles from "../constants/commonStyles";

type RevealCardProps = {
  frontText: string;
  revealedText: string;
  onHide: () => void;
};

export default function RevealCard({
  frontText,
  revealedText,
  onHide,
}: RevealCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.card}
        onPress={() => setRevealed((prev) => !prev)}
      >
        <Text style={styles.text}>{revealed ? revealedText : frontText}</Text>
      </Pressable>

      {revealed && (
        <Pressable onPress={onHide}>
          <Text style={styles.hideText}>Hide & Pass Phone</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "80%",
    minHeight: 200,
    backgroundColor: "#222",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 24,
    textAlign: "center",
  },
  hideText: {
    marginTop: 30,
    fontSize: 16,
    opacity: 0.7,
  },
});
