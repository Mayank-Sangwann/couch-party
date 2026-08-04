import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import commonStyles from "../../constants/commonStyles";

export default function ColorQuestGameScreen({ route }: any) {
  const { selectedColor } = route.params;

  const [grid, setGrid] = useState<(string | null)[]>(Array(9).fill(null));

  const onCellPress = (index: number) => {
    // TODO:
    // Open camera
    // Capture image
    // Save image URI in grid[index]

    const updatedGrid = [...grid];
    updatedGrid[index] = "placeholder";
    setGrid(updatedGrid);
  };

  const completed = grid.every((cell) => cell !== null);

  const renderItem = ({ item, index }: any) => (
    <Pressable
      style={[
        styles.cell,
        {
          borderColor: selectedColor.hex,
        },
      ]}
      onPress={() => onCellPress(index)}
    >
      {item ? (
        <Image
          source={{
            uri: "https://picsum.photos/200",
          }}
          style={styles.image}
        />
      ) : (
        <Text style={styles.plus}>+</Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Color Quest</Text>

      <View style={styles.header}>
        <View
          style={[
            styles.colorIndicator,
            {
              backgroundColor: selectedColor.hex,
            },
          ]}
        />

        <Text style={styles.colorName}>
          Find 9 {selectedColor.name} objects
        </Text>
      </View>

      <FlatList
        data={grid}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />

      <Text style={styles.progress}>
        {grid.filter(Boolean).length} / 9 Photos
      </Text>

      {completed && <Text style={styles.completed}>🎉 Quest Completed!</Text>}
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
    borderWidth: 3,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#222",
  },

  plus: {
    fontSize: 40,
    fontWeight: "300",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  progress: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: "600",
  },

  completed: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "700",
    color: "#2ecc71",
  },
});
