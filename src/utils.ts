import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarMonths,
  differenceInDays,
  differenceInWeeks,
  differenceInYears,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
} from "date-fns";
import { PageInterval } from "./types";

export function getDiffFn(interval: PageInterval) {
  switch (interval) {
    case "day":
      return differenceInDays;
    case "week":
      return differenceInWeeks;
    case "month":
      return differenceInCalendarMonths;
    case "year":
      return differenceInYears;
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
    case "year":
      return isSameYear;
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
    case "year":
      return addYears;
  }
}
