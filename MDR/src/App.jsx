import NumberTile from './components/NumberTile';
import { useEffect, useRef, useState } from "react";
import Bins from './components/Bins';

export default function App() {
  const digits = Array.from({ length: 8000 }, () => Math.floor(Math.random() * 10));
  const [selectedBin, setSelectedBin] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [sortedIndexes, setSortedIndexes] = useState([]);
  const [highlightedIndexes, setHighlightedIndexes] = useState(new Set());
  const [animatingIndexes, setAnimatingIndexes] = useState(new Set());
  const [binProgress, setBinProgress] = useState([0, 0, 0, 0, 0]);
  const containerRef = useRef(null);

  const cols = 100;

  const validIndexes = new Set();
  const clusterSpacing = 400;
  for (let i = 0; i < digits.length; i += clusterSpacing) {
    const offset = Math.floor(Math.random() * 100);
    const index = i + offset;
    if (index < digits.length) validIndexes.add(index);
  }

  const getNeighborIndexes = (index) => {
    const neighbors = [];
    const rowSize = cols;

    const offsets = [
      -rowSize - 1, -rowSize, -rowSize + 1,
      -1, +1,
      +rowSize - 1, +rowSize, +rowSize + 1,
    ];

    const row = Math.floor(index / rowSize);
    const col = index % rowSize;

    for (const offset of offsets) {
      const neighbor = index + offset;
      const neighborRow = Math.floor(neighbor / rowSize);
      const neighborCol = neighbor % rowSize;

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
      const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = container;
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
    console.log("Selected Digit:", idx);
    const neighbors = getNeighborIndexes(idx);
    neighbors.push(idx);
    setHighlightedIndexes(new Set(neighbors));
    setSortedIndexes((prev) => prev.includes(idx) ? prev : [...prev, idx]);
  };

  const handleBinClick = (binNum) => {
    console.log("Bin selected: ", binNum);
    setSelectedBin(binNum);

    setAnimatingIndexes(new Set(highlightedIndexes));

    setTimeout(() => {
      setSortedIndexes((prev) => [
        ...prev,
        ...Array.from(highlightedIndexes).filter((idx) => !prev.includes(idx))
      ]);
      setAnimatingIndexes(new Set());
      setHighlightedIndexes(new Set());
      setBinProgress((prev) => {
        const copy = [...prev];
        copy[binNum - 1] = Math.min(copy[binNum - 1] + 10, 100);
        return copy;
      });
    }, 2500); // Extended duration for animation
  };

  return (
    <div className="flex flex-col h-screen bg-black">
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
                const isHighlighted = highlightedIndexes.has(idx);
                const isAnimating = animatingIndexes.has(idx);

                let classes = "text-5xl leading-none cursor-pointer transition-transform duration-75 will-change-transform";

                if (isSorted) {
                  classes += " text-yellow-300 scale-110";
                } else if (isAnimating) {
                  classes += " text-white fly-to-bin";
                } else if (isValid) {
                  classes += " text-blue-400 hover:scale-150";
                } else if (isNeighbor) {
                  classes += " text-green-300 hover:scale-110 animate-pulse";
                } else if (isHighlighted) {
                  classes += " text-red-500 scale-110 animate-pulse";
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

      <Bins handleBinClick={handleBinClick} binProgress={binProgress} />
    </div>
  );
}
