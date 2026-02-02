/**
 * Platform-agnostic storage abstraction.
 *
 * Each app provides its own adapter at startup:
 * - Web: wraps localStorage in async interface
 * - Native: wraps expo-secure-store or AsyncStorage
 */

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
    throw new Error(
      "StorageAdapter not initialized. Call setStorageAdapter() at app startup."
    );
  }
  return _storage;
}
