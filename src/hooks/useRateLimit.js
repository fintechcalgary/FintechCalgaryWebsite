"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

  const checkRateLimit = useCallback(() => {
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
  }, [maxRequests, windowMs]);

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
    const initial = window.setTimeout(() => {
      checkRateLimit();
    }, 0);
    const interval = window.setInterval(() => {
      checkRateLimit();
    }, 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [checkRateLimit]);

  return {
    canSend,
    retryAfter,
    recordRequest,
    reset,
    checkRateLimit,
  };
}
