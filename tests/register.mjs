import { register } from "node:module";

// Browser storage for the existing Zustand store, using only synthetic test data.
const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
  clear: () => storage.clear(),
};
register("./typescript-loader.mjs", import.meta.url);
