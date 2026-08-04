import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../features/common/HomeScreen";
import PlayerSelectorScreen from "../features/common/PlayerSelectorScreen";
import GameListScreen from "../features/common/GameListScreen";
import { SCREENS } from "../constants/staticConstants";
import HeadsUpIntroScreen from "../features/HeadsUp/HeadsUpIntroScreen";
import HeadsUpGameScreen from "../features/HeadsUp/HeadsUpGameScreen";
import ColorQuestScreen from "../features/ColorQuest/ColorQuestScreen";
import ColorQuestIntroScreen from "../features/ColorQuest/ColorQuestIntroScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SCREENS.homeScreen}
        screenOptions={{ headerShown: false }}
      >
        {/* Common */}
        <Stack.Screen name={SCREENS.homeScreen} component={HomeScreen} />

        <Stack.Screen
          name={SCREENS.playerSelectorScreen}
          component={PlayerSelectorScreen}
        />

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
