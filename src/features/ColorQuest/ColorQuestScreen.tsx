import React, { useMemo, useState } from "react";
import {
  ActionSheetIOS,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ImageView from "react-native-image-viewing";
import commonStyles from "../../constants/commonStyles";
import PrimaryButton from "../../components/PrimaryButton";
import { COLOR_MAP, SCREENS } from "../../constants/staticConstants";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addPhoto, deletePhoto, finishGame } from "./colorQuestSlice";
import ResultModal from "../../components/ResultModal";

export default function ColorQuestGameScreen({ navigation }: any) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { selectedColor, photoGrid } = useAppSelector(
    (state) => state.colorQuest,
  );

  const color = useMemo(() => {
    if (!selectedColor) return null;
    return COLOR_MAP[selectedColor.name.toLowerCase()];
  }, [selectedColor]);

  const completedPhotos = photoGrid.filter((item) => item.uri).length;

  const completed = completedPhotos === 9;

  const pickFromCamera = async (cellIndex: number) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      dispatch(
        addPhoto({
          cellIndex,
          uri: result.assets[0].uri,
        }),
      );
    }
  };

  const pickFromGallery = async (cellIndex: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      dispatch(
        addPhoto({
          cellIndex,
          uri: result.assets[0].uri,
        }),
      );
    }
  };

  const openPicker = (cellIndex: number) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Camera", "Gallery"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              pickFromCamera(cellIndex);
              break;

            case 2:
              pickFromGallery(cellIndex);
              break;
          }
        },
      );
    } else {
      Alert.alert("Choose Image", "", [
        {
          text: "Camera",
          onPress: () => pickFromCamera(cellIndex),
        },
        {
          text: "Gallery",
          onPress: () => pickFromGallery(cellIndex),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    }
  };

  const existingImageOptions = (cellIndex: number) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Preview", "Retake", "Delete"],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              setPreviewUri(photoGrid[cellIndex].uri);
              setPreviewVisible(true);
              break;

            case 2:
              openPicker(cellIndex);
              break;

            case 3:
              dispatch(deletePhoto({ cellIndex }));
              break;
          }
        },
      );
    } else {
      Alert.alert("Photo", "", [
        {
          text: "Preview",
          onPress: () => {
            setPreviewUri(photoGrid[cellIndex].uri);
            setPreviewVisible(true);
          },
        },
        {
          text: "Retake",
          onPress: () => openPicker(cellIndex),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deletePhoto({ cellIndex })),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    }
  };

  const onCellPress = (cellIndex: number) => {
    if (photoGrid[cellIndex].uri) {
      existingImageOptions(cellIndex);
      return;
    }

    openPicker(cellIndex);
  };

  const renderItem = ({ item }: any) => (
    <Pressable
      style={[
        styles.cell,
        {
          borderColor: color?.hex ?? "#ffffff",
        },
      ]}
      onPress={() => onCellPress(item.cellIndex)}
    >
      {item.uri ? (
        <Image
          source={{
            uri: item.uri,
          }}
          style={styles.image}
        />
      ) : (
        <Text style={styles.plus}>+</Text>
      )}
    </Pressable>
  );

  const handleCompleteQuest = () => {
    dispatch(finishGame());
    setResultModalVisible(true);
  };

  const handleOnGoToGames = () => {
    setResultModalVisible(false);
    navigation.navigate(SCREENS.gameListScreen);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Color Quest</Text>

      {color && (
        <View style={styles.header}>
          <View
            style={[
              styles.colorIndicator,
              {
                backgroundColor: color.hex,
              },
            ]}
          />

          <Text style={styles.colorName}>Find 9 {color.name} objects</Text>
        </View>
      )}

      <FlatList
        data={photoGrid}
        renderItem={renderItem}
        keyExtractor={(item) => item.cellIndex.toString()}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />

      <Text style={styles.progress}>{completedPhotos} / 9 Photos</Text>

      {completed && (
        <PrimaryButton
          label="Complete Quest"
          onPress={handleCompleteQuest}
          style={{
            marginTop: 30,
          }}
        />
      )}

      <ImageView
        images={previewUri ? [{ uri: previewUri }] : []}
        imageIndex={0}
        visible={previewVisible}
        onRequestClose={() => {
          setPreviewVisible(false);
          setPreviewUri(null);
        }}
      />

      <ResultModal
        visible={resultModalVisible}
        game="Color Quest"
        onGoToGames={handleOnGoToGames}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  colorIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#555",
  },

  colorName: {
    fontSize: 18,
    fontWeight: "600",
  },

  grid: {
    gap: 10,
  },

  row: {
    gap: 10,
    marginBottom: 10,
  },

  cell: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 3,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  plus: {
    fontSize: 40,
    fontWeight: "300",
  },

  progress: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: "600",
  },
});
