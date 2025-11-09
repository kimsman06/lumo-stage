export const getAssetId = (assetOrId) => {
  if (!assetOrId) {
    return null;
  }

  if (typeof assetOrId === "string") {
    return assetOrId;
  }

  return (
    assetOrId._id ||
    assetOrId.id ||
    assetOrId.assetId ||
    assetOrId.fileKey ||
    null
  );
};

export const normalizeAsset = (asset) => {
  if (!asset) {
    return null;
  }

  const id = getAssetId(asset);

  return {
    ...asset,
    id,
    _id: id,
  };
};
