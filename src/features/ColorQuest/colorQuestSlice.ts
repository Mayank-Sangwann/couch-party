import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GAME_STATUS } from "../../constants/staticConstants";

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export type ColorQuestState = {
  gameStatus: GameStatus;
  selectedColor: string[];
};

const initialState: ColorQuestState = {
  gameStatus: GAME_STATUS.NOT_STARTED,
  selectedColor: [],
};

const colorQuestSlice = createSlice({
  name: "colorQuest",
  initialState,
  reducers: {},
});

export const {} = colorQuestSlice.actions;
export default colorQuestSlice.reducer;
