import React, { useCallback } from 'react';

type Props = Pick<HTMLInputElement, 'placeholder' | 'value'> & {
  onChange: (value: string) => void;
};

const SearchInput = ({ placeholder, value, onChange }: Props) => {
  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.replace(/[^0-9]/, ''));
    },
    [onChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      let value = e.currentTarget.value;
      if (!value) {
        return;
      }

      let lastDigit = +value.charAt(value.length - 1);
      switch (e.key) {
        case 'ArrowUp': {
          lastDigit += 1;
          break;
        }
        case 'ArrowDown': {
          lastDigit -= 1;
          break;
        }
      }
      lastDigit = (lastDigit + 10) % 10;

      value = value.replace(/[0-9]$/, String(lastDigit));
      onChange(String(value));
    },
    [onChange]
  );

  return (
    <input
      style={{
        backgroundColor: 'transparent',
        fontSize: 20,
        border: '1px solid #fff3',
        borderRadius: 5,
        padding: 5,
        color: '#fffa',
      }}
      maxLength={4}
      inputMode="numeric"
      onKeyDown={onKeyDown}
      onChange={onChangeHandler}
      placeholder={placeholder}
      value={value}
      autoFocus
    />
  );
};

export default SearchInput;
