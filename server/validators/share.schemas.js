const { z } = require("zod");

const projectIdParamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, "프로젝트 ID가 올바르지 않습니다.")
  })
});

const permissionSchema = z
  .enum(["view", "edit"])
  .optional()
  .refine((value) => value === undefined || ["view", "edit"].includes(value), {
    message: "권한 값이 올바르지 않습니다."
  });

const expiresAtSchema = z
  .union([
    z.string().trim().min(1, "만료 시간이 올바르지 않습니다."),
    z.number(),
    z.date(),
    z.null()
  ])
  .optional();

const isActiveSchema = z.boolean().optional();

const shareConfigBodySchema = z.object({
  permission: permissionSchema,
  expiresAt: expiresAtSchema,
  isActive: isActiveSchema
});

const createShareSchema = projectIdParamSchema.extend({
  body: shareConfigBodySchema
});

const updateShareSchema = projectIdParamSchema.extend({
  body: shareConfigBodySchema.superRefine((body, ctx) => {
    const hasAny =
      body.permission !== undefined ||
      body.expiresAt !== undefined ||
      body.isActive !== undefined;

    if (!hasAny) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "수정할 필드를 제공해주세요."
      });
    }
  })
});

const projectShareParamsSchema = projectIdParamSchema;

module.exports = {
  createShareSchema,
  updateShareSchema,
  projectShareParamsSchema
};
