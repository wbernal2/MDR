import React from 'react';

export default function Bins({ handleBinClick, binProgress, binRefs }) {
  return (
    <div className="flex justify-between items-center p-3 border-t border-cyan-400 bg-black">
      {[1, 2, 3, 4, 5].map((binNum, idx) => (
        <div
          key={binNum}
          ref={el => binRefs.current[idx] = el}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleBinClick(binNum)}
        >
          <div className="w-16 h-16 border-5 border-cyan-400 flex items-center justify-center text-lg">
            {binNum}
          </div>
          <div className="w-16 h-2 bg-cyan-900 mt-1">
            <div
              className="bg-cyan-400 h-full transition-all"
              style={{ width: `${binProgress[idx]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
