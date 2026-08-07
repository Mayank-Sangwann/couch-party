import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { MotiView } from "moti";
import ConfettiCannon from "react-native-confetti-cannon";
import ImageView from "react-native-image-viewing";
import {
  ScrollView,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

interface MatchPair {
  id: string;
  photo: ImageSourcePropType;
  destination: string;
}

type ModalKind = "result" | "gameOver" | null;
type RowStatus = "correct" | "wrong" | null;

interface AttemptResult {
  correct: number;
  wrong: number;
}

// EDIT ME: swap these 5 photos (zoomed-in crops work best — it's more fun to
// guess) and destination names for your own trips together.
const PAIRS: MatchPair[] = [
  {
    id: "1",
    photo: require("../../assests/images/manali.jpg"),
    destination: "Frip 1",
  },
  {
    id: "2",
    photo: require("../../assests/images/jaipur.jpg"),
    destination: "Frip 2",
  },
  {
    id: "3",
    photo: require("../../assests/images/meghalaya.jpg"),
    destination: "Frip 3",
  },
  {
    id: "4",
    photo: require("../../assests/images/shangarh.jpg"),
    destination: "Frip 4",
  },
  {
    id: "5",
    photo: require("../../assests/images/udaipur.jpg"),
    destination: "Frip 5",
  },
  {
    id: "6",
    photo: require("../../assests/images/chopta.jpg"),
    destination: "Frip 6",
  },
  {
    id: "7",
    photo: require("../../assests/images/jodhpur.jpg"),
    destination: "Frip 7",
  },
  {
    id: "8",
    photo: require("../../assests/images/kasol.jpg"),
    destination: "Frip 8",
  },
];

const MAX_ATTEMPTS = 3;
const CARD_RADIUS = 18;
const ROW_GAP = 18;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCREEN_HORIZONTAL_PADDING = 20;
const COLUMN_GAP = 28;
const AVAILABLE_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING * 2;
const COLUMN_WIDTH = (AVAILABLE_WIDTH - COLUMN_GAP) / 2;
const CARD_SIZE = Math.round(COLUMN_WIDTH * 0.7);

const CARD_SHADOW = Platform.select<ViewStyle>({
  ios: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  android: {
    elevation: 6,
  },
  default: {},
}) as ViewStyle;

const shuffle = <T,>(array: T[]): T[] => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

interface HeartsRowProps {
  remaining: number;
  total: number;
}

const HeartsRow: React.FC<HeartsRowProps> = ({ remaining, total }) => (
  <View style={styles.heartsRow}>
    {Array.from({ length: total }).map((_, index) => (
      <Text key={index} style={styles.heartIcon}>
        {index < remaining ? "❤️" : "🤍"}
      </Text>
    ))}
  </View>
);

interface PhotoCardProps {
  pair: MatchPair;
  isActive: boolean;
  onPreview: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ pair, isActive, onPreview }) => (
  <View style={[styles.cardWrapper, isActive && styles.cardWrapperActive]}>
    <View style={styles.cardSurface}>
      <View style={styles.zoomedImageWrapper}>
        <Image
          source={pair.photo}
          style={styles.zoomedImage}
          resizeMode="cover"
        />
      </View>
    </View>

    <Pressable style={styles.previewButton} onPress={onPreview} hitSlop={8}>
      <Text style={styles.previewIcon}>🔍</Text>
    </Pressable>

    <View style={styles.dragHandle} pointerEvents="none">
      <Text style={styles.dragHandleIcon}>⠿</Text>
    </View>
  </View>
);

interface DestinationCardProps {
  pair: MatchPair;
  isActive: boolean;
  status: RowStatus;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  pair,
  isActive,
  status,
}) => (
  <View
    style={[
      styles.destCard,
      isActive && styles.destCardActive,
      status === "correct" && styles.destCardCorrect,
      status === "wrong" && styles.destCardWrong,
    ]}
  >
    <Text style={styles.destPin}>📍</Text>
    <Text style={styles.destText} numberOfLines={2} adjustsFontSizeToFit>
      {pair.destination}
    </Text>

    <View style={styles.dragHandle} pointerEvents="none">
      <Text style={styles.dragHandleIcon}>⠿</Text>
    </View>
  </View>
);

interface GlassModalProps {
  visible: boolean;
  children: React.ReactNode;
}

const GlassModal: React.FC<GlassModalProps> = ({ visible, children }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
  >
    <View style={styles.modalBackdrop}>
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 12 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300 }}
        style={styles.glassCard}
      >
        {children}
      </MotiView>
    </View>
  </Modal>
);

const PhotoMatchScreen = ({ navigation }: any) => {
  // Both columns are independently draggable. A "match" is just: does the
  // item at row i on the left have the same id as the item at row i on the
  // right? No connections map, no line geometry to keep in sync.
  const [leftOrder, setLeftOrder] = useState<MatchPair[]>(() => shuffle(PAIRS));
  const [rightOrder, setRightOrder] = useState<MatchPair[]>(() =>
    shuffle(PAIRS),
  );
  const [rowStatuses, setRowStatuses] = useState<RowStatus[]>(() =>
    PAIRS.map(() => null),
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [heartsRemaining, setHeartsRemaining] = useState(MAX_ATTEMPTS);
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [lastResult, setLastResult] = useState<AttemptResult>({
    correct: 0,
    wrong: 0,
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // react-native-image-viewing wants URI-based ImageSource[]. resolveAssetSource
  // also makes this work later if you swap the URLs for require('../../assets/...').
  const previewImages = PAIRS.map((pair) => ({
    uri: Image.resolveAssetSource(pair.photo).uri,
  }));

  const resetBoard = () => {
    setLeftOrder(shuffle(PAIRS));
    setRightOrder(shuffle(PAIRS));
    setRowStatuses(PAIRS.map(() => null));
  };

  const openPreview = (pairId: string) => {
    const index = PAIRS.findIndex((pair) => pair.id === pairId);
    setPreviewIndex(index === -1 ? 0 : index);
    setPreviewVisible(true);
  };

  const handleConfirm = () => {
    const statuses: RowStatus[] = leftOrder.map((pair, index) =>
      rightOrder[index]?.id === pair.id ? "correct" : "wrong",
    );
    const correctCount = statuses.filter(
      (status) => status === "correct",
    ).length;
    const wrongCount = PAIRS.length - correctCount;

    setRowStatuses(statuses);

    //todo: remove || true, used for tesing only
    if (correctCount === PAIRS.length || true) {
      setIsSuccess(true);
      return;
    }

    const remainingAfterLoss = heartsRemaining - 1;
    setHeartsRemaining(remainingAfterLoss);
    setLastResult({ correct: correctCount, wrong: wrongCount });
    setModalKind(remainingAfterLoss <= 0 ? "gameOver" : "result");
  };

  const handleContinueTrying = () => {
    setModalKind(null);
    resetBoard();
  };

  const handleFullReset = () => {
    setHeartsRemaining(MAX_ATTEMPTS);
    setIsSuccess(false);
    setModalKind(null);
    resetBoard();
  };

  const renderPhotoItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<MatchPair>) => (
    <ScaleDecorator>
      <Pressable
        onLongPress={drag}
        disabled={isSuccess}
        delayLongPress={150}
        style={styles.cardSlot}
      >
        <PhotoCard
          pair={item}
          isActive={isActive}
          onPreview={() => openPreview(item.id)}
        />
      </Pressable>
    </ScaleDecorator>
  );

  const renderDestinationItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<MatchPair>) => {
    const index = getIndex() ?? -1;
    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          disabled={isSuccess}
          delayLongPress={150}
          style={styles.cardSlot}
        >
          <DestinationCard
            pair={item}
            isActive={isActive}
            status={index === -1 ? null : rowStatuses[index]}
          />
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={styles.flex}>
      <LinearGradient
        colors={["#1f0036", "#4a0068", "#ff6f91"]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Level 3 🗺️</Text>
          <Text style={styles.subtitle}>Drag each photo next to its trip</Text>
          <HeartsRow remaining={heartsRemaining} total={MAX_ATTEMPTS} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.columns}>
            <DraggableFlatList
              data={leftOrder}
              onDragEnd={({ data }) => setLeftOrder(data)}
              keyExtractor={(item) => item.id}
              renderItem={renderPhotoItem}
              scrollEnabled={false}
              style={styles.leftColumn}
              contentContainerStyle={styles.columnContent}
              activationDistance={0}
            />

            <DraggableFlatList
              data={rightOrder}
              onDragEnd={({ data }) => setRightOrder(data)}
              keyExtractor={(item) => item.id}
              renderItem={renderDestinationItem}
              scrollEnabled={false}
              style={styles.rightColumn}
              contentContainerStyle={styles.columnContent}
              activationDistance={0}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {isSuccess && (
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300 }}
            >
              <Text style={styles.successBanner}>Perfect Match! 🎉</Text>
            </MotiView>
          )}

          {isSuccess ? (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 300 }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => navigation.navigate("BirthdayScreen")}
              >
                <Text style={styles.primaryButtonText}>Continue ➡️</Text>
              </Pressable>
            </MotiView>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.primaryButtonText}>Confirm Matches</Text>
            </Pressable>
          )}

          {!isSuccess && (
            <Text style={styles.footerHint}>
              Hold and drag a card to reorder a column
            </Text>
          )}
        </View>

        {isSuccess && (
          <ConfettiCannon
            count={140}
            origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
            fadeOut
            autoStart
            explosionSpeed={350}
          />
        )}

        <ImageView
          images={previewImages}
          imageIndex={previewIndex}
          visible={previewVisible}
          onRequestClose={() => setPreviewVisible(false)}
        />

        <GlassModal visible={modalKind === "result"}>
          <Text style={styles.modalEyebrow}>Confirmed</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Correct</Text>
              <Text style={[styles.statValue, styles.statValueGood]}>
                {lastResult.correct} / {PAIRS.length}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Wrong</Text>
              <Text style={[styles.statValue, styles.statValueBad]}>
                {lastResult.wrong} / {PAIRS.length}
              </Text>
            </View>
          </View>

          <Text style={styles.modalSectionLabel}>Attempts Remaining</Text>
          <HeartsRow remaining={heartsRemaining} total={MAX_ATTEMPTS} />

          <Pressable
            style={({ pressed }) => [
              styles.modalButton,
              pressed && styles.pressed,
            ]}
            onPress={handleContinueTrying}
          >
            <Text style={styles.modalButtonText}>Continue Trying</Text>
          </Pressable>
        </GlassModal>

        <GlassModal visible={modalKind === "gameOver"}>
          <Text style={styles.gameOverTitle}>Game Over</Text>
          <Text style={styles.gameOverSubtitle}>No attempts remaining.</Text>

          <Pressable
            style={({ pressed }) => [
              styles.modalButtonLarge,
              pressed && styles.pressed,
            ]}
            onPress={handleFullReset}
          >
            <Text style={styles.modalButtonText}>Reset Game</Text>
          </Pressable>
        </GlassModal>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    width: "100%",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#e8c7e0",
    marginBottom: 10,
    textAlign: "center",
  },
  heartsRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  heartIcon: {
    fontSize: 18,
    marginHorizontal: 2,
  },
  scrollView: {
    flex: 1,
    width: "100%",
    marginTop: 40,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  columns: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  leftColumn: {
    width: COLUMN_WIDTH,
  },
  rightColumn: {
    width: COLUMN_WIDTH,
  },
  columnContent: {
    alignItems: "center",
  },
  cardSlot: {
    marginBottom: ROW_GAP,
    alignItems: "center",
    width: "100%",
  },
  cardWrapper: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_RADIUS,
    position: "relative",
  },
  cardWrapperActive: {
    transform: [{ scale: 1.05 }],
    ...CARD_SHADOW,
  },
  cardSurface: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  zoomedImageWrapper: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  zoomedImage: {
    width: "100%",
    height: "100%",
  },
  previewButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  previewIcon: {
    fontSize: 13,
  },
  dragHandle: {
    position: "absolute",
    bottom: 4,
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  dragHandleIcon: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  destCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_RADIUS,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 8,
    ...CARD_SHADOW,
  },
  destCardActive: {
    transform: [{ scale: 1.05 }],
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  destCardCorrect: {
    borderColor: "#8ce8a8",
    backgroundColor: "rgba(140,232,168,0.18)",
  },
  destCardWrong: {
    borderColor: "#ff9a9a",
    backgroundColor: "rgba(255,154,154,0.18)",
  },
  destPin: {
    fontSize: 20,
    marginBottom: 4,
  },
  destText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  footer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    alignItems: "center",
  },
  successBanner: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },
  primaryButton: {
    minWidth: 200,
    backgroundColor: "#ffd166",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  primaryButtonText: {
    color: "#3a2100",
    fontSize: 18,
    fontWeight: "700",
  },
  footerHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10,0,20,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  glassCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.20)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    ...CARD_SHADOW,
  },
  modalEyebrow: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  statBlock: {
    alignItems: "center",
    paddingHorizontal: 18,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  statValueGood: {
    color: "#8ce8a8",
  },
  statValueBad: {
    color: "#ff9a9a",
  },
  modalSectionLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#ffd166",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  modalButtonLarge: {
    marginTop: 24,
    backgroundColor: "#ffd166",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 28,
  },
  modalButtonText: {
    color: "#3a2100",
    fontSize: 15,
    fontWeight: "700",
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
  },
  gameOverSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
});

export default PhotoMatchScreen;
