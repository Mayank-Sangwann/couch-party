export const SCREENS = {
  homeScreen: "HomeScreen",
  playerSelectorScreen: "PlayerSelectorScreen",
  gameListScreen: "GameListScreen",
  gameResultScreen: "GameResultScreen",
  headsUpIntroScreen: "HeadsUpIntroScreen",
  headsUpScreen: "HeadsUpScreen",
  colorQuestIntroScreen: "ColorQuestIntroScreen",
  colorQuestScreen: "ColorQuestScreen",
};

export const PLAYERS_ARRAY = [
  { label: "1 Player", value: 1 },
  { label: "2 Players", value: 2 },
  { label: "3 Players", value: 3 },
  { label: "4 Players", value: 4 },
  { label: "5 Players", value: 5 },
  { label: "6 Players", value: 6 },
];

export const GAMES = [
  {
    id: "headsUp",
    title: "Heads Up",
    screen: SCREENS.headsUpIntroScreen,
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: "colorQuest",
    title: "Color Quest",
    screen: SCREENS.colorQuestIntroScreen,
    minPlayers: 2,
    maxPlayers: 8,
  },
];

export const GAME_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export const HEADSUPDATA = [
  "cat",
  "dog",
  "bike",
  "car",
  "space",
  "mountains",
  "rock",
  "music",
  "gun",
];
