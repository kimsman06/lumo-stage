export const ASPECT_RATIO_OPTIONS = [
  { label: "16 : 9 (와이드)", value: "16:9", ratio: 16 / 9 },
  { label: "4 : 3 (표준)", value: "4:3", ratio: 4 / 3 },
  { label: "3 : 2", value: "3:2", ratio: 3 / 2 },
  { label: "1 : 1 (정사각형)", value: "1:1", ratio: 1 },
  { label: "9 : 16 (세로)", value: "9:16", ratio: 9 / 16 },
  { label: "21 : 9 (시네마)", value: "21:9", ratio: 21 / 9 }
];

const ratioCache = new Map(ASPECT_RATIO_OPTIONS.map((item) => [item.value, item.ratio]));

export const getAspectRatioValue = (value) => {
  if (!value) {
    return ratioCache.get("16:9");
  }

  if (ratioCache.has(value)) {
    return ratioCache.get(value);
  }

  const [w, h] = value.split(":").map(Number);
  if (!w || !h) {
    return ratioCache.get("16:9");
  }

  const ratio = w / h;
  ratioCache.set(value, ratio);
  return ratio;
};

export const computeLetterbox = (width, height, aspectRatio) => {
  if (!width || !height || !aspectRatio) {
    return {
      viewportWidth: width,
      viewportHeight: height,
      offsetX: 0,
      offsetY: 0,
      bars: { top: 0, bottom: 0, left: 0, right: 0 }
    };
  }

  let viewportWidth = width;
  let viewportHeight = width / aspectRatio;
  let offsetX = 0;
  let offsetY = 0;

  if (viewportHeight > height) {
    viewportHeight = height;
    viewportWidth = viewportHeight * aspectRatio;
    offsetX = (width - viewportWidth) / 2;
  } else {
    offsetY = (height - viewportHeight) / 2;
  }

  return {
    viewportWidth,
    viewportHeight,
    offsetX,
    offsetY,
    bars: {
      top: offsetY,
      bottom: offsetY,
      left: offsetX,
      right: offsetX
    }
  };
};
