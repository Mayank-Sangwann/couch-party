import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import commonStyles from "../../constants/commonStyles";
import PrimaryButton from "../../components/PrimaryButton";
import { SCREENS } from "../../constants/staticConstants";

const COLORS = [
  { id: "red", name: "Red", hex: "#FF3B30" },
  { id: "orange", name: "Orange", hex: "#FF9500" },
  { id: "yellow", name: "Yellow", hex: "#FFCC00" },
  { id: "green", name: "Green", hex: "#34C759" },
  { id: "blue", name: "Blue", hex: "#0A84FF" },
  { id: "purple", name: "Purple", hex: "#AF52DE" },
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "black", name: "Black", hex: "#000000" },
];

export default function ColorQuestIntroScreen({ navigation }: any) {
  const [selectedColor, setSelectedColor] = useState<
    (typeof COLORS)[number] | null
  >(null);

  const startGame = () => {
    if (!selectedColor) return;

    navigation.replace(SCREENS.colorQuestScreen, {
      selectedColor,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎨 Color Quest</Text>

      <Text style={styles.subtitle}>
        Choose a colour and fill the 3×3 grid with photos matching that colour.
      </Text>

      <View style={styles.colorsContainer}>
        {COLORS.map((color) => (
          <Pressable
            key={color.id}
            onPress={() => setSelectedColor(color)}
            style={[
              styles.colorCircle,
              { backgroundColor: color.hex },
              selectedColor?.id === color.id && styles.selectedCircle,
            ]}
          />
        ))}
      </View>

      {selectedColor && (
        <Text style={styles.selectedText}>Selected: {selectedColor.name}</Text>
      )}

      <PrimaryButton
        label="Start Quest"
        onPress={startGame}
        disabled={!selectedColor}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 40,
    lineHeight: 22,
  },

  colorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 30,
  },

  colorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#666",
  },

  selectedCircle: {
    borderColor: "#fff",
    borderWidth: 5,
    transform: [{ scale: 1.1 }],
  },

  selectedText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 30,
  },

  button: {
    width: "80%",
  },
});
