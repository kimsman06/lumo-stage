const { z } = require("zod");

const objectIdSchema = z
  .string({
    required_error: "ID는 필수입니다."
  })
  .min(1, "ID는 필수입니다.");

const generationParamsSchema = z
  .object({
    model: z.string().min(1).max(64).optional(),
    steps: z.coerce.number().int().positive().max(50).optional(),
    guidanceScale: z.coerce.number().positive().max(20).optional(),
    strength: z.coerce.number().min(0.1).max(1).optional(),
    seed: z.union([z.coerce.number(), z.string()]).transform((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      const result = Number(value);
      return Number.isNaN(result) ? undefined : result;
    }).optional()
  })
  .partial();

const apiKeyBodySchema = z.object({
  body: z.object({
    apiKey: z.string().min(16, "API 키가 필요합니다.")
  })
});

const idParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

const iterateBodySchema = z.object({
  body: z.object({
    prompt: z.string().min(1).max(1000),
    negativePrompt: z.string().max(500).optional().or(z.literal("")),
    generationParams: generationParamsSchema.optional()
  }),
  params: z.object({
    id: objectIdSchema
  })
});

const listQuerySchema = z.object({
  query: z.object({
    projectId: objectIdSchema.optional(),
    status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional()
  })
});

module.exports = {
  apiKeyBodySchema,
  generationParamsSchema,
  idParamsSchema,
  iterateBodySchema,
  listQuerySchema
};
