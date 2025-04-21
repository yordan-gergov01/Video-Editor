const cluster = require("cluster");
const os = require("os");
const JobQueue = require("../lib/JobQueue.js");

if (cluster.isPrimary) {
  const jobs = new JobQueue();

  const numCPUs = os.availableParallelism();

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("message", (worker, message) => {
    if (message.messageType === "new-resize") {
      const { videoId, height, width } = message.data;
      jobs.enqueue({
        type: "resize",
        videoId,
        width,
        height,
      });
    }
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died (${signal} | ${code}). Restarting...`
    );

    cluster.fork();
  });
} else {
  require("./index.js");
}
