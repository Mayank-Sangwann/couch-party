import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import commonStyles from "../../constants/commonStyles";
import { GAMES } from "../../constants/staticConstants";

export default function GameListScreen({ navigation, route }: any) {
  const {
    title = "Game Intro",
    description = "Get ready to play!",
    minPlayers = 2,
    maxPlayers = 6,
  }: {
    title: string;
    description: string;
    minPlayers?: number;
    maxPlayers?: number;
  } = route?.params || {};

  const renderGamesList = ({ item }: any) => {
    const { title, screen } = item;

    return (
      <Pressable
        style={styles.gameItem}
        onPress={() => navigation.navigate(screen)}
      >
        <Text>{title}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>{description}</Text>

      {(minPlayers || maxPlayers) && (
        <Text style={styles.players}>
          Players:{" "}
          {minPlayers && maxPlayers
            ? `${minPlayers}–${maxPlayers}`
            : minPlayers
              ? `${minPlayers}+`
              : `Up to ${maxPlayers}`}
        </Text>
      )}

      <FlatList
        data={GAMES}
        renderItem={renderGamesList}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 50,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    opacity: 0.85,
    textAlign: "center",
    marginBottom: 20,
  },
  players: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 40,
  },
  gameItem: {
    fontSize: 24,
    backgroundColor: "green",
    padding: 20,
    marginBottom: 10,
    borderRadius: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
});
