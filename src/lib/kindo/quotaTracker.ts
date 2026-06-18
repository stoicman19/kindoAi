// KindoAI — localStorage daily quota tracker
import { AI_ENGINES, type EngineId } from "./limits";

const STORAGE_KEY = "kindo_quota_v1";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

interface Store {
  __day?: string;
  [k: string]: number | string | undefined;
}

function readAll(): Store {
  if (typeof localStorage === "undefined") return { __day: today() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { __day: today() };
    const parsed = JSON.parse(raw) as Store;
    if (parsed.__day !== today()) return { __day: today() };
    return parsed;
  } catch {
    return { __day: today() };
  }
}

function writeAll(data: Store) {
  if (typeof localStorage === "undefined") return;
  data.__day = today();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCount(engineId: EngineId): number {
  const all = readAll();
  return (all[engineId] as number) || 0;
}

export function increment(engineId: EngineId): number {
  const all = readAll();
  const next = ((all[engineId] as number) || 0) + 1;
  all[engineId] = next;
  writeAll(all);
  return next;
}

export function snapshot(): Record<EngineId, { used: number; cap: number; pct: number }> {
  const result = {} as Record<EngineId, { used: number; cap: number; pct: number }>;
  (Object.keys(AI_ENGINES) as EngineId[]).forEach((id) => {
    const used = getCount(id);
    const cap = AI_ENGINES[id].dailyCap;
    result[id] = { used, cap, pct: Math.min(100, Math.round((used / cap) * 100)) };
  });
  return result;
}
