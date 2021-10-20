import React, {
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";
import { addMonths, isSameMonth, differenceInCalendarMonths } from "date-fns";
import { isEqual } from "lodash";
import InfinitePager, {
  InfinitePagerImperativeApi,
  PageInterpolatorParams,
} from "react-native-infinite-pager";
import { defaultPageInterpolator, DEFAULT_THEME } from "./defaults";
import {
  CalendarImperativeApi,
  CalendarProps,
  ImperativeApiOptions,
} from "./types";
import { CalendarContext } from "./context";
import { MonthPage } from "./Month";

function Calendar(
  {
    selectedDate,
    onDateSelect,
    onMonthChange,
    currentDate,
    HeaderComponent,
    DayLabelComponent,
    DayComponent,
    theme = {},
    monthBuffer = 1,
    minDate,
    maxDate,
    pageInterpolator = defaultPageInterpolator,
    simultaneousHandlers,
  }: CalendarProps,
  ref: React.ForwardedRef<CalendarImperativeApi>
) {
  const initialDateRef = useRef(currentDate || new Date());
  const pagerRef = useRef<InfinitePagerImperativeApi>(null);
  const currentDateRef = useRef(currentDate);
  const currentPageRef = useRef(0);

  const minPageIndex = useMemo(() => {
    if (!minDate) return -Infinity;
    return differenceInCalendarMonths(initialDateRef.current, minDate) * -1;
  }, [minDate]);

  const maxPageIndex = useMemo(() => {
    if (!maxDate) return Infinity;
    return differenceInCalendarMonths(initialDateRef.current, maxDate) * -1;
  }, [maxDate]);

  const onMonthChangeRef = useRef(onMonthChange);
  onMonthChangeRef.current = onMonthChange;

  const fullThemeObj = {
    ...DEFAULT_THEME,
    ...theme,
  };
  const fullThemeRef = useRef(fullThemeObj);

  const fullTheme: typeof DEFAULT_THEME = useMemo(() => {
    const updatedTheme = { ...DEFAULT_THEME, ...theme };

    if (isEqual(fullThemeRef.current, updatedTheme)) {
      return fullThemeRef.current;
    } else {
      fullThemeRef.current = updatedTheme;
      return updatedTheme;
    }
  }, [theme]);

  useImperativeHandle(
    ref,
    () => ({
      incrementMonth: (options?: ImperativeApiOptions) => {
        const animated = options?.animated ?? true;
        pagerRef.current?.incrementPage({ animated });
      },
      decrementMonth: (options?: ImperativeApiOptions) => {
        const animated = options?.animated ?? true;
        pagerRef.current?.decrementPage({ animated });
      },
      setMonth: (date: Date, options?: ImperativeApiOptions) => {
        const animated = options?.animated ?? false;
        const page = differenceInCalendarMonths(date, initialDateRef.current);
        pagerRef.current?.setPage(page, { animated });
      },
    }),
    []
  );

  useEffect(() => {
    if (
      currentDate &&
      currentDateRef.current &&
      !isSameMonth(currentDate, currentDateRef.current)
    ) {
      const page = differenceInCalendarMonths(
        currentDate,
        initialDateRef.current
      );
      if (page === currentPageRef.current) return;
      pagerRef.current?.setPage(page, { animated: false });
    }

    currentDateRef.current = currentDate;
  }, [currentDate]);

  const onPageChange = useCallback((pg: number) => {
    currentPageRef.current = pg;
    const currentMonth = addMonths(initialDateRef.current, pg);
    currentMonth.setDate(1);
    onMonthChangeRef.current?.(currentMonth);
  }, []);

  const providerValue = useMemo(
    () => ({
      referenceDate: initialDateRef.current,
      selectedDate,
      onDateSelect,
      HeaderComponent,
      DayLabelComponent,
      DayComponent,
      theme: fullTheme,
      pageInterpolator,
    }),
    [
      selectedDate,
      onDateSelect,
      HeaderComponent,
      DayLabelComponent,
      DayComponent,
      fullTheme,
      pageInterpolator,
    ]
  );

  const pageInterpolatorInternal = useCallback(
    (params: PageInterpolatorParams) => {
      "worklet";
      return pageInterpolator(Object.assign(params, { theme: fullTheme }));
    },
    [fullTheme, pageInterpolator]
  );

  return (
    <CalendarContext.Provider value={providerValue}>
      <InfinitePager
        ref={pagerRef}
        PageComponent={MonthPage}
        pageBuffer={monthBuffer}
        onPageChange={onPageChange}
        minIndex={minPageIndex}
        maxIndex={maxPageIndex}
        pageInterpolator={pageInterpolatorInternal}
        simultaneousHandlers={simultaneousHandlers}
      />
    </CalendarContext.Provider>
  );
}

export default React.memo(React.forwardRef(Calendar));
