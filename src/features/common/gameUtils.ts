// gameUtils.ts

import { store } from "../../store";
import { GAME_STATUS, GAME_IDS } from "../../constants/staticConstants";

export const isGameInProgress = (gameId: string) => {
  const state = store.getState();

  switch (gameId) {
    case GAME_IDS.COLOR_QUEST:
      return state.colorQuest.gameStatus === GAME_STATUS.IN_PROGRESS;

    default:
      return false;
  }
};
