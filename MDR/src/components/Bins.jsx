import React from 'react';

const Bins = ({ handleBinClick, binProgress }) => {
  console.log("Rendering Bins Component...");

  return (
    <div className="absolute bottom-0 left-0 w-full flex justify-around p-4">
      {[...Array(5)].map((_, idx) => (
        <div
          key={idx}
          onClick={() => handleBinClick(idx + 1)}
          className="w-1/6 h-20 bg-gray-700 border-2 border-green-400 rounded-lg cursor-pointer hover:bg-gray-600 transition-all"
        >
          <p className="text-center text-white">
            Bin {idx + 1} - {binProgress[idx]}%
          </p>
        </div>
      ))}
    </div>
  );
};

export default Bins;
