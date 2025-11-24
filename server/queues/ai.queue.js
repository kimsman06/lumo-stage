let Queue;
try {
  // bull은 devDependencies가 아니므로 필요시에만 require
  Queue = require("bull");
} catch (error) {
  Queue = null;
}

const { processPrevisualizationJob } = require("../services/ai.service");

const QUEUE_NAME = "ai-previsualization";
const shouldUseQueue =
  Boolean(process.env.REDIS_URL) && process.env.NODE_ENV !== "test" && Queue;

let aiQueue = null;

if (shouldUseQueue) {
  aiQueue = new Queue(QUEUE_NAME, process.env.REDIS_URL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: true
    }
  });

  aiQueue.process(async (job) => processPrevisualizationJob(job.data));

  aiQueue.on("failed", (job, error) => {
    console.error("[AI Queue] 작업 실패", job.id, error);
  });
}

const enqueuePrevisualizationJob = async (payload) => {
  if (aiQueue) {
    await aiQueue.add(payload);
    return;
  }

  await processPrevisualizationJob(payload);
};

module.exports = {
  enqueuePrevisualizationJob
};
