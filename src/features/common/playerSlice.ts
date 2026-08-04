import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Player = {
  id: string;
  name: string;
  color: string;
  score: number;
};

type PlayerState = {
  players: Player[];
  currentPlayerIndex: number;
};

const initialState: PlayerState = {
  players: [],
  currentPlayerIndex: 0,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayers: (state, action: PayloadAction<{ names: string[] }>) => {
      state.players = action.payload.names.map((name, index) => ({
        id: `player-${index + 1}`,
        name,
        color: "#fff",
        score: 0,
      }));
      state.currentPlayerIndex = 0;
    },
    updatePlayerScore: (
      state,
      action: PayloadAction<{ playerId: string; score: number }>,
    ) => {
      const player = state.players.find(
        (p) => p.id === action.payload.playerId,
      );
      if (player) {
        player.score = action.payload.score;
      }
    },
    nextPlayer: (state) => {
      state.currentPlayerIndex =
        (state.currentPlayerIndex + 1) % state.players.length;
    },
  },
});

export const { setPlayers, updatePlayerScore, nextPlayer } =
  playerSlice.actions;
export default playerSlice.reducer;
