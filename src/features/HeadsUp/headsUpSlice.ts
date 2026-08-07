import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { COLOR_MAP, GAME_STATUS } from "../../constants/staticConstants";

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export type HeadsUpState = {
  gameStatus: GameStatus;
};

const initialState: HeadsUpState = {
  gameStatus: GAME_STATUS.NOT_STARTED,
};

const headsUpSlice = createSlice({
  name: "headsUp",
  initialState,
  reducers: {
    startGame: (state) => {
      state.gameStatus = GAME_STATUS.IN_PROGRESS;
    },

    resetGame: () => initialState,
  },
});

export const { startGame, resetGame } = headsUpSlice.actions;
export default headsUpSlice.reducer;
