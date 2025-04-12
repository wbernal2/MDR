import { useEffect, useRef, useState } from "react";
import Bins from './components/Bins';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [digits, setDigits] = useState([]);
  const [validIndexes, setValidIndexes] = useState(new Set());
  const [shakingIndexes, setShakingIndexes] = useState(new Set());
  const [selectedBin, setSelectedBin] = useState(null);
  const [sortedIndexes, setSortedIndexes] = useState([]);
  const [highlightedIndexes, setHighlightedIndexes] = useState(new Set());
  const [animatingIndexes, setAnimatingIndexes] = useState(new Set());
  const [binProgress, setBinProgress] = useState([0, 0, 0, 0, 0]);

  const containerRef = useRef(null);
  const binRefs = useRef([]);
  const spanRefs = useRef({});

  const cols = 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      const generatedDigits = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 10));
      const validSet = new Set();
      const shakeSet = new Set();

      const clusterSpacing = 400;
      for (let i = 0; i < generatedDigits.length; i += clusterSpacing) {
        const offset = Math.floor(Math.random() * 100);
        const index = i + offset;
        if (index < generatedDigits.length) validSet.add(index);
      }

      validSet.forEach((idx) => {
        getNeighborIndexes(idx, cols, generatedDigits.length).forEach((n) => shakeSet.add(n));
      });

      setDigits(generatedDigits);
      setValidIndexes(validSet);
      setShakingIndexes(shakeSet);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container && !isLoading) {
      container.scrollTo(container.scrollWidth / 2, container.scrollHeight / 2);
    }
  }, [isLoading]);

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
        container.scrollTo(container.scrollWidth / 2, container.scrollHeight / 2);
      }
    }
  };

  function getNeighborIndexes(index, cols, total) {
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
        neighbor < total &&
        Math.abs(neighborRow - row) <= 1 &&
        Math.abs(neighborCol - col) <= 1
      ) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }

  const handleDigitClick = (idx) => {
    if (!validIndexes.has(idx)) return;
    const neighbors = getNeighborIndexes(idx, cols, digits.length);
    neighbors.push(idx);
    setHighlightedIndexes(new Set(neighbors));
    setSortedIndexes((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  };

  const handleBinClick = (binNum) => {
    setSelectedBin(binNum);
    setAnimatingIndexes(new Set(highlightedIndexes));
  
    const binEl = binRefs.current[binNum - 1];
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
  
      // 👇 Random scroll after bin animation
      const container = containerRef.current;
      if (container) {
        const randomX = Math.random() * container.scrollWidth;
        const randomY = Math.random() * container.scrollHeight;
        container.scrollTo({
          left: randomX,
          top: randomY,
          
        });
      }
    }, 2500);
  };
  
  const totalProgress = Math.floor(
    binProgress.reduce((acc, val) => acc + val, 0) / binProgress.length
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#050b12] text-cyan-300 text-3xl scanlines">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-bold glow">Initializing Macrodata Refinement...</div>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fisheye-effect scale-[0.89] origin-center flex flex-col h-screen bg-[#050b12] text-cyan-300 font-mono text-xl">
      {/* Banner */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-cyan-400 text-cyan-300 text-lg uppercase tracking-wide scanlines glow">
        <div className="text-left text-6xl font-orbitron">Cold Harbor</div>
        <div className="flex items-center gap-10 text-3xl font-orbitron">
          <span>{totalProgress}% Complete</span>
          <img src="/lumonlogo.png" alt="Lumon Logo" className="h-40 w-auto opacity-100" />
        </div>
      </div>

      {/* Digits Grid */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-scroll"
      >
        <div className="w-[500vw] h-[500vh] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[8000px] min-h-[8000px]">
            <div className="grid grid-cols-[repeat(100,minmax(3rem,1fr))] gap-x-10 gap-y-10 relative">
              {digits.map((digit, idx) => {
                const isSorted = sortedIndexes.includes(idx);
                const isValid = validIndexes.has(idx);
                const isHighlighted = highlightedIndexes.has(idx);
                const isAnimating = animatingIndexes.has(idx);
                const isShaking = shakingIndexes.has(idx);

                let classes = "text-5xl leading-none cursor-pointer transition-transform duration-75 will-change-transform glow";
                if (isSorted) {
                  classes += " text-cyan-300 scale-110";
                } else if (isAnimating) {
                  classes += " text-white";
                } else if (isValid) {
                  classes += " text-blue-300 hover:scale-155 wiggle-hover";
                } else if (isHighlighted) {
                  classes += " text-cyan-500 scale-165 animate-pulse";
                } else if (isShaking) {
                  classes += " text-cyan-500 hover:scale-180 shake";
                } else {
                  classes += " text-cyan-500 hover:scale-105";
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
