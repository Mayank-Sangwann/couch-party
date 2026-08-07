import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../features/Common/HomeScreen";
import GameListScreen from "../features/Common/GameListScreen";
import { SCREENS } from "../constants/staticConstants";
import HeadsUpIntroScreen from "../features/HeadsUp/HeadsUpIntroScreen";
import HeadsUpGameScreen from "../features/HeadsUp/HeadsUpGameScreen";
import ColorQuestScreen from "../features/ColorQuest/ColorQuestScreen";
import ColorQuestIntroScreen from "../features/ColorQuest/ColorQuestIntroScreen";
import SecretScreen from "../features/Fday/SecretScreen";
import EmojiPuzzleScreen from "../features/Fday/EmojiPuzzleScreen";
import BirthdayScreen from "../features/Fday/BirthdayScreen";
import WordGuessScreen from "../features/Fday/WordGuessScreen";
import PhotoMatchScreen from "../features/Fday/PhotoMatchScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SCREENS.gameListScreen}
        screenOptions={{ headerShown: false }}
      >
        {/* Common */}
        <Stack.Screen name={SCREENS.homeScreen} component={HomeScreen} />

        <Stack.Screen
          name={SCREENS.gameListScreen}
          component={GameListScreen}
        />

        {/* Games */}
        <Stack.Screen
          name={SCREENS.headsUpIntroScreen}
          options={{ headerShown: true }}
          component={HeadsUpIntroScreen}
        />
        <Stack.Screen
          name={SCREENS.headsUpScreen}
          options={{ headerShown: true }}
          component={HeadsUpGameScreen}
        />
        <Stack.Screen
          name={SCREENS.colorQuestIntroScreen}
          options={{ headerShown: true }}
          component={ColorQuestIntroScreen}
        />
        <Stack.Screen
          name={SCREENS.colorQuestScreen}
          options={{ headerShown: true }}
          component={ColorQuestScreen}
        />

        {/* F-day secret flow */}
        <Stack.Screen name={SCREENS.secretScreen} component={SecretScreen} />
        <Stack.Screen
          name={SCREENS.emojiPuzzleScreen}
          component={EmojiPuzzleScreen}
        />
        <Stack.Screen
          name={SCREENS.wordGuessScreen}
          component={WordGuessScreen}
        />
        <Stack.Screen
          name={SCREENS.photoMatchScreen}
          component={PhotoMatchScreen}
        />
        <Stack.Screen
          name={SCREENS.birthdayScreen}
          component={BirthdayScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
