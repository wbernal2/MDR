export default function NumberTile({ number }) {
    return (
      <div
        className="h-20 flex items-center justify-center border border-green-400 rounded-md
                   hover:bg-green-400 hover:text-black transition-all duration-200
                   shadow-[0_0_6px_#22c55e] hover:shadow-[0_0_20px_#22c55e] cursor-pointer flicker"
      >
        {number}
      </div>
    );
  }
  