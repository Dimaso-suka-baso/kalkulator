import React, { useEffect, useRef } from 'react';

const Display = ({ input, result }) => {
  const displayRef = useRef(null);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [input]);

  return (
    <div className="display-container" ref={displayRef}>
      <div className="input">{input || '0'}</div>
      <div className="result">{result}</div>
    </div>
  );
};

export default Display;
