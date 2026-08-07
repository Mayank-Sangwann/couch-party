import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import commonStyles from "../constants/commonStyles";
import PrimaryButton from "./PrimaryButton";

type ResultModalProps = {
  visible: boolean;
  game: string;
  score?: string | number;
  onGoToGames: () => void;
  onPlayAgain?: () => void;
  actionButtonTitle?: string;
  onActionPress?: () => void;
};

export default function ResultModal({
  visible,
  game,
  score,
  onGoToGames,
  onPlayAgain,
  actionButtonTitle,
  onActionPress,
}: ResultModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.emoji}>🎉</Text>

          <Text style={styles.title}>Game Finished!</Text>

          <Text style={styles.game}>{game}</Text>

          {score !== undefined && (
            <Text style={styles.score}>
              Score: <Text style={styles.scoreValue}>{score}</Text>
            </Text>
          )}

          <View style={styles.buttons}>
            {onPlayAgain && (
              <PrimaryButton
                label="Play Again"
                onPress={onPlayAgain}
                style={styles.button}
              />
            )}

            {actionButtonTitle && onActionPress && (
              <PrimaryButton
                label={actionButtonTitle}
                onPress={onActionPress}
                style={styles.button}
              />
            )}

            <PrimaryButton
              label="Back to Games"
              onPress={onGoToGames}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  container: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },

  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },

  title: {
    ...commonStyles.title,
    marginBottom: 8,
  },

  game: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },

  score: {
    fontSize: 20,
    marginBottom: 30,
  },

  scoreValue: {
    fontWeight: "700",
  },

  buttons: {
    width: "100%",
    gap: 14,
  },

  button: {
    width: "100%",
  },
});
