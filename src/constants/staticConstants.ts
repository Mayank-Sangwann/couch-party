export const SCREENS = {
  homeScreen: "HomeScreen",
  gameListScreen: "GameListScreen",
  gameResultScreen: "GameResultScreen",
  headsUpIntroScreen: "HeadsUpIntroScreen",
  headsUpScreen: "HeadsUpScreen",
  colorQuestIntroScreen: "ColorQuestIntroScreen",
  colorQuestScreen: "ColorQuestScreen",
  secretScreen: "SecretScreen",
  emojiPuzzleScreen: "EmojiPuzzleScreen",
  wordGuessScreen: "WordGuessScreen",
  photoMatchScreen: "PhotoMatchScreen",
  birthdayScreen: "BirthdayScreen",
};

export const PLAYERS_ARRAY = [
  { label: "1 Player", value: 1 },
  { label: "2 Players", value: 2 },
  { label: "3 Players", value: 3 },
  { label: "4 Players", value: 4 },
  { label: "5 Players", value: 5 },
  { label: "6 Players", value: 6 },
];

export const GAME_IDS = {
  COLOR_QUEST: "colorQuest",
  HEADS_UP: "headsUp",
  CATCH_THE_SPY: "catchTheSpy",
  HOT_POTATO_EXTREME: "hotPotatoExtreme",
  BOMB_PASS: "bombPass",
} as const;

export const GAMES = [
  {
    id: "headsUp",
    title: "Heads Up",
    introScreen: SCREENS.headsUpIntroScreen,
    gameScreen: SCREENS.headsUpScreen,
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: "colorQuest",
    title: "Color Quest",
    introScreen: SCREENS.colorQuestIntroScreen,
    gameScreen: SCREENS.colorQuestScreen,
    minPlayers: 1,
    maxPlayers: 8,
  },
];

export const GAME_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export const COLOR_MAP: Record<string, { name: string; hex: string }> = {
  red: {
    name: "Red",
    hex: "#FF3B30",
  },
  orange: {
    name: "Orange",
    hex: "#FF9500",
  },
  yellow: {
    name: "Yellow",
    hex: "#FFCC00",
  },
  green: {
    name: "Green",
    hex: "#34C759",
  },
  blue: {
    name: "Blue",
    hex: "#0A84FF",
  },
  purple: {
    name: "Purple",
    hex: "#AF52DE",
  },
  white: {
    name: "White",
    hex: "#FFFFFF",
  },
  black: {
    name: "Black",
    hex: "#000000",
  },
};

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
