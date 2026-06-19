 class ExecutionStore {
  private static values = new Map<string, string>();

  public static set(key: string, value: unknown): void {
    if (!key || !key.trim()) {
      throw new Error('ExecutionStore key must be a non-empty string.');
    }

    // Treat null/undefined as clear to avoid stale values in long test runs.
    if (value === undefined || value === null) {
      this.values.delete(key);
      delete process.env[key];
      return;
    }

    const stringValue = String(value);
    this.values.set(key, stringValue);
    process.env[key] = stringValue;
  }

  public static get(key: string): string {
    if (!key || !key.trim()) {
      throw new Error('ExecutionStore key must be a non-empty string.');
    }

    const runtimeValue = this.values.get(key);
    if (runtimeValue !== undefined) {
      return runtimeValue;
    }

    const envValue = process.env[key];
    if (envValue !== undefined) {
      this.values.set(key, envValue);
      return envValue;
    }

    throw new Error(`ExecutionStore value for key "${key}" is not set.`);
  }
}

export const setEnvVar = (key: string, value: unknown): void => {
  ExecutionStore.set(key, value);
};

export const getEnvVar = (key: string): string => {
  return ExecutionStore.get(key);
};

export default ExecutionStore;