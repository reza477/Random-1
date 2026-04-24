export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface ScheduleItem {
  time: string;
  task: string;
  note?: string;
}

export interface DayPlan {
  id: string;
  dayName: Weekday;
  theme: string;
  mentor: string;
  quote: string;
  reminder: string;
  scheduleItems: ScheduleItem[];
  nightBladeOptions: string[];
  dangerWarnings: string[];
  brokenDayRules: string[];
}

export interface AppSettings {
  resetHour24: number;
}
