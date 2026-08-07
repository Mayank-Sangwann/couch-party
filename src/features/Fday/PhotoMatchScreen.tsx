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
import { MoveRight } from "lucide-react-native";

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
const COLUMN_GAP = 16;
const ARROW_COL_WIDTH = 90;
const AVAILABLE_WIDTH = SCREEN_WIDTH;
const COLUMN_WIDTH = (AVAILABLE_WIDTH - COLUMN_GAP * 2 - ARROW_COL_WIDTH) / 2;
const CARD_SIZE = Math.round(COLUMN_WIDTH * 0.83);
const ROW_HEIGHT = CARD_SIZE + ROW_GAP;

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
  status: RowStatus;
}

// Static (non-draggable) version used in the fixed left column.
const DestinationCard: React.FC<DestinationCardProps> = ({ pair, status }) => (
  <View
    style={[
      styles.destCard,
      status === "correct" && styles.destCardCorrect,
      status === "wrong" && styles.destCardWrong,
    ]}
  >
    <Text style={styles.destPin}>📍</Text>
    <Text style={styles.destText} numberOfLines={2} adjustsFontSizeToFit>
      {pair.destination}
    </Text>
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
  // Left column is now fixed/static and always shows PAIRS in order
  // (Frip 1 -> Frip 8). Only the right (photo) column is draggable.
  // A "match" is: does the photo at row i on the right have the same id
  // as the destination at row i (which is just PAIRS[i]) on the left.
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
    setRightOrder(shuffle(PAIRS));
    setRowStatuses(PAIRS.map(() => null));
  };

  const openPreview = (pairId: string) => {
    const index = PAIRS.findIndex((pair) => pair.id === pairId);
    setPreviewIndex(index === -1 ? 0 : index);
    setPreviewVisible(true);
  };

  const handleConfirm = () => {
    const statuses: RowStatus[] = PAIRS.map((pair, index) =>
      rightOrder[index]?.id === pair.id ? "correct" : "wrong",
    );
    const correctCount = statuses.filter(
      (status) => status === "correct",
    ).length;
    const wrongCount = PAIRS.length - correctCount;

    setRowStatuses(statuses);

    if (correctCount === PAIRS.length) {
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
      <View style={styles.cardSlot}>
        {/* Only the card itself is the drag/long-press target — not the
            full row width — so the outer ScrollView keeps its own gesture
            area free and there's no more fighting between the two. */}
        <Pressable
          onLongPress={drag}
          disabled={isSuccess}
          delayLongPress={150}
          style={styles.dragTarget}
        >
          <PhotoCard
            pair={item}
            isActive={isActive}
            onPreview={() => openPreview(item.id)}
          />
        </Pressable>
      </View>
    </ScaleDecorator>
  );

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
            {/* Left column: static, always in order, not draggable */}
            <View style={styles.leftColumn}>
              {PAIRS.map((pair, index) => (
                <View key={pair.id} style={styles.cardSlot}>
                  <DestinationCard pair={pair} status={rowStatuses[index]} />
                </View>
              ))}
            </View>

            {/* Middle column: decorative direction arrows, one per row */}
            <View style={styles.arrowColumn} pointerEvents="none">
              {PAIRS.map((pair) => (
                <View key={pair.id} style={styles.arrowSlot}>
                  <MoveRight size={80} color="#bcbbbb" />
                </View>
              ))}
            </View>

            {/* Right column: draggable photos */}
            <DraggableFlatList
              data={rightOrder}
              onDragEnd={({ data }) => setRightOrder(data)}
              keyExtractor={(item) => item.id}
              renderItem={renderPhotoItem}
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
              Hold and drag a photo to reorder it
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
    marginVertical: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  columns: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  leftColumn: {
    width: COLUMN_WIDTH,
    alignItems: "center",
  },
  arrowColumn: {
    width: ARROW_COL_WIDTH,
    alignItems: "center",
  },
  arrowSlot: {
    height: ROW_HEIGHT,
    width: ARROW_COL_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  rightColumn: {
    width: COLUMN_WIDTH,
  },
  columnContent: {
    alignItems: "center",
  },
  // Slot reserves the full row height/width for spacing/alignment, but the
  // touchable/draggable surface inside it (dragTarget) is only CARD_SIZE —
  // this is what keeps the outer ScrollView's gesture area separate from
  // the drag gesture and stops the scroll from feeling glitchy.
  cardSlot: {
    marginBottom: ROW_GAP,
    alignItems: "center",
    justifyContent: "center",
    width: COLUMN_WIDTH,
    height: CARD_SIZE,
  },
  dragTarget: {
    width: CARD_SIZE,
    height: CARD_SIZE,
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
    marginBottom: 20,
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
