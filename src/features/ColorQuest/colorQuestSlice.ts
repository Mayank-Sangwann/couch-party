import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { COLOR_MAP, GAME_STATUS } from "../../constants/staticConstants";

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export type ColorQuestState = {
  gameStatus: GameStatus;
  selectedColor: (typeof COLOR_MAP)[keyof typeof COLOR_MAP] | null;
  photoGrid: { cellIndex: number; uri: string | null }[];
};

const initialState: ColorQuestState = {
  gameStatus: GAME_STATUS.NOT_STARTED,
  selectedColor: null,
  photoGrid: Array.from({ length: 9 }, (_, index) => ({
    cellIndex: index,
    uri: null,
  })),
};

const colorQuestSlice = createSlice({
  name: "colorQuest",
  initialState,
  reducers: {
    startGame: (
      state,
      action: PayloadAction<{
        selectedColor: (typeof COLOR_MAP)[keyof typeof COLOR_MAP];
      }>,
    ) => {
      state.gameStatus = GAME_STATUS.IN_PROGRESS;
      state.selectedColor = action.payload.selectedColor;
    },

    addPhoto: (
      state,
      action: PayloadAction<{
        cellIndex: number;
        uri: string;
      }>,
    ) => {
      state.photoGrid[action.payload.cellIndex].uri = action.payload.uri;
    },

    deletePhoto: (
      state,
      action: PayloadAction<{
        cellIndex: number;
      }>,
    ) => {
      state.photoGrid[action.payload.cellIndex].uri = null;
    },

    finishGame: (state) => {
      state.gameStatus = GAME_STATUS.COMPLETED;
      state.photoGrid = Array.from({ length: 9 }, (_, index) => ({
        cellIndex: index,
        uri: null,
      }));
    },

    resetGame: () => initialState,
  },
});

export const { startGame, addPhoto, deletePhoto, finishGame, resetGame } =
  colorQuestSlice.actions;
export default colorQuestSlice.reducer;
