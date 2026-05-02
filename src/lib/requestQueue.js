/**
 * Request queue utility for managing concurrent API requests
 */
import PQueue from "p-queue";

export const summaryQueue = new PQueue({
  concurrency: 3,
  interval: 1000,
  intervalCap: 10,
});

export const chatQueue = new PQueue({
  concurrency: 2,
  interval: 1000,
  intervalCap: 5,
});

export const refreshQueue = new PQueue({
  concurrency: 1,
  interval: 60000,
  intervalCap: 1,
});

export const queueSummaryRequest = async (fn) => {
  return summaryQueue.add(fn, { priority: 1 });
};

export const queueChatRequest = async (fn) => {
  return chatQueue.add(fn, { priority: 1 });
};

export const queueRefreshRequest = async (fn) => {
  return refreshQueue.add(fn, { priority: 1 });
};
