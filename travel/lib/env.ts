const GEMINI_ENV_KEYS = [
  'GEMINI_API_KEY',
  'API_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_API_KEY',
  'GOOGLE_API_KEY',
  'GOOGLEAI_API_KEY',
  'GEMINI_KEY',
  'GEMINIAPIKEY',
  'GEMINIKEY',
  '__FURES_TRAVEL_AI_COMPANION_API_KEY__',
  '__FURES_TRAVEL_GEMINI_API_KEY__',
  '__FURES_GEMINI_API_KEY__',
  '__GEMINI_API_KEY__',
];

const MAPS_ENV_KEYS = [
  'MAPS_API_KEY',
  'VITE_MAPS_API_KEY',
  'GOOGLE_MAPS_API_KEY',
  'VITE_GOOGLE_MAPS_API_KEY',
  'MAPS_KEY',
  'MAPSAPIKEY',
  'GOOGLE_MAPS_KEY',
  '__FURES_TRAVEL_MAPS_API_KEY__',
  '__GOOGLE_MAPS_API_KEY__',
];

const GLOBAL_ENV_CONTAINER_KEYS = [
  '__FURES_TRAVEL_ENV__',
  '__FURES_ENV__',
  '__ENV__',
  '__env',
  '__APP_ENV__',
  '__appEnv',
  '_env_',
  'ENV',
  'env',
];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object';
}

function coerceString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readFromRecord(record: UnknownRecord | undefined, keys: string[]): string | undefined {
  if (!record) {
    return undefined;
  }
  for (const key of keys) {
    const result = coerceString(record[key]);
    if (result) {
      return result;
    }
  }
  return undefined;
}

function readFromContainers(record: UnknownRecord | undefined, keys: string[]): string | undefined {
  if (!record) {
    return undefined;
  }
  for (const containerKey of GLOBAL_ENV_CONTAINER_KEYS) {
    const container = isRecord(record[containerKey])
      ? (record[containerKey] as UnknownRecord)
      : undefined;
    const result = readFromRecord(container, keys);
    if (result) {
      return result;
    }
  }
  return undefined;
}

function resolveKey(envKeys: string[]): string | undefined {
  const processEnvRecord = typeof process !== 'undefined' && process?.env
    ? (process.env as unknown as UnknownRecord)
    : undefined;

  const importMetaEnvRecord = typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: UnknownRecord }).env
    : undefined;

  const globalRecord: UnknownRecord | undefined = typeof globalThis !== 'undefined'
    ? (globalThis as unknown as UnknownRecord)
    : undefined;

  const globalProcessEnv = isRecord(globalRecord?.process)
    ? (globalRecord!.process as UnknownRecord)
    : undefined;
  const globalProcessEnvRecord = isRecord(globalProcessEnv?.env)
    ? (globalProcessEnv!.env as UnknownRecord)
    : undefined;

  return (
    readFromRecord(processEnvRecord, envKeys) ??
    readFromRecord(importMetaEnvRecord, envKeys) ??
    readFromRecord(globalRecord, envKeys) ??
    readFromRecord(globalProcessEnvRecord, envKeys) ??
    readFromContainers(globalRecord, envKeys)
  );
}

export function resolveGeminiApiKey(): string | undefined {
  return resolveKey(GEMINI_ENV_KEYS);
}

export function resolveMapsApiKey(): string | undefined {
  return resolveKey(MAPS_ENV_KEYS);
}
