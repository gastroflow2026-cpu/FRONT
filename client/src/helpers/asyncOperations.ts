import axios from "axios";

export const CRITICAL_OPERATION_TIMEOUT_MS = 60000;

const ACTION_REQUEST_IDS = new Map<string, { requestId: string; createdAt: number }>();
const REQUEST_ID_REUSE_WINDOW_MS = 2 * 60 * 1000;

const now = () => Date.now();

const generateRequestId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `req_${now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getOrCreateRequestId = (actionKey: string) => {
  const current = ACTION_REQUEST_IDS.get(actionKey);
  const currentNow = now();

  if (current && currentNow - current.createdAt < REQUEST_ID_REUSE_WINDOW_MS) {
    return current.requestId;
  }

  const requestId = generateRequestId();
  ACTION_REQUEST_IDS.set(actionKey, { requestId, createdAt: currentNow });
  return requestId;
};

export const clearRequestId = (actionKey: string) => {
  ACTION_REQUEST_IDS.delete(actionKey);
};

export const buildHeadersWithRequestId = (
  headers: Record<string, string> | undefined,
  requestId: string,
) => ({
  ...(headers ?? {}),
  "X-Request-Id": requestId,
});

type AsyncErrorInfo = {
  status?: number;
  message: string;
  isTimeout: boolean;
  isNetwork: boolean;
};

export const extractAsyncErrorInfo = (error: unknown): AsyncErrorInfo => {
  if (!axios.isAxiosError(error)) {
    return {
      message: "No se pudo completar la operación.",
      isTimeout: false,
      isNetwork: false,
    };
  }

  const status = error.response?.status;
  const data = error.response?.data as
    | { message?: unknown; error?: unknown }
    | undefined;

  let backendMessage = "";

  if (Array.isArray(data?.message) && data.message.length > 0) {
    backendMessage = data.message.map((item) => String(item)).join(" | ");
  } else if (typeof data?.message === "string" && data.message.trim()) {
    backendMessage = data.message;
  } else if (typeof data?.error === "string" && data.error.trim()) {
    backendMessage = data.error;
  }

  const isTimeout = error.code === "ECONNABORTED";
  const isNetwork = !error.response;

  return {
    status,
    message: backendMessage || error.message || "No se pudo completar la operación.",
    isTimeout,
    isNetwork,
  };
};

export const mapAsyncErrorToUserMessage = (
  info: AsyncErrorInfo,
  businessFallback: string,
) => {
  if (info.status === 400 || info.status === 409) {
    return info.message || businessFallback;
  }

  if (info.status === 401 || info.status === 403) {
    return "Tu sesión expiró o no tienes permisos para realizar esta acción.";
  }

  if (info.isTimeout || info.isNetwork) {
    return "Estamos verificando el estado de tu operación. Si no ves cambios, reintenta en unos segundos.";
  }

  if (info.status && info.status >= 500) {
    return "El servidor tardó en responder. Inténtalo nuevamente.";
  }

  return info.message || "No se pudo completar la operación.";
};

export const logAsyncOperation = (params: {
  requestId: string;
  endpoint: string;
  durationMs: number;
  ok: boolean;
}) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const { requestId, endpoint, durationMs, ok } = params;
  const roundedDuration = Math.round(durationMs);
  console.log(
    `[async-op] ${ok ? "ok" : "error"} requestId=${requestId} endpoint=${endpoint} durationMs=${roundedDuration}`,
  );
};
