import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from "react-native";
import { Swords, ChevronRight } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";
import { MotiView } from "moti";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import commonStyles from "../../constants/commonStyles";
import { GAMES } from "../../constants/staticConstants";
import { isGameInProgress } from "./gameUtils";

const { width } = Dimensions.get("window");
const SECRET_HOLD_MS = 1400;
const RING_SIZE = 46;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function GameCard({ item, index, onPress }: any) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.96, { duration: 100 });
    })
    .onFinalize(() => {
      scale.value = withTiming(1, { duration: 150 });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 450, delay: index * 90 }}
    >
      <GestureDetector gesture={tap}>
        <Animated.View style={[styles.gameItem, cardStyle]}>
          <View style={styles.gameIconWrap}>
            <Swords size={40} color="#c4b5fd" strokeWidth={3} />
          </View>
          <View style={styles.gameTextWrap}>
            <Text style={styles.gameTitle}>{item.title}</Text>
            {item.subtitle ? (
              <Text style={styles.gameSubtitle}>{item.subtitle}</Text>
            ) : null}
          </View>
          <ChevronRight size={26} color="#c4b5fd" strokeWidth={5} />
        </Animated.View>
      </GestureDetector>
    </MotiView>
  );
}

export default function GameListScreen({ navigation, route }: any) {
  const {
    title = "Game Night",
    description = "Get ready to play!",
    minPlayers = 2,
    maxPlayers = 6,
  }: {
    title: string;
    description: string;
    minPlayers?: number;
    maxPlayers?: number;
  } = route?.params || {};

  // --- secret trigger state ---
  const progress = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const titleScale = useSharedValue(1);

  const goToSecretScreen = useCallback(() => {
    navigation.navigate("SecretScreen");
  }, [navigation]);

  const longPress = Gesture.LongPress()
    .minDuration(SECRET_HOLD_MS)
    .onBegin(() => {
      ringOpacity.value = withTiming(1, { duration: 150 });
      progress.value = withTiming(1, {
        duration: SECRET_HOLD_MS,
        easing: Easing.linear,
      });
      titleScale.value = withTiming(1.04, { duration: SECRET_HOLD_MS });
    })
    .onStart(() => {
      titleScale.value = withSpring(1.1);
      runOnJS(goToSecretScreen)();
    })
    .onFinalize((_e, success) => {
      ringOpacity.value = withTiming(0, { duration: success ? 400 : 150 });
      progress.value = withTiming(0, { duration: success ? 400 : 150 });
      titleScale.value = withSpring(1);
    });

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const ringProps = useAnimatedStyle(() => ({}));

  const animatedCircleProps = useAnimatedStyle(() => {
    return {
      strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
    };
  });

  const renderGamesList = ({ item, index }: any) => {
    const { gameScreen, introScreen, id } = item;
    return (
      <GameCard
        item={item}
        index={index}
        onPress={() =>
          navigation.navigate(isGameInProgress(id) ? gameScreen : introScreen)
        }
      />
    );
  };

  return (
    <LinearGradient
      colors={["#fdf7ff", "#f3e8ff", "#ffffff"]}
      style={styles.container}
    >
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.header}
      >
        <GestureDetector gesture={longPress}>
          <View style={styles.titleTouchZone}>
            <Animated.Text style={[styles.title, titleAnimStyle]}>
              {title}
            </Animated.Text>

            {/* progress ring feedback, only visible while holding */}
            <Animated.View
              pointerEvents="none"
              style={[styles.ringWrap, ringStyle]}
            >
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke="#e9d5ff"
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <AnimatedCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke="#9333ea"
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  animatedProps={animatedCircleProps}
                  rotation={-90}
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
            </Animated.View>
          </View>
        </GestureDetector>

        <Text style={styles.description}>{description}</Text>

        {(minPlayers || maxPlayers) && (
          <View style={styles.playersBadge}>
            <Text style={styles.playersBadgeText}>
              {minPlayers && maxPlayers
                ? `${minPlayers}–${maxPlayers} players`
                : minPlayers
                  ? `${minPlayers}+ players`
                  : `Up to ${maxPlayers} players`}
            </Text>
          </View>
        )}
      </MotiView>

      <FlatList
        data={GAMES}
        renderItem={renderGamesList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  titleTouchZone: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#3b0764",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  ringWrap: {
    position: "absolute",
    top: -8,
    right: -width * 0.22,
  },
  description: {
    fontSize: 16,
    color: "#6b21a8",
    opacity: 0.75,
    textAlign: "center",
    marginBottom: 16,
  },
  playersBadge: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  playersBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7e22ce",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  gameItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#7e22ce",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  gameIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#f3e8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  gameIcon: {
    fontSize: 22,
  },
  gameTextWrap: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f0a33",
  },
  gameSubtitle: {
    fontSize: 13,
    color: "#8b8398",
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: "#c4b5fd",
    fontWeight: "300",
  },
});
