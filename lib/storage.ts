const memoryStore = new Map<string, string>();
let storageAvailable: boolean | null = null;

function isStorageAvailable(): boolean {
  if (storageAvailable !== null) return storageAvailable;

  try {
    const key = "__test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }

  return storageAvailable;
}

export function safeGetItem(key: string): string | null {
  if (isStorageAvailable()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }
  return memoryStore.get(key) ?? null;
}

export function safeSetItem(key: string, value: string): void {
  if (isStorageAvailable()) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
    }
  }
  memoryStore.set(key, value);
}

export function safeRemoveItem(key: string): void {
  if (isStorageAvailable()) {
    try {
      localStorage.removeItem(key);
      return;
    } catch {
    }
  }
  memoryStore.delete(key);
}

export function isStorageBlocked(): boolean {
  return !isStorageAvailable();
}
