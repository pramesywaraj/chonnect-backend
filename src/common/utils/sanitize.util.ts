export const sanitizeObject = (
  obj: Record<string, any>,
  fields: string[] = [],
): Record<string, any> => {
  const result: Record<string, any> = { ...obj };
  for (const key of fields) {
    if (key in result) result[key] = '[HIDDEN]';
  }

  return result;
};
