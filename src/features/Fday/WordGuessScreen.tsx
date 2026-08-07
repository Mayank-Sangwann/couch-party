import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { MotiView } from "moti";
import ConfettiCannon from "react-native-confetti-cannon";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import PrimaryButton from "../../components/PrimaryButton";
import { SCREENS } from "../../constants/staticConstants";

const SECRET_WORD = "PINGU";
const WORD_LENGTH = SECRET_WORD.length;
const MAX_ATTEMPTS = 6;

const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

type LetterStatus = "correct" | "present" | "absent";

const STATUS_COLORS: Record<LetterStatus, string> = {
  correct: "#4caf6d",
  present: "#e0b23d",
  absent: "#242020",
};

type GameStatus = "playing" | "won" | "lost";

const computeFeedback = (guess: string, answer: string): LetterStatus[] => {
  const result: LetterStatus[] = new Array(answer.length).fill("absent");
  const answerLetters = answer.split("");
  const guessLetters = guess.split("");
  const claimed = new Array(answer.length).fill(false);

  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      result[i] = "correct";
      claimed[i] = true;
    }
  });

  guessLetters.forEach((letter, i) => {
    if (result[i] === "correct") {
      return;
    }
    const matchIndex = answerLetters.findIndex(
      (answerLetter, j) => !claimed[j] && answerLetter === letter,
    );
    if (matchIndex !== -1) {
      result[i] = "present";
      claimed[matchIndex] = true;
    }
  });

  return result;
};

const getKeyboardStatuses = (
  guesses: string[],
): Record<string, LetterStatus> => {
  const priority: Record<LetterStatus, number> = {
    absent: 0,
    present: 1,
    correct: 2,
  };
  const map: Record<string, LetterStatus> = {};

  guesses.forEach((guess) => {
    const statuses = computeFeedback(guess, SECRET_WORD);
    guess.split("").forEach((letter, i) => {
      const status = statuses[i];
      if (!map[letter] || priority[status] > priority[map[letter]]) {
        map[letter] = status;
      }
    });
  });

  return map;
};

interface TileProps {
  letter: string;
  status?: LetterStatus;
  delay: number;
}

const Tile: React.FC<TileProps> = ({ letter, status, delay }) => {
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (status) {
      rotate.value = withDelay(delay, withTiming(180, { duration: 300 }));
    }
  }, [status]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateX: `${rotate.value}deg` }],
    opacity: rotate.value < 90 ? 1 : 0,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateX: `${rotate.value - 180}deg` }],
    opacity: rotate.value >= 90 ? 1 : 0,
    backgroundColor: status ? STATUS_COLORS[status] : "#5b3a66",
  }));

  return (
    <View style={styles.tileWrapper}>
      <Animated.View style={[styles.tile, styles.tileFace, frontStyle]}>
        <Text style={styles.tileLetter}>{letter}</Text>
      </Animated.View>
      <Animated.View style={[styles.tile, styles.tileFace, backStyle]}>
        <Text style={[styles.tileLetter, styles.tileLetterRevealed]}>
          {letter}
        </Text>
      </Animated.View>
    </View>
  );
};

interface KeyProps {
  label: string;
  onPress: () => void;
  status?: LetterStatus;
  wide?: boolean;
}

const Key: React.FC<KeyProps> = ({ label, onPress, status, wide }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: status ? STATUS_COLORS[status] : "#4a2f57",
  }));

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.9, { duration: 80 });
    })
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 120 });
      runOnJS(onPress)();
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[styles.key, wide && styles.keyWide, animatedStyle]}
      >
        <Text style={styles.keyText}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const { width } = Dimensions.get("window");

const WordGuessScreen = ({ navigation }: any) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) {
      return;
    }
    const timeout = setTimeout(() => setMessage(""), 1500);
    return () => clearTimeout(timeout);
  }, [message]);

  const submitGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      setMessage("Not enough letters");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess === SECRET_WORD) {
      setGameStatus("won");
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameStatus("lost");
    }
  };

  const handleKeyPress = (key: string) => {
    if (gameStatus !== "playing") {
      return;
    }
    if (key === "ENTER") {
      submitGuess();
    } else if (key === "BACK") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const handleReset = () => {
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
    setMessage("");
  };

  const keyboardStatuses = getKeyboardStatuses(guesses);
  const attemptsLeft = MAX_ATTEMPTS - guesses.length;

  return (
    <LinearGradient
      colors={["#1f0036", "#4a0068", "#ff6f91"]}
      style={styles.container}
    >
      <Text style={styles.title}>Level 2 🧩</Text>
      <Text style={styles.subtitle}>Guess the secret word</Text>
      <Text style={styles.attemptsText}>
        {gameStatus === "playing" ? `Attempts left: ${attemptsLeft}` : " "}
      </Text>

      <View style={styles.grid}>
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
          const isSubmittedRow = rowIndex < guesses.length;
          const isCurrentRow =
            rowIndex === guesses.length && gameStatus === "playing";
          const rowText = isSubmittedRow
            ? guesses[rowIndex]
            : isCurrentRow
              ? currentGuess
              : "";
          const statuses = isSubmittedRow
            ? computeFeedback(rowText, SECRET_WORD)
            : [];

          return (
            <View key={rowIndex} style={styles.row}>
              {Array.from({ length: WORD_LENGTH }).map((__, colIndex) => (
                <Tile
                  key={colIndex}
                  letter={rowText[colIndex] ?? ""}
                  status={statuses[colIndex]}
                  delay={colIndex * 120}
                />
              ))}
            </View>
          );
        })}
      </View>

      <Text style={styles.messageText}>{message}</Text>

      {gameStatus === "playing" && (
        <View style={styles.keyboard}>
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyboardRow}>
              {row.split("").map((letter) => (
                <Key
                  key={letter}
                  label={letter}
                  status={keyboardStatuses[letter]}
                  onPress={() => handleKeyPress(letter)}
                />
              ))}
            </View>
          ))}
          <View style={styles.keyboardRow}>
            <Key label="ENTER" wide onPress={() => handleKeyPress("ENTER")} />
            <Key label="⌫" wide onPress={() => handleKeyPress("BACK")} />
          </View>
        </View>
      )}

      {gameStatus === "won" && (
        <>
          <ConfettiCannon
            count={150}
            origin={{ x: width / 2, y: -20 }}
            fadeOut
            autoStart
            explosionSpeed={350}
          />
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
          >
            <Text style={styles.resultText}>You got it! 🎉</Text>
          </MotiView>
          <PrimaryButton
            label="Continue"
            style={{ marginTop: 20 }}
            onPress={() => navigation.navigate(SCREENS.photoMatchScreen)}
          />
        </>
      )}

      {gameStatus === "lost" && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.resultContainer}
        >
          <Text style={styles.resultText}>Out of tries — try again! 💭</Text>
          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.pressed,
            ]}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>
        </MotiView>
      )}
    </LinearGradient>
  );
};

const TILE_SIZE = 48;
const TILE_GAP = 6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
    paddingTop: 80,
  },
  subtitle: {
    fontSize: 15,
    color: "#e8c7e0",
    marginBottom: 4,
  },
  attemptsText: {
    fontSize: 13,
    color: "#c9a8d6",
    marginBottom: 16,
  },
  grid: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: TILE_GAP,
  },
  tileWrapper: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginHorizontal: TILE_GAP / 2,
  },
  tile: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  tileFace: {
    backgroundColor: "#5b3a66",
  },
  tileLetter: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  tileLetterRevealed: {
    color: "#ffffff",
  },
  messageText: {
    color: "#ffe27a",
    fontSize: 13,
    marginBottom: 8,
    minHeight: 18,
  },
  keyboard: {
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  keyboardRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  key: {
    minWidth: 30,
    height: 44,
    marginHorizontal: 3,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  keyWide: {
    minWidth: 60,
  },
  keyText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  resultContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  resultText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 16,
    textAlign: "center",
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: "#ffd166",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 26,
  },
  pressed: {
    opacity: 0.75,
  },
  resetButtonText: {
    color: "#3a2100",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default WordGuessScreen;
