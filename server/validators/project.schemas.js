const { z } = require("zod");

const PROJECT_NAME_MAX = 120;
const PROJECT_DESCRIPTION_MAX = 1000;

// OrbitControlState 스키마
const orbitControlStateSchema = z
  .object({
    cameraPosition: z.array(z.number()).length(3).optional(),
    target: z.array(z.number()).length(3).optional(),
    zoom: z.number().positive().optional()
  })
  .optional();

const baseSceneDataSchema = z
  .object({
    schemaVersion: z.number().int().nonnegative().optional(),
    aspectRatio: z.string().trim().min(1).optional(),
    mannequins: z.array(z.any()).optional(),
    lights: z.array(z.any()).optional(),
    diffusers: z.array(z.any()).optional(),
    cameraState: z.record(z.string(), z.any()).optional(),
    orbitControlState: orbitControlStateSchema
  })
  .catchall(z.any());

const sceneDataSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return {};
  }
  return value;
}, baseSceneDataSchema);

const trimOrUndefined = (maxLength, message) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .transform((value) => (value.length === 0 ? undefined : value));

const optionalUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().url("썸네일은 올바른 URL이어야 합니다.").optional()
);

const projectNameSchema = z
  .string()
  .trim()
  .min(1, "프로젝트 이름을 입력해주세요.")
  .max(PROJECT_NAME_MAX, `프로젝트 이름은 ${PROJECT_NAME_MAX}자 이하여야 합니다.`);

const createProjectSchema = z.object({
  body: z
    .object({
      name: projectNameSchema,
      description: trimOrUndefined(
        PROJECT_DESCRIPTION_MAX,
        `설명은 ${PROJECT_DESCRIPTION_MAX}자 이하여야 합니다.`
      ).optional(),
      sceneData: sceneDataSchema,
      thumbnail: optionalUrl
    })
    .transform((body) => {
      const cleaned = { ...body };

      if (cleaned.description === undefined) {
        delete cleaned.description;
      }

      if (cleaned.thumbnail === undefined) {
        delete cleaned.thumbnail;
      }

      return cleaned;
    })
});

const updateBodySchema = z
  .object({
    name: projectNameSchema.optional(),
    description: trimOrUndefined(
      PROJECT_DESCRIPTION_MAX,
      `설명은 ${PROJECT_DESCRIPTION_MAX}자 이하여야 합니다.`
    ).optional(),
    sceneData: sceneDataSchema.optional(),
    thumbnail: optionalUrl
  })
  .superRefine((body, ctx) => {
    const hasAnyField = Object.values(body).some((value) => value !== undefined);

    if (!hasAnyField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "수정할 필드를 제공해주세요."
      });
    }
  })
  .transform((body) => {
    const cleaned = { ...body };

    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });

    return cleaned;
  });

const updateProjectSchema = z.object({
  body: updateBodySchema
});

module.exports = {
  createProjectSchema,
  updateProjectSchema
};
