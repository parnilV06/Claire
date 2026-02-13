export type UsageFeature = "canvas" | "tts" | "summary" | "quiz";

const STORAGE_PREFIX = "claire.usage.";
export const USAGE_LIMIT = 3;

export function getUsageCount(feature: UsageFeature) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${feature}`);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function incrementUsage(feature: UsageFeature) {
  const nextValue = getUsageCount(feature) + 1;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${feature}`, String(nextValue));
  } catch {}
  return nextValue;
}

export function hasReachedLimit(feature: UsageFeature) {
  return getUsageCount(feature) >= USAGE_LIMIT;
}

export function getRemainingUses(feature: UsageFeature) {
  const remaining = USAGE_LIMIT - getUsageCount(feature);
  return remaining > 0 ? remaining : 0;
}
