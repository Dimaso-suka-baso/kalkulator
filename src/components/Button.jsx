// components/Button.jsx
import React from 'react';

const Button = ({ value, onClick }) => {
  const isOperator = ['/', '*', '-', '+', '^', '√'].includes(value);
  const isEquals = value === '=';
  const isWide = value === '=';

  return (
    <button
      className={`calc-button ${isOperator ? 'operator' : ''} ${isEquals ? 'equals' : ''} ${isWide ? 'wide' : ''}`}
      onClick={() => onClick(value)}
    >
      {value}
    </button>
  );
};

export default Button;
