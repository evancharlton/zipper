import React, { useCallback } from 'react';

type Props = Pick<HTMLInputElement, 'placeholder' | 'value'> & {
  onChange: (value: string) => void;
};

const SearchInput = ({ placeholder, value, onChange }: Props) => {
  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
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
      onChange={onChangeHandler}
      placeholder={placeholder}
      value={value}
      autoFocus
    />
  );
};

export default SearchInput;
