const { z } = require("zod");

const objectIdSchema = z
  .string({
    required_error: "ID는 필수입니다."
  })
  .min(1, "ID는 필수입니다.");

const projectAssetParamsSchema = z.object({
  params: z.object({
    projectId: objectIdSchema
  })
});

const assetIdParamsSchema = z.object({
  params: z.object({
    assetId: objectIdSchema
  })
});

module.exports = {
  assetIdParamsSchema,
  projectAssetParamsSchema
};
