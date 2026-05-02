"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for client-side rate limiting
 * @param {number} maxRequests - Maximum number of requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { canSend, retryAfter, recordRequest, reset, checkRateLimit }
 */
export function useRateLimit(maxRequests = 5, windowMs = 60000) {
  const [canSend, setCanSend] = useState(true);
  const [retryAfter, setRetryAfter] = useState(0);
  const requestTimestamps = useRef([]);

  const checkRateLimit = () => {
    const now = Date.now();
    const windowStart = now - windowMs;

    requestTimestamps.current = requestTimestamps.current.filter(
      (timestamp) => timestamp > windowStart
    );

    const currentCount = requestTimestamps.current.length;

    if (currentCount >= maxRequests) {
      const oldestTimestamp = requestTimestamps.current[0];
      const timeUntilReset = windowMs - (now - oldestTimestamp);
      setCanSend(false);
      setRetryAfter(Math.ceil(timeUntilReset / 1000));
      return false;
    }

    setCanSend(true);
    setRetryAfter(0);
    return true;
  };

  const recordRequest = () => {
    requestTimestamps.current.push(Date.now());
    checkRateLimit();
  };

  const reset = () => {
    requestTimestamps.current = [];
    setCanSend(true);
    setRetryAfter(0);
  };

  useEffect(() => {
    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, [maxRequests, windowMs]);

  return {
    canSend,
    retryAfter,
    recordRequest,
    reset,
    checkRateLimit,
  };
}
