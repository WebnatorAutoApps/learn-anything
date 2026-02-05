/**
 * Platform-agnostic storage abstraction.
 *
 * Each app provides its own adapter at startup:
 * - Web: wraps localStorage in async interface
 * - Native: wraps expo-secure-store or AsyncStorage
 */

import { ERROR_MESSAGES } from "./constants/errors";

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

let _storage: StorageAdapter | null = null;

export function setStorageAdapter(adapter: StorageAdapter) {
  _storage = adapter;
}

export function getStorage(): StorageAdapter {
  if (!_storage) {
    throw new Error(ERROR_MESSAGES.STORAGE_NOT_INITIALIZED);
  }
  return _storage;
}
