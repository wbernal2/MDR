import React from 'react';

const Bins = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full flex justify-around p-4">
      {[...Array(5)].map((_, idx) => (
        <div
          key={idx}
          className="w-1/6 h-20 bg-gray-700 border-2 border-green-400 rounded-lg"
        >
          {/* Bin content goes here */}
        </div>
      ))}
    </div>
  );
};

export default Bins;
