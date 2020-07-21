import {
  add,
  endOfMonth,
  endOfWeek,
  getDay,
  getDaysInMonth,
  startOfWeek,
  sub,
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  startOfToday,
  subMonths,
} from 'date-fns';
import { times } from 'lodash';
import { TDay, TDaysOfWeek, TMonth, TPeriod } from './typings';

export const isInUnavailableDates = (unavailableDates: Date[] = [], date: Date) => {
  return unavailableDates.some((_date) => isSameDay(date, _date));
};

export const periodToSeconds = (period: TPeriod) => {
  let seconds = 0;

  for (const key in period) {
    const prop = key as keyof TPeriod;
    const multiple =
      prop === 'days' ? 86400 : prop === 'hours' ? 3600 : prop === 'minutes' ? 60 : 1;

    seconds += (period[prop] ?? 0) * multiple;
  }

  return seconds;
};

export const compareDuration = (
  a: TPeriod,
  b: TPeriod,
  compareFn: (a?: number, b?: number) => boolean,
) => {
  return (
    compareFn(a.days ?? 0, b.days ?? 0) &&
    compareFn(a.hours, b.hours) &&
    compareFn(a.minutes, b.minutes) &&
    compareFn(a.seconds, b.seconds)
  );
};

export interface TPickerMonth {
  month: TMonth;
  isPadding?: boolean;
}

export function getPickerMonth(date: Date, firstDayOfWeek: TDaysOfWeek): TPickerMonth {
  const today = startOfMonth(date);
  const year = getYear(today);
  const index = getMonth(today);

  return {
    month: {
      year,
      getDays: () => getDays(index, year, firstDayOfWeek),
      isDisabled: false,
      index,
      date: today,
    },
  };
}

export interface TPickerMonthPadding {
  left?: number;
  right?: number;
}

export interface TGetPickerMonthsOptions {
  numberOfMonths: number;
  firstDayOfWeek: TDaysOfWeek;
  startDate?: Date | null;
  endDate?: Date | null;
  padding?: TPickerMonthPadding;
}

export function getPickerMonths({
  numberOfMonths,
  firstDayOfWeek,
  startDate,
  endDate,
  padding,
}: TGetPickerMonthsOptions): TPickerMonth[] {
  const start = startDate ?? startOfToday();
  const end = endDate ?? addMonths(start, numberOfMonths - 1);
  const months: TPickerMonth[] = [];

  for (let i = 0; i < numberOfMonths; i += 1) {
    // last month in month array
    if (i === numberOfMonths - 1) {
      months.push(getPickerMonth(end, firstDayOfWeek));
    } else {
      months.push(getPickerMonth(addMonths(start, i), firstDayOfWeek));
    }
  }

  return months;
}

export function getNextActiveMonth(
  activeMonth: TPickerMonth[],
  vector: number,
  firstDayOfWeek: TDaysOfWeek,
  padding?: { left: number; right: number },
): TPickerMonth[] {
  if (vector === 0) return activeMonth;

  // get the reference month, if the vector is positive (ltr), this would be
  // the last visible month otherwise (rtl) should yield the first visible month
  const referenceMonth = activeMonth[vector < 0 ? 0 : activeMonth.length - 1];
  // strip away months that are no longer in view
  const pickerMonths = activeMonth.filter((i, index) => {
    return vector > 0 ? index > vector - 1 : index < activeMonth.length - Math.abs(vector);
  });

  for (let i = 0; i < Math.abs(vector); i += 1) {
    if (vector > 0) {
      // push new entries for (ltr)
      pickerMonths.push(
        getPickerMonth(addMonths(referenceMonth.month.date, i + 1), firstDayOfWeek),
      );
    } else {
      // well, this does the opposite (rtl)
      pickerMonths.unshift(
        getPickerMonth(subMonths(referenceMonth.month.date, i + 1), firstDayOfWeek),
      );
    }
  }

  return pickerMonths;
}

export interface TValidateDatesOptions {
  start?: Date | null;
  end?: Date | null;
  isDisabled(date: Date): boolean;
  minDateRange?: Duration;
  maxDateRange?: Duration;
  fixRange?: boolean;
  minDate?: Date | null;
  maxDate?: Date | null;
}

export function validateDates({
  start,
  end,
  isDisabled,
  minDateRange,
  maxDateRange,
  minDate,
  maxDate,
}: TValidateDatesOptions) {
  let isValidDate = true;

  // is start date on or after minimum date
  if (isValidDate && minDate && start) {
    isValidDate = isAfter(start, addDays(minDate, -1));
  }

  // is start date on or before maximum date
  // if (isValidDate && maxDate && startDate) {
  //   isValidDate = isBefore(startDate, addDays(maxDate, 1));
  // }

  // is end date on or before maximum date
  if (isValidDate && end && maxDate) {
    isValidDate = isBefore(end, addDays(maxDate, 1));
  }

  // is the duration between the start and end date bounded
  // by the minimum and maximum date ranges
  if (isValidDate && end && start) {
    isValidDate = start <= end;

    if (isValidDate && minDateRange) {
      const minimumEnd = add(start, minDateRange);

      isValidDate = isSameDay(end, minimumEnd) || isAfter(end, minimumEnd);
    }

    if (isValidDate && maxDateRange) {
      const minimumEnd = add(start, maxDateRange);

      isValidDate = isSameDay(end, minimumEnd) || isBefore(end, minimumEnd);
    }
  }

  // does the selected range contain invalid or disabled dates
  if (isValidDate && end && start) {
    isValidDate = !eachDayOfInterval({
      start: start,
      end: end,
    }).some((d) => isDisabled(d));
  }

  return isValidDate;
}

export interface IsDateHoveredProps {
  startDate: Date | null;
  endDate: Date | null;
  date: Date;
  isDateBlocked(date: Date): boolean;
  hoveredDate: Date | null;
  minDateRange: number;
  fixRange: boolean;
}
export function isDateHovered({
  date,
  startDate,
  endDate,
  isDateBlocked,
  hoveredDate,
  minDateRange,
  fixRange,
}: IsDateHoveredProps) {
  if (
    // exact min booking days
    hoveredDate &&
    minDateRange > 1 &&
    fixRange &&
    isWithinInterval(date, {
      start: hoveredDate,
      end: addDays(hoveredDate, minDateRange - 1),
    })
  ) {
    return !eachDayOfInterval({
      start: hoveredDate,
      end: addDays(hoveredDate, minDateRange - 1),
    }).some((d) => isDateBlocked(d));
  } else if (
    // min booking days
    startDate &&
    !endDate &&
    hoveredDate &&
    isWithinInterval(date, {
      start: startDate,
      end: addDays(startDate, minDateRange - 1),
    }) &&
    isSameDay(startDate, hoveredDate) &&
    minDateRange > 1
  ) {
    return !eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, minDateRange - 1),
    }).some((d) => isDateBlocked(d));
  } else if (
    // normal
    startDate &&
    !endDate &&
    hoveredDate &&
    !isBefore(hoveredDate, startDate) &&
    isWithinInterval(date, { start: startDate, end: hoveredDate })
  ) {
    return !eachDayOfInterval({ start: startDate, end: hoveredDate }).some((d) =>
      isDateBlocked(d),
    );
  }

  return false;
}

export interface GetWeekdayLabelsProps {
  firstDayOfWeek?: TDaysOfWeek;
  getWeekDayLabel?: (dayIndex: TDaysOfWeek) => string;
}

export function getWeekdayLabels({ firstDayOfWeek = 1, getWeekDayLabel }: GetWeekdayLabelsProps) {
  const now = new Date();
  const daysOfWeek = eachDayOfInterval({
    start: addDays(startOfWeek(now), firstDayOfWeek),
    end: addDays(endOfWeek(now), firstDayOfWeek),
  });

  return daysOfWeek.map((date) => {
    if (getWeekDayLabel) {
      return getWeekDayLabel(date.getDay() as TDaysOfWeek);
    }

    return format(date, 'iiiiii');
  });
}

export const getDays = (monthIndex: number, year: number, firstDayOfWeek: TDaysOfWeek) => {
  const monthDate = new Date(year, monthIndex);
  const monthEnd = endOfMonth(monthDate);
  const monthStart = startOfMonth(monthDate);
  const monthStartDay = getDay(monthStart) as TDaysOfWeek;
  const daysInMonth = getDaysInMonth(monthDate);
  const leftPadding =
    firstDayOfWeek === monthStartDay
      ? 7
      : firstDayOfWeek > monthStartDay
      ? monthStartDay + firstDayOfWeek + 1
      : monthStartDay - firstDayOfWeek;
  const startDate = sub(monthStart, { days: leftPadding });

  const days = times<TDay>(42, (index) => {
    const isPadding = index < leftPadding || index > leftPadding + daysInMonth - 1;
    const day = add(startDate, { days: index });

    return {
      isPadding,
      day,
      isDisabled: false,
    };
  });

  return days;
};

export const getMonths = (year: number, firstDayOfWeek: TDaysOfWeek) => {
  const months = times<TMonth>(12, (index) => {
    const getDaysInMonth = () => getDays(index, year, firstDayOfWeek);

    return {
      index,
      isDisabled: false,
      getDays: getDaysInMonth,
      year,
      date: new Date(year, index),
    };
  });

  return months;
};
