export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const i = new Set<T>();
  a.forEach((v) => {
    if (b.has(v)) {
      i.add(v);
    }
  });
  return i;
};
