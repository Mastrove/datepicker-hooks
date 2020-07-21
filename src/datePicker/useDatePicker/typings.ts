import { Interval } from 'date-fns';

export type TDaysOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TPeriod {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface TDay {
  day: Date;
  isPadding: boolean;
  isDisabled: boolean;
}

export interface TMonth {
  getDays: () => TDay[];
  isDisabled: boolean;
  year: number;
  index: number;
  date: Date;
}

export interface TYear {
  getMonths: () => TMonth[];
  year: number;
  isPadded: boolean;
  isDisabled: boolean;
}

export interface TPotentialRange {
  range: Interval;
  error: {
    reason: string;
  } | null;
}

export interface THoveredDate {
  date: Date;
  error: {
    reason: string;
  } | null;
}
