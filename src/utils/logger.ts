// Request/Response Logger for Development
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const isDev = import.meta.env.DEV;

interface LogStyles {
  request: string;
  response: string;
  error: string;
  info: string;
}

const logStyles: LogStyles = {
  request: "color: #3b82f6; font-weight: bold",
  response: "color: #10b981; font-weight: bold",
  error: "color: #ef4444; font-weight: bold",
  info: "color: #f59e0b; font-weight: bold",
};

// Log request details
export function logRequest(config: AxiosRequestConfig): void {
  if (!isDev) return;

  console.group(`%c📤 Request: ${config.method?.toUpperCase()} ${config.url}`, logStyles.request);
  console.log("Headers:", config.headers);
  if (config.data) {
    console.log("Data:", config.data);
  }
  if (config.params) {
    console.log("Params:", config.params);
  }
  console.groupEnd();
}

// Log response details
export function logResponse(response: AxiosResponse): void {
  if (!isDev) return;

  console.group(
    `%c📥 Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
    logStyles.response
  );
  console.log("Status:", response.status);
  console.log("Data:", response.data);
  console.groupEnd();
}

// Log error details
export function logError(error: AxiosError): void {
  if (!isDev) return;

  console.group(
    `%c❌ Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
    logStyles.error
  );
  console.log("Message:", error.message);
  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
  } else if (error.request) {
    console.log("No response received");
    console.log("Request:", error.request);
  }
  console.groupEnd();
}

// Log general info
export function logInfo(message: string, data?: unknown): void {
  if (!isDev) return;

  console.log(`%cℹ️ ${message}`, logStyles.info);
  if (data) {
    console.log(data);
  }
}

// Log performance metrics
export function logPerformance(label: string, startTime: number): void {
  if (!isDev) return;

  const duration = performance.now() - startTime;
  const color = duration < 100 ? "#10b981" : duration < 500 ? "#f59e0b" : "#ef4444";
  console.log(`%c⚡ ${label}: ${duration.toFixed(2)}ms`, `color: ${color}; font-weight: bold`);
}

// Create a performance timer
export function createPerformanceTimer(label: string) {
  const startTime = performance.now();

  return {
    end: () => logPerformance(label, startTime),
  };
}

// Log cache hit/miss
export function logCache(key: string, hit: boolean): void {
  if (!isDev) return;

  const icon = hit ? "✅" : "❌";
  const color = hit ? "#10b981" : "#f59e0b";
  console.log(`%c${icon} Cache ${hit ? "HIT" : "MISS"}: ${key}`, `color: ${color}`);
}

// Log state changes (for debugging Zustand or other state)
export function logStateChange(storeName: string, oldState: unknown, newState: unknown): void {
  if (!isDev) return;

  console.group(`%c🔄 State Change: ${storeName}`, "color: #8b5cf6; font-weight: bold");
  console.log("Before:", oldState);
  console.log("After:", newState);
  console.groupEnd();
}

// Log component lifecycle (for debugging)
export function logComponentLifecycle(componentName: string, event: "mount" | "unmount" | "update"): void {
  if (!isDev) return;

  const icons = {
    mount: "🎬",
    unmount: "🔚",
    update: "🔄",
  };

  console.log(
    `%c${icons[event]} ${componentName} ${event}`,
    "color: #a855f7; font-style: italic"
  );
}

// Log network status changes
export function logNetworkStatus(isOnline: boolean): void {
  if (!isDev) return;

  const icon = isOnline ? "🟢" : "🔴";
  const color = isOnline ? "#10b981" : "#ef4444";
  console.log(`%c${icon} Network Status: ${isOnline ? "Online" : "Offline"}`, `color: ${color}; font-weight: bold`);
}

// Batch logger for multiple operations
export class BatchLogger {
  private logs: Array<{ type: string; message: string; data?: unknown }> = [];
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  add(type: string, message: string, data?: unknown): void {
    this.logs.push({ type, message, data });
  }

  flush(): void {
    if (!isDev || this.logs.length === 0) return;

    console.group(`%c📋 ${this.label}`, "color: #06b6d4; font-weight: bold");
    this.logs.forEach(({ type, message, data }) => {
      console.log(`[${type}]`, message);
      if (data) {
        console.log(data);
      }
    });
    console.groupEnd();

    this.logs = [];
  }
}

// Export a default logger object
export const logger = {
  request: logRequest,
  response: logResponse,
  error: logError,
  info: logInfo,
  performance: logPerformance,
  cache: logCache,
  stateChange: logStateChange,
  componentLifecycle: logComponentLifecycle,
  networkStatus: logNetworkStatus,
  createTimer: createPerformanceTimer,
  BatchLogger,
};

export default logger;
