import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useAppSelector } from "../../store/hooks";
import commonStyles from "../../constants/commonStyles";
import PrimaryButton from "../../components/PrimaryButton";
import { SCREENS } from "../../constants/staticConstants";

export default function HeadsUpGameScreen({ navigation, route }: any) {
  const players = useAppSelector((state) => state.player.players);

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.playerItem}>
        <Text>{item.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  playerItem: {
    fontSize: 24,
    backgroundColor: "blue",
    padding: 20,
    marginBottom: 10,
    borderRadius: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    alignSelf: "center",
  },
});
