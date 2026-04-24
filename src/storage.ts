import { defaultWeekPlans } from './defaultData';
import type { AppSettings, DayPlan } from './types';

const PLAN_KEY = 'runway_command_week_plans_v1';
const CHECKED_KEY = 'runway_command_checks_v1';
const DATE_KEY = 'runway_command_last_reset_v1';
const SETTINGS_KEY = 'runway_command_settings_v1';

export const defaultSettings: AppSettings = {
  resetHour24: 4,
};

export const loadPlans = (): DayPlan[] => {
  const raw = localStorage.getItem(PLAN_KEY);
  if (!raw) return defaultWeekPlans;
  try {
    const parsed = JSON.parse(raw) as DayPlan[];
    return parsed.length ? parsed : defaultWeekPlans;
  } catch {
    return defaultWeekPlans;
  }
};

export const savePlans = (plans: DayPlan[]): void => {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plans));
};

export type CheckedState = Record<string, Record<number, boolean>>;

export const loadChecks = (): CheckedState => {
  const raw = localStorage.getItem(CHECKED_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CheckedState;
  } catch {
    return {};
  }
};

export const saveChecks = (checks: CheckedState): void => {
  localStorage.setItem(CHECKED_KEY, JSON.stringify(checks));
};

export const loadSettings = (): AppSettings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as AppSettings) };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const getLogicalDate = (resetHour24: number): string => {
  const now = new Date();
  const shifted = new Date(now);
  if (now.getHours() < resetHour24) {
    shifted.setDate(now.getDate() - 1);
  }
  return shifted.toISOString().split('T')[0];
};

export const resetChecksIfNeeded = (resetHour24: number): CheckedState => {
  const logicalDate = getLogicalDate(resetHour24);
  const storedDate = localStorage.getItem(DATE_KEY);

  if (storedDate !== logicalDate) {
    localStorage.setItem(DATE_KEY, logicalDate);
    const empty: CheckedState = {};
    saveChecks(empty);
    return empty;
  }

  return loadChecks();
};
