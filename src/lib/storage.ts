export function loadData<T>(
  key: string,
  defaultValue: T,
): T {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return defaultValue;
    }

    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

export function saveData<T>(
  key: string,
  value: T,
) {
  localStorage.setItem(
    key,
    JSON.stringify(value),
  );
}
