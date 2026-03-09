/**
 * In-memory metrics for observability.
 * - API response times: rolling window (last N requests).
 * - Auth attempts: success / failure counts for success rate.
 * - Test failure rate is computed from DB (test_runs) in the health endpoint.
 */

const MAX_RESPONSE_SAMPLES = 100;
const responseTimes = [];
let authSuccess = 0;
let authFailure = 0;

function recordResponseTime(ms) {
  responseTimes.push(ms);
  if (responseTimes.length > MAX_RESPONSE_SAMPLES) {
    responseTimes.shift();
  }
}

function recordAuthSuccess() {
  authSuccess += 1;
}

function recordAuthFailure() {
  authFailure += 1;
}

function getApiResponseTimeStats() {
  if (responseTimes.length === 0) return { avgMs: null, lastMs: null, sampleCount: 0 };
  const sum = responseTimes.reduce((a, b) => a + b, 0);
  return {
    avgMs: Math.round(sum / responseTimes.length),
    lastMs: responseTimes[responseTimes.length - 1],
    sampleCount: responseTimes.length,
  };
}

function getAuthSuccessRate() {
  const total = authSuccess + authFailure;
  if (total === 0) return null;
  return {
    rate: Math.round((authSuccess / total) * 100) / 100,
    success: authSuccess,
    failure: authFailure,
    total,
  };
}

function getMetrics() {
  return {
    api: getApiResponseTimeStats(),
    auth: getAuthSuccessRate(),
  };
}

module.exports = {
  recordResponseTime,
  recordAuthSuccess,
  recordAuthFailure,
  getApiResponseTimeStats,
  getAuthSuccessRate,
  getMetrics,
};
