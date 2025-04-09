import NumberTile from './components/NumberTile';

import { useEffect, useRef, useState } from "react";
import Bins from './components/Bins'; // Import Bins component

export default function App() {
  const digits = Array.from({ length: 8000 }, () =>
    Math.floor(Math.random() * 10)
  );

  // Step 1: Generate scattered "feeling" numbers
  const validIndexes = new Set();
  const clusterSpacing = 400;

  for (let i = 0; i < digits.length; i += clusterSpacing) {
    const offset = Math.floor(Math.random() * 100);
    const index = i + offset;
    if (index < digits.length) validIndexes.add(index);
  }

  // Step 2: Calculate neighbors based on grid position
  const cols = 100; // Number of columns in the grid (adjust if needed)
  
  // Correct neighbor calculation based on grid layout
  const getNeighborIndexes = (index) => {
    const neighbors = [];
    const rowSize = cols; // Number of columns in the grid

    const offsets = [
      -rowSize - 1, -rowSize, -rowSize + 1, // Top row
      -1,               /*X*/       +1,     // Left and right of center
      +rowSize - 1, +rowSize, +rowSize + 1, // Bottom row
    ];

    const row = Math.floor(index / rowSize); // Calculate the row of the digit
    const col = index % rowSize; // Calculate the column of the digit

    // Calculate each neighbor index based on row/column position
    for (const offset of offsets) {
      const neighbor = index + offset;
      const neighborRow = Math.floor(neighbor / rowSize);
      const neighborCol = neighbor % rowSize;

      // Make sure the neighbor is within bounds of the grid
      if (
        neighbor >= 0 &&
        neighbor < digits.length &&
        Math.abs(neighborRow - row) <= 1 &&
        Math.abs(neighborCol - col) <= 1
      ) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  };

  const neighborIndexes = new Set();
  validIndexes.forEach((index) => {
    const neighbors = getNeighborIndexes(index);
    neighbors.forEach((n) => neighborIndexes.add(n));
  });

  const [sortedIndexes, setSortedIndexes] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo(container.scrollWidth / 2, container.scrollHeight / 2);
    }
  }, []);

  const handleScroll = () => {
    const container = containerRef.current;
    const buffer = 100;

    if (container) {
      const {
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
      } = container;

      const tooFarLeft = scrollLeft < buffer;
      const tooFarRight = scrollLeft > scrollWidth - clientWidth - buffer;
      const tooFarUp = scrollTop < buffer;
      const tooFarDown = scrollTop > scrollHeight - clientHeight - buffer;

      if (tooFarLeft || tooFarRight || tooFarUp || tooFarDown) {
        container.scrollTo(scrollWidth / 2, scrollHeight / 2);
      }
    }
  };

  const handleDigitClick = (idx) => {
    if (!validIndexes.has(idx)) return;

    setSortedIndexes((prev) =>
      prev.includes(idx) ? prev : [...prev, idx]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Infinite scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-scroll bg-black text-green-400 font-mono text-xl"
      >
        <div className="w-[500vw] h-[500vh] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-10 min-w-[8000px]">
            <div className="grid grid-cols-[repeat(100,minmax(3rem,1fr))] gap-x-6 gap-y-6">
              {digits.map((digit, idx) => {
                const isSorted = sortedIndexes.includes(idx);
                const isValid = validIndexes.has(idx);
                const isNeighbor = neighborIndexes.has(idx);

                let classes = "text-5xl leading-none cursor-pointer transition-transform duration-75 will-change-transform";

                if (isSorted) {
                  classes += " text-yellow-300 scale-110";
                } else if (isValid) {
                  classes += " text-blue-400 hover:scale-150";
                } else if (isNeighbor) {
                  classes += " text-green-300 hover:scale-110 animate-pulse";
                } else {
                  classes += " text-green-400 hover:scale-105";
                }

                return (
                  <span key={idx} onClick={() => handleDigitClick(idx)} className={classes}>
                    {digit}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Insert Bins Component here */}
      <Bins />
    </div>
  );
}
