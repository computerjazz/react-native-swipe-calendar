import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarMonths,
  differenceInDays,
  differenceInWeeks,
  isSameDay,
  isSameMonth,
  isSameWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { PageInterval, WeekDayIndex } from "./types";

export function getDiffFn(interval: PageInterval) {
  switch (interval) {
    case "day":
      return differenceInDays;
    case "week":
      return differenceInWeeks;
    case "month":
      return differenceInCalendarMonths;
  }
}

export function getIsSameFn(interval: PageInterval) {
  switch (interval) {
    case "day":
      return isSameDay;
    case "week":
      return isSameWeek;
    case "month":
      return isSameMonth;
  }
}

export function getAddFn(interval: PageInterval) {
  switch (interval) {
    case "day":
      return addDays;
    case "week":
      return addWeeks;
    case "month":
      return addMonths;
  }
}

export function getFirstDayOfInteval(
  interval: PageInterval,
  options: { weekStartsOn: WeekDayIndex } = { weekStartsOn: 0 }
) {
  switch (interval) {
    case "day":
      return (date: Date) => startOfDay(date);
    case "week":
      return (date: Date) => startOfWeek(date, options);
    case "month":
      return (date: Date) => startOfMonth(date);
  }
}

export function getHeaderDateFormat(interval: PageInterval) {
  switch (interval) {
    case "day":
      return "MMMM d, yyyy";
    case "week":
      return "MMMM yyyy";
    case "month":
      return "MMMM yyyy";
  }
}

export function getDayLabelDateFormat(interval: PageInterval) {
  switch (interval) {
    case "day":
      return "EEEE";
    case "week":
      return "EEEEEE";
    case "month":
      return "EEEEEE";
  }
}
