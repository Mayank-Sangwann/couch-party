import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import LottieView from "lottie-react-native";
import { MotiView } from "moti";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SCREENS } from "../../constants/staticConstants";
import { Gift } from "lucide-react-native";

const GIFT_EMOJI = "🎁";

const FLOATING_HEARTS_LOTTIE = require("../../assests/lotties/Butterfly hearts.json");

const SecretScreen = ({ navigation }: any) => {
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const giftScale = useSharedValue(1);

  const giftAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: giftScale.value }],
  }));

  const handleUnwrap = () => {
    setIsUnwrapped(true);
  };

  const unwrapGesture = Gesture.Tap()
    .onBegin(() => {
      giftScale.value = withTiming(0.85, { duration: 100 });
    })
    .onEnd(() => {
      giftScale.value = withTiming(1, { duration: 150 });
      runOnJS(handleUnwrap)();
    });

  return (
    <LinearGradient
      colors={["#1f0036", "#5c0f49", "#ff6f91"]}
      style={styles.container}
    >
      <LottieView
        source={FLOATING_HEARTS_LOTTIE}
        autoPlay
        loop
        resizeMode="cover"
        style={styles.lottieBackground}
      />

      <Text style={styles.title}>Shhh... 🤫</Text>
      <Text style={styles.subtitle}>You weren't supposed to find this...</Text>

      {!isUnwrapped ? (
        <GestureDetector gesture={unwrapGesture}>
          <Animated.View style={[styles.giftContainer, giftAnimatedStyle]}>
            <Text style={styles.giftEmoji}>{GIFT_EMOJI}</Text>
            <Text style={styles.tapHint}>Tap to unwrap</Text>
          </Animated.View>
        </GestureDetector>
      ) : (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.startContainer}
        >
          <Text style={styles.revealText}>
            A little adventure awaits you 💌
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.navigate(SCREENS.emojiPuzzleScreen)}
          >
            <Text style={styles.startButtonText}>Start ✨</Text>
          </Pressable>
        </MotiView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lottieBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    pointerEvents: "none",
  },
  title: {
    fontSize: 38,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e8c7e0",
    marginBottom: 48,
    textAlign: "center",
  },
  giftContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  giftEmoji: {
    fontSize: 150,
  },
  tapHint: {
    marginTop: 16,
    fontSize: 18,
    color: "#f2d9ec",
    fontStyle: "italic",
  },
  startContainer: {
    alignItems: "center",
  },
  revealText: {
    fontSize: 20,
    color: "#ffffff",
    marginBottom: 24,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#ff6f91",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  pressed: {
    opacity: 0.75,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default SecretScreen;
