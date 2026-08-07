import { combineReducers } from "@reduxjs/toolkit";
import playerSlice from "../features/Common/playerSlice";
import colorQuestSlice from "../features/ColorQuest/colorQuestSlice";
import headsUpSlice from "../features/HeadsUp/headsUpSlice";

const rootReducer = combineReducers({
  player: playerSlice,
  colorQuest: colorQuestSlice,
  headsUp: headsUpSlice,
});

export default rootReducer;
