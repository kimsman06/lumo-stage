export const emailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const passwordRules = [
  {
    test: (value) => value.length >= 8,
    message: "비밀번호는 최소 8자 이상이어야 합니다."
  },
  {
    test: (value) => /[A-Z]/.test(value),
    message: "비밀번호에는 대문자가 최소 1개 포함되어야 합니다."
  },
  {
    test: (value) => /[a-z]/.test(value),
    message: "비밀번호에는 소문자가 최소 1개 포함되어야 합니다."
  },
  {
    test: (value) => /\d/.test(value),
    message: "비밀번호에는 숫자가 최소 1개 포함되어야 합니다."
  }
];

export const validateEmail = (value) => {
  if (!value) {
    return "이메일을 입력해주세요.";
  }

  if (!emailPattern.test(value)) {
    return "올바른 이메일 형식이 아닙니다.";
  }

  return null;
};

export const validatePassword = (value) => {
  if (!value) {
    return "비밀번호를 입력해주세요.";
  }

  for (const rule of passwordRules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }

  return null;
};

export const validateUsername = (value) => {
  if (!value) {
    return "사용자 이름을 입력해주세요.";
  }

  if (value.trim().length < 2) {
    return "사용자 이름은 최소 2자 이상이어야 합니다.";
  }

  return null;
};
