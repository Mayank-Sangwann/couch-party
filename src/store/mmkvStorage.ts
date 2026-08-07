import { storage } from "./mmkv";

export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },

  getItem: (key: string) => {
    return Promise.resolve(storage.getString(key) ?? null);
  },

  removeItem: (key: string) => {
    storage.remove(key);
    return Promise.resolve();
  },
};
