import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useState } from "react";
import { useDispatch } from "react-redux";
import DropDownPicker from "react-native-dropdown-picker";
import commonStyles from "../../constants/commonStyles";
import Footer from "../../components/footer";
import Header from "../../components/header";
import InputModal from "../../components/InputModal";
import { setPlayers } from "./playerSlice";
import { PLAYERS_ARRAY, SCREENS } from "../../constants/staticConstants";

export default function PlayerSelectorScreen({ navigation }: any) {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [playersCount, setPlayersCount] = useState<number | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);

  const handlePlayerCountChange = (count: number | null) => {
    if (count === null) {
      setPlayerNames([]);
      return;
    }

    setPlayerNames((prevNames) =>
      Array.from({ length: count }, (_, index) => prevNames[index] ?? ""),
    );
  };

  const updatePlayerName = (index: number, value: string) => {
    setPlayerNames((prev) => {
      const names = [...prev];
      names[index] = value;
      return names;
    });
  };

  const playerSelected = () => {
    const allNamesEntered = playerNames.every((name) => name.trim());

    if (!playersCount || !allNamesEntered) {
      alert("Please enter names for all players.");
      return;
    }

    dispatch(setPlayers({ names: playerNames }));
    navigation.navigate(SCREENS.gameListScreen);
  };

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <Pressable style={styles.input} onPress={() => setEditingPlayer(index)}>
      <Text style={[styles.inputText, !item && { color: "#999" }]}>
        {item || `Player ${index + 1} name`}
      </Text>
    </Pressable>
  );

  return (
    <>
      <Header />

      <View style={styles.container}>
        <Text style={styles.title}>Select Players</Text>

        <Text style={styles.label}>Number of players</Text>

        <DropDownPicker
          open={open}
          value={playersCount}
          items={PLAYERS_ARRAY}
          setOpen={setOpen}
          setValue={setPlayersCount}
          onChangeValue={handlePlayerCountChange}
          placeholder="Select players"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
          textStyle={styles.dropdownText}
          zIndex={1000}
          zIndexInverse={3000}
        />

        {playersCount && (
          <View style={styles.namesContainer}>
            <Text style={styles.label}>Enter player names:</Text>

            <FlatList
              data={playerNames}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={playerNames.length > 3}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      <Footer
        data={{
          customComponent: (
            <Pressable style={styles.button} onPress={playerSelected}>
              <Text style={styles.buttonText}>Start Game</Text>
            </Pressable>
          ),
        }}
        style={{ justifyContent: "center" }}
      />

      <InputModal
        visible={editingPlayer !== null}
        title={`Enter name for Player ${
          editingPlayer !== null ? editingPlayer + 1 : ""
        }`}
        initialValue={editingPlayer !== null ? playerNames[editingPlayer] : ""}
        onSave={(value) => {
          if (editingPlayer !== null) {
            updatePlayerName(editingPlayer, value);
          }

          setEditingPlayer(null);
        }}
        onClose={() => setEditingPlayer(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    justifyContent: "flex-start",
  },
  title: {
    ...commonStyles.title,
    marginBottom: 50,
  },
  label: {
    ...commonStyles.label,
    marginBottom: 20,
  },
  dropdown: {
    ...commonStyles.dropdown,
    marginBottom: 20,
  },
  dropdownBox: {
    ...commonStyles.dropdownBox,
  },
  dropdownText: {
    ...commonStyles.dropdownText,
  },
  button: {
    ...commonStyles.button,
    width: "80%",
  },
  buttonText: {
    ...commonStyles.subtitle,
  },
  namesContainer: {
    width: "100%",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "white",
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
});
