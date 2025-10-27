const { z } = require("zod");

const trimmedString = (min, message) => z.string().trim().min(min, message);

const registerSchema = z.object({
  body: z.object({
    username: trimmedString(1, "사용자 이름을 입력해주세요.").max(
      50,
      "사용자 이름은 50자 이하여야 합니다."
    ),
    email: z
      .string()
      .trim()
      .min(1, "이메일을 입력해주세요.")
      .max(255, "이메일이 너무 깁니다.")
      .email("올바른 이메일 주소를 입력해주세요."),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .max(128, "비밀번호는 128자 이하여야 합니다.")
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, "이메일을 입력해주세요.")
      .max(255, "이메일이 너무 깁니다.")
      .email("올바른 이메일 주소를 입력해주세요."),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요.")
      .max(128, "비밀번호가 너무 깁니다.")
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
