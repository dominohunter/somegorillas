import React, { useState } from 'react';

interface Props {
  title: string;
  count?: number;
}

const TestComponent: React.FC<Props> = ({ title, count = 0 }) => {
  const [value, setValue] = useState<number>(count);

  const handleIncrement = () => {
    setValue(prev => prev + 1);
  };

  return (
    <div className="test-component">
      <h1>{title}</h1>
      <p>Count: {value}</p>
      <button onClick={handleIncrement}>
        Increment
      </button>
    </div>
  );
};

export default TestComponent;