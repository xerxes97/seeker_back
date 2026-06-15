export const stripUndefined = <T extends Record<string, unknown>>(
  obj: T,
): T => {
  const result = {} as T;
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      result[key as keyof T] = obj[key] as T[keyof T];
    }
  }
  return result;
};
