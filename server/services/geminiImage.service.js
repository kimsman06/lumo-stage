const { GoogleGenAI } = require("@google/genai");

const { DEFAULT_GEMINI_IMAGE_MODEL, buildImageConfig } = require("../config/gemini");

const ensureApiKey = (apiKey) => {
  if (!apiKey) {
    const error = new Error("Gemini API 키가 필요합니다.");
    error.status = 401;
    throw error;
  }
};

const SYSTEM_INSTRUCTIONS = [
  "You are rendering photorealistic stage visuals for LumoStage.",
  "Replace any mannequins, dummies, or placeholders from the reference render with realistic human performers while keeping poses, outfits, and lighting cues identical.",
  "Respect the reference render's camera framing, focal length, and composition exactly—do not change the angle or crop.",
  "Use the uploaded render strictly as the camera guide."
].join(" ");

const DEFAULT_NEGATIVE = "plastic skin, mannequin, doll-like eyes, distorted lens, extreme fisheye, incorrect framing";

const mergePrompt = (prompt, negativePrompt, sceneSnapshot) => {
  let instructions = SYSTEM_INSTRUCTIONS;

  if (sceneSnapshot?.environment?.hdriName) {
    instructions += `\nUse the ${sceneSnapshot.environment.hdriName} environment map cues to rebuild the background lighting and reflections.`;
  }

  if (sceneSnapshot?.environment?.color) {
    instructions += `\nOverall ambient color should match ${sceneSnapshot.environment.color}.`;
  }

  const combinedPrompt = `${instructions}\n\n${prompt}`;
  const negatives = [DEFAULT_NEGATIVE];

  if (negativePrompt && negativePrompt.trim()) {
    negatives.push(negativePrompt.trim());
  }

  return `${combinedPrompt}\n\nAvoid the following details: ${negatives.join(", ")}`;
};

const buildContents = ({ prompt, imageBuffer, mimeType }) => {
  const parts = [{ text: prompt }];

  if (imageBuffer) {
    parts.push({
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType || "image/png"
      }
    });
  }

  return [
    {
      role: "user",
      parts
    }
  ];
};

const extractImagePart = (response) => {
  if (!response || !Array.isArray(response.candidates)) {
    throw new Error("Gemini 응답 형식이 올바르지 않습니다.");
  }

  for (const candidate of response.candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
        if (!part.inlineData.data) {
          continue;
        }

        return {
          data: Buffer.from(part.inlineData.data, "base64"),
          mimeType: part.inlineData.mimeType
        };
      }
    }
  }

  throw new Error("Gemini 응답에서 이미지를 찾을 수 없습니다.");
};

const generateGeminiImage = async ({
  apiKey,
  prompt,
  negativePrompt,
  imageBuffer,
  mimeType,
  model,
  aspectRatio,
  imageSize,
  sceneSnapshot
}) => {
  ensureApiKey(apiKey);

  const ai = new GoogleGenAI({ apiKey });
  const requestPrompt = mergePrompt(prompt, negativePrompt, sceneSnapshot);

  const request = {
    model: model || DEFAULT_GEMINI_IMAGE_MODEL,
    contents: buildContents({
      prompt: requestPrompt,
      imageBuffer,
      mimeType
    }),
    config: {
      responseModalities: ["TEXT", "IMAGE"]
    }
  };

  const imageConfig = buildImageConfig({ aspectRatio, imageSize });
  if (imageConfig) {
    request.config.imageConfig = imageConfig;
  }

  const response = await ai.models.generateContent(request);
  const imagePart = extractImagePart(response);

  return {
    buffer: imagePart.data,
    mimeType: imagePart.mimeType,
    metadata: {
      model: request.model,
      imageConfig: imageConfig || null,
      usage: response.usageMetadata || null
    }
  };
};

module.exports = {
  generateGeminiImage
};
