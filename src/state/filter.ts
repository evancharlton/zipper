import { atom } from 'recoil';

export const kommuneState = atom({
  key: 'kommune-query',
  default: '',
});

export const nummerState = atom({
  key: 'nummer-query',
  default: '',
});
