/**
 * Performance monitoring utilities for student stories
 */
import React from "react";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class StudentStoryPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiCallTimes: Map<string, number> = new Map();

  /**
   * Start timing an API call
   */
  startApiCall(endpoint: string): void {
    this.apiCallTimes.set(endpoint, performance.now());
  }

  /**
   * End timing an API call and record the metric
   */
  endApiCall(endpoint: string, success: boolean = true): void {
    const startTime = this.apiCallTimes.get(endpoint);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name: "api_call_duration",
        value: duration,
        timestamp: new Date(),
        metadata: {
          endpoint,
          success,
          duration_ms: Math.round(duration),
        },
      });
      this.apiCallTimes.delete(endpoint);
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Log slow API calls
    if (metric.name === "api_call_duration" && metric.value > 2000) {
      console.warn(
        `Slow API call detected: ${metric.metadata?.endpoint} took ${Math.round(metric.value)}ms`,
      );
    }

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  /**
   * Record story interaction
   */
  recordStoryInteraction(
    action: "view" | "like" | "share",
    storyId: string,
  ): void {
    this.recordMetric({
      name: "story_interaction",
      value: 1,
      timestamp: new Date(),
      metadata: {
        action,
        storyId,
      },
    });
  }

  /**
   * Record search action
   */
  recordSearch(query: string, resultCount: number): void {
    this.recordMetric({
      name: "story_search",
      value: resultCount,
      timestamp: new Date(),
      metadata: {
        query: query.toLowerCase(),
        resultCount,
        hasResults: resultCount > 0,
      },
    });
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalApiCalls: number;
    averageApiTime: number;
    slowApiCalls: number;
    totalInteractions: number;
    searchCount: number;
  } {
    const apiMetrics = this.metrics.filter(
      (m) => m.name === "api_call_duration",
    );
    const interactionMetrics = this.metrics.filter(
      (m) => m.name === "story_interaction",
    );
    const searchMetrics = this.metrics.filter((m) => m.name === "story_search");

    const totalApiCalls = apiMetrics.length;
    const averageApiTime =
      totalApiCalls > 0
        ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / totalApiCalls
        : 0;
    const slowApiCalls = apiMetrics.filter((m) => m.value > 2000).length;

    return {
      totalApiCalls,
      averageApiTime: Math.round(averageApiTime),
      slowApiCalls,
      totalInteractions: interactionMetrics.length,
      searchCount: searchMetrics.length,
    };
  }

  /**
   * Export metrics for analytics
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.apiCallTimes.clear();
  }
}

// Create global instance
export const performanceMonitor = new StudentStoryPerformanceMonitor();

/**
 * Hook for monitoring API calls
 */
export function useApiMonitoring() {
  const monitorApiCall = async function <T>(
    endpoint: string,
    apiCall: () => Promise<T>,
  ): Promise<T> {
    performanceMonitor.startApiCall(endpoint);
    try {
      const result = await apiCall();
      performanceMonitor.endApiCall(endpoint, true);
      return result;
    } catch (error) {
      performanceMonitor.endApiCall(endpoint, false);
      throw error;
    }
  };

  return { monitorApiCall };
}

/**
 * Debug component to show performance metrics
 */
export function PerformanceDebugPanel(): JSX.Element | null {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const summary = performanceMonitor.getPerformanceSummary();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Performance Metrics</h4>
      <div className="space-y-1">
        <div>API Calls: {summary.totalApiCalls}</div>
        <div>Avg Response: {summary.averageApiTime}ms</div>
        <div>Slow Calls: {summary.slowApiCalls}</div>
        <div>Interactions: {summary.totalInteractions}</div>
        <div>Searches: {summary.searchCount}</div>
      </div>
      <button
        onClick={() => performanceMonitor.clearMetrics()}
        className="mt-2 text-xs bg-gray-700 px-2 py-1 rounded"
      >
        Clear
      </button>
    </div>
  );
}
