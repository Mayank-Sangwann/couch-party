import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import LottieView from "lottie-react-native";
import { MotiView } from "moti";
import Video, { VideoRef } from "react-native-video";
import { Canvas, Circle } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Play } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const FLOATING_BALLOONS_LOTTIE = require("../../assests/lotties/Valentine's Day Love Dancing.json");

const SPARKLE_COUNT = 12;
const SPARKLE_POSITIONS = Array.from({ length: SPARKLE_COUNT }).map((_, i) => ({
  x: (width / SPARKLE_COUNT) * i + 16,
  y: 60 + ((i * 37) % 140),
}));

interface SparkleProps {
  index: number;
  baseX: number;
  baseY: number;
}

const Sparkle: React.FC<SparkleProps> = ({ index, baseX, baseY }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 150,
      withRepeat(withTiming(1, { duration: 1800 + index * 80 }), -1, true),
    );
  }, []);

  const cy = useDerivedValue(() => baseY - progress.value * 18);
  const opacity = useDerivedValue(() => 0.25 + progress.value * 0.75);
  const radius = useDerivedValue(() => 2 + progress.value * 2.5);

  return (
    <Circle cx={baseX} cy={cy} r={radius} color="#ffe27a" opacity={opacity} />
  );
};

const BirthdayScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const overlayOpacity = useSharedValue(1);
  const videoRef = useRef<VideoRef>(null);

  const startPlayback = () => {
    videoRef.current?.seek(0);
    setIsPlaying(true);
  };
  const hideOverlay = () => setShowOverlay(false);

  const playGesture = Gesture.Tap().onEnd(() => {
    runOnJS(startPlayback)();
    overlayOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(hideOverlay)();
      }
    });
  });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <LinearGradient
      colors={["#2b0032", "#6a0f49", "#ff6f91"]}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {SPARKLE_POSITIONS.map((pos, i) => (
            <Sparkle key={i} index={i} baseX={pos.x} baseY={pos.y} />
          ))}
        </Canvas>

        <LottieView
          source={FLOATING_BALLOONS_LOTTIE}
          autoPlay
          loop
          resizeMode="cover"
          style={styles.lottieBackground}
        />

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 700 }}
          style={styles.headlineContainer}
        >
          <Text style={styles.headline}>🤍 Happy Birthday 🤍</Text>
          <Text style={styles.subheadline}>
            To the most amazing person in my life
          </Text>
        </MotiView>

        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={require("../../assests/videos/birthdayVideo.mp4")}
            style={styles.video}
            resizeMode="contain"
            paused={!isPlaying}
            controls={isPlaying}
            onEnd={() => {
              setIsPlaying(false);
              overlayOpacity.value = 1;
              setShowOverlay(true);
            }}
          />
          {showOverlay && (
            <GestureDetector gesture={playGesture}>
              <Animated.View style={[styles.playOverlay, overlayStyle]}>
                <Play size={50} color="#c4b5fd" strokeWidth={4} />
                <Text style={styles.playLabel}>Tap to play your surprise</Text>
              </Animated.View>
            </GestureDetector>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const VIDEO_HEIGHT = height * 0.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  lottieBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
    pointerEvents: "none",
  },
  headlineContainer: {
    alignItems: "center",
    marginTop: 100,
    marginBottom: 100,
  },
  headline: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  subheadline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f2d9ec",
    textAlign: "center",
  },
  videoContainer: {
    width: "69.5%",
    height: VIDEO_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000000",
    alignSelf: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  playLabel: {
    marginTop: 12,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BirthdayScreen;
