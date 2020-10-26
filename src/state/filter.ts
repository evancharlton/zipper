import { atom, selector } from 'recoil';

export const nummerState = atom({
  key: 'nummer-query',
  default: '',
});

export const nummerPattern = selector({
  key: 'nummer-query-pattern',
  get: ({ get }) => {
    const query = get(nummerState);
    let out = query;
    while (out.length < 4) {
      out += 'x';
    }
    return out;
  },
});
