import { combineReducers } from "@reduxjs/toolkit";
import playerSlice from "../features/common/playerSlice";

const rootReducer = combineReducers({
  player: playerSlice,
});

export default rootReducer;
