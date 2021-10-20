import React, { useContext } from "react";
import { defaultPageInterpolator, DEFAULT_THEME } from "./defaults";
import {
  DayComponentType,
  DayLabelComponentType,
  HeaderComponentType,
  OnDateSelect,
} from "./types";

export const CalendarContext = React.createContext({
  referenceDate: new Date(),
  selectedDate: null as Date | null | undefined,
  onDateSelect: (() => {}) as OnDateSelect,
  DayComponent: undefined as DayComponentType | undefined,
  DayLabelComponent: undefined as DayLabelComponentType | undefined,
  HeaderComponent: undefined as HeaderComponentType | undefined,
  theme: DEFAULT_THEME,
  pageInterpolator: defaultPageInterpolator,
});

export function useCalendarContext() {
  return useContext(CalendarContext);
}
