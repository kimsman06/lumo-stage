const LetterboxOverlay = ({ safeArea }) => {
  if (!safeArea) {
    return null;
  }

  const {
    bars: { top, bottom, left, right }
  } = safeArea;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      {top > 0 && (
        <div
          className="w-full bg-black/70 transition-all duration-200 ease-out"
          style={{ height: `${top}px` }}
        />
      )}
      <div className="flex-1 flex">
        {left > 0 && (
          <div
            className="bg-black/70 transition-all duration-200 ease-out"
            style={{ width: `${left}px` }}
          />
        )}
        <div className="flex-1" />
        {right > 0 && (
          <div
            className="bg-black/70 transition-all duration-200 ease-out"
            style={{ width: `${right}px` }}
          />
        )}
      </div>
      {bottom > 0 && (
        <div
          className="w-full bg-black/70 transition-all duration-200 ease-out"
          style={{ height: `${bottom}px` }}
        />
      )}
    </div>
  );
};

export default LetterboxOverlay;
