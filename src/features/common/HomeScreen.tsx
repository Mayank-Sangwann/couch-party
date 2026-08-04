import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { SCREENS } from "../../constants/staticConstants";

export default function HomeScreen({ navigation }: any) {
  const onStart = () => {
    navigation.navigate(SCREENS.playerSelectorScreen);
  };

  return (
    <View style={styles.container}>
      <Text>Welcome to the Home Screen</Text>
      <Pressable onPress={onStart} style={styles.button}>
        <Text style={{ color: "#fff" }}>Go to Games List</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
});
