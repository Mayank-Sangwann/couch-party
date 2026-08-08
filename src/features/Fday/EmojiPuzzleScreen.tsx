import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";

const CLUES: { emojis: string; level: string }[] = [
  { emojis: "👩‍❤️‍👨", level: "love" },
  { emojis: "🏝️ 👫", level: "easy" },
  { emojis: "🇵🇰 📺 👫", level: "medium" },
  { emojis: "👩🏻 🎶 🧎🏻‍♀️ 🔢", level: "hard" },
];

const PASSCODE = "38316";

const { width } = Dimensions.get("window");

const EmojiPuzzleScreen = ({ navigation }: any) => {
  const [digits, setDigits] = useState<string[]>(() =>
    Array(PASSCODE.length).fill(""),
  );
  const [hasError, setHasError] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const code = useMemo(() => digits.join(""), [digits]);

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  };

  const handleDigitChange = (index: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    const nextDigit = sanitized.slice(-1);

    setHasError(false);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });

    if (nextDigit && index < PASSCODE.length - 1) {
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (nextDigit && index === PASSCODE.length - 1) {
      const finalCode = [...digits.slice(0, index), nextDigit].join("");
      checkCode(finalCode);
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
    }
  };

  const checkCode = (candidate: string) => {
    if (candidate === PASSCODE) {
      setIsSolved(true);
      return;
    }

    setHasError(true);
    triggerShake();
    setDigits(Array(PASSCODE.length).fill(""));
    inputRefs.current[0]?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient
        colors={["#1f0036", "#4a0068", "#ff6f91"]}
        style={styles.container}
      >
        <View style={styles.scrollContent}>
          <Text style={styles.title}>Level 1 💫</Text>
          <Text style={styles.subtitle}>
            Decode the clues, then enter the passcode above
          </Text>

          {isSolved ? (
            <View style={styles.solvedBanner}>
              <Text style={styles.solvedText}>✅ Passcode correct!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.passcodeLabel}>Enter passcode</Text>
              <Animated.View style={[styles.passcodeRow, shakeStyle]}>
                {digits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.passcodeBox,
                      hasError && styles.passcodeBoxError,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleDigitChange(index, value)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(index, nativeEvent.key)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </Animated.View>
              {hasError && (
                <Text style={styles.errorText}>Not quite, try again 💭</Text>
              )}
            </>
          )}

          {CLUES.map((clue, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.level}>{clue.level}</Text>
              <Text style={styles.emojis}>{clue.emojis}</Text>
            </View>
          ))}

          {isSolved && (
            <>
              <ConfettiCannon
                count={120}
                origin={{ x: width / 2, y: -20 }}
                fadeOut
                autoStart
                explosionSpeed={350}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.continueButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => navigation.navigate("WordGuessScreen")}
              >
                <Text style={styles.continueButtonText}>Continue ➡️</Text>
              </Pressable>
            </>
          )}
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    padding: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#e8c7e0",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  emojis: {
    fontSize: 40,
    marginBottom: 8,
  },
  level: {
    fontSize: 14,
    color: "#e8c7e0",
    fontStyle: "italic",
    textAlign: "center",
  },
  passcodeLabel: {
    fontSize: 14,
    color: "#e8c7e0",
    marginBottom: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  passcodeBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  passcodeBoxError: {
    borderColor: "#ff6f91",
    backgroundColor: "rgba(255,111,145,0.15)",
  },
  errorText: {
    color: "#ff9a9a",
    marginBottom: 28,
    fontSize: 13,
  },
  solvedBanner: {
    marginBottom: 32,
  },
  passcodeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  solvedText: {
    fontSize: 22,
    color: "#4caf6d",
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 18,
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: "#ffd166",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  pressed: {
    opacity: 0.75,
  },
  continueButtonText: {
    color: "#3a2100",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default EmojiPuzzleScreen;
