import React from 'react';

export default function Bins({ handleBinClick, binProgress, binRefs }) {
  return (
    <div className="flex justify-between items-center p-4 border-t border-green-400 bg-black">
      {[1, 2, 3, 4, 5].map((binNum, idx) => (
        <div
          key={binNum}
          ref={el => binRefs.current[idx] = el}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleBinClick(binNum)}
        >
          <div className="w-16 h-16 border-2 border-green-400 flex items-center justify-center text-lg">
            Bin {binNum}
          </div>
          <div className="w-16 h-2 bg-green-900 mt-1">
            <div
              className="bg-green-400 h-full transition-all"
              style={{ width: `${binProgress[idx]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
