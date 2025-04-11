import NumberTile from './components/NumberTile';
import { useEffect, useRef, useState } from "react";
import Bins from './components/Bins';

export default function App() {
  const digits = Array.from({ length: 8000 }, () => Math.floor(Math.random() * 10));
  const [selectedBin, setSelectedBin] = useState(null);
  const [sortedIndexes, setSortedIndexes] = useState([]);
  const [highlightedIndexes, setHighlightedIndexes] = useState(new Set());
  const [animatingIndexes, setAnimatingIndexes] = useState(new Set());
  const [binProgress, setBinProgress] = useState([0, 0, 0, 0, 0]);
  const containerRef = useRef(null);
  const binRefs = useRef([]);
  const spanRefs = useRef({});

  const cols = 100;
  const validIndexes = new Set();
  const shakingIndexes = new Set(); // NEW

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

  // Fill shakingIndexes with initial neighbors of valid digits
  validIndexes.forEach((idx) => {
    getNeighborIndexes(idx).forEach((n) => shakingIndexes.add(n));
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
      if (
        scrollLeft < buffer || scrollLeft > scrollWidth - clientWidth - buffer ||
        scrollTop < buffer || scrollTop > scrollHeight - clientHeight - buffer
      ) {
        container.scrollTo(scrollWidth / 2, scrollHeight / 2);
      }
    }
  };

  const handleDigitClick = (idx) => {
    if (!validIndexes.has(idx)) return;
    const neighbors = getNeighborIndexes(idx);
    neighbors.push(idx);
    setHighlightedIndexes(new Set(neighbors));
    setSortedIndexes((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  };

  const handleBinClick = (binNum) => {
    setSelectedBin(binNum);
    setAnimatingIndexes(new Set(highlightedIndexes));

    const binEl = binRefs.current[binNum - 1];
    const containerRect = containerRef.current.getBoundingClientRect();
    const binRect = binEl.getBoundingClientRect();

    requestAnimationFrame(() => {
      highlightedIndexes.forEach((idx) => {
        const digitSpan = spanRefs.current[idx];
        if (!digitSpan) return;

        const digitRect = digitSpan.getBoundingClientRect();
        const dx = binRect.left + binRect.width / 2 - digitRect.left;
        const dy = binRect.top + binRect.height / 2 - digitRect.top;

        digitSpan.style.setProperty("--bin-x", `${dx}px`);
        digitSpan.style.setProperty("--bin-y", `${dy}px`);
        digitSpan.classList.add("fly-to-bin");
      });
    });

    setTimeout(() => {
      setSortedIndexes((prev) => prev.filter((idx) => !highlightedIndexes.has(idx)));
      setAnimatingIndexes(new Set());

      highlightedIndexes.forEach((idx) => {
        const span = spanRefs.current[idx];
        if (span) {
          span.classList.remove("fly-to-bin");
          span.style.removeProperty("--bin-x");
          span.style.removeProperty("--bin-y");
        }
      });

      setHighlightedIndexes(new Set());
      setBinProgress((prev) => {
        const copy = [...prev];
        copy[binNum - 1] = Math.min(copy[binNum - 1] + 10, 100);
        return copy;
      });
    }, 2500);
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-scroll bg-black text-cyan-200 font-mono text-xl"
      >
        <div className="w-[500vw] h-[500vh] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-10 min-w-[8000px]">
            <div className="grid grid-cols-[repeat(100,minmax(3rem,1fr))] gap-x-10 gap-y-10 relative">
              {digits.map((digit, idx) => {
                const isSorted = sortedIndexes.includes(idx);
                const isValid = validIndexes.has(idx);
                const isHighlighted = highlightedIndexes.has(idx);
                const isAnimating = animatingIndexes.has(idx);
                const isShaking = shakingIndexes.has(idx); // NEW

                let classes =
                  "text-5xl leading-none cursor-pointer transition-transform duration-75 will-change-transform";
                if (isSorted) {
                  classes += " text-cyan-400 scale-135";
                } else if (isAnimating) {
                  classes += " text-white";
                } else if (isValid) {
                  classes += " text-blue-300 hover:scale-170 wiggle-hover";
                } else if (isHighlighted) {
                  classes += " text-cyan-500 scale-160 animate-pulse wiggle-hover";
                } else if (isShaking) {
                  classes += " text-cyan-500 hover:scale-160 shake"; 
                } else {
                  classes += " text-[#00ffff] hover:scale-120 wiggle-hover hover:text-white transition-all duration-300 ease-in-out";

                  



                }

                return (
                  <span
                    key={idx}
                    ref={(el) => (spanRefs.current[idx] = el)}
                    onClick={() => handleDigitClick(idx)}
                    className={classes}
                    style={{ position: "relative" }}
                  >
                    {digit}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Bins handleBinClick={handleBinClick} binProgress={binProgress} binRefs={binRefs} />
    </div>
  );
}
