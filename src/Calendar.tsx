import React, {
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  addMonths,
  isSameMonth,
  differenceInCalendarMonths,
  differenceInYears,
  differenceInWeeks,
  differenceInDays,
} from "date-fns";
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
  PageInterval,
} from "./types";
import { CalendarContext } from "./context";
import { MonthPage } from "./Month";
import Animated, {
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

function getDiffFn(interval: PageInterval) {
  switch (interval) {
    case "day":
      return differenceInDays;
    case "week":
      return differenceInWeeks;
    case "year":
      return differenceInYears;
    case "month":
      return differenceInCalendarMonths;
  }
}

function Calendar(
  {
    selectedDate,
    onDateSelect,
    onPageChange,
    currentDate,
    HeaderComponent,
    DayLabelComponent,
    DayComponent,
    theme = {},
    pageBuffer = 1,
    minDate,
    maxDate,
    pageInterpolator = defaultPageInterpolator,
    simultaneousGestures,
    pageAnimCallbackNode,
    gesturesDisabled,
    animationConfig,
    weekStartsOn = 0, // Sunday is default week start
    pageInterval = "month",
  }: CalendarProps,
  ref: React.ForwardedRef<CalendarImperativeApi>
) {
  const initialDateRef = useRef(currentDate || new Date());
  const pagerRef = useRef<InfinitePagerImperativeApi>(null);
  const currentDateRef = useRef(currentDate);
  const currentPageRef = useRef(0);

  const pageCallbackNode = useSharedValue(0);

  const minPageIndex = useMemo(() => {
    if (!minDate) return -Infinity;
    const differ = getDiffFn(pageInterval);
    return differ(initialDateRef.current, minDate) * -1;
  }, [minDate, pageInterval]);

  const maxPageIndex = useMemo(() => {
    if (!maxDate) return Infinity;
    const differ = getDiffFn(pageInterval);
    return differ(initialDateRef.current, maxDate) * -1;
  }, [maxDate, pageInterval]);

  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  const fullThemeObj = {
    ...DEFAULT_THEME,
    ...theme,
  };
  const fullThemeRef = useRef(fullThemeObj);

  const fullTheme: typeof DEFAULT_THEME = useMemo(() => {
    const updatedTheme = { ...DEFAULT_THEME, ...theme };
    // If the theme object is defined inline, we only want to trigger context updates
    // if the values contained actually change.
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
      incrementPage: (options?: ImperativeApiOptions) => {
        const animated = options?.animated ?? true;
        pagerRef.current?.incrementPage({ animated });
      },
      decrementPage: (options?: ImperativeApiOptions) => {
        const animated = options?.animated ?? true;
        pagerRef.current?.decrementPage({ animated });
      },
      setMonth: (date: Date, options?: ImperativeApiOptions) => {
        const animated = options?.animated ?? false;
        const differ = getDiffFn(pageInterval);
        const page = differ(date, initialDateRef.current);
        pagerRef.current?.setPage(page, { animated });
      },
    }),
    [pageInterval]
  );

  useEffect(() => {
    // Hard set the page if the passed-in currentDate changes and the calendar isn't already displaying that month.
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

  const _onPageChange = useCallback((pg: number) => {
    currentPageRef.current = pg;
    const currentMonth = addMonths(initialDateRef.current, pg);
    currentMonth.setDate(1);
    onPageChangeRef.current?.(currentMonth);
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
      weekStartsOn,
    }),
    [
      selectedDate,
      onDateSelect,
      HeaderComponent,
      DayLabelComponent,
      DayComponent,
      fullTheme,
      pageInterpolator,
      weekStartsOn,
    ]
  );

  const pageInterpolatorInternal = useCallback(
    (params: PageInterpolatorParams) => {
      "worklet";
      return pageInterpolator(Object.assign({}, params, { theme: fullTheme }));
    },
    [fullTheme, pageInterpolator]
  );

  return (
    <CalendarContext.Provider value={providerValue}>
      <InfinitePager
        ref={pagerRef}
        PageComponent={MonthPage}
        pageBuffer={pageBuffer}
        onPageChange={_onPageChange}
        minIndex={minPageIndex}
        maxIndex={maxPageIndex}
        pageInterpolator={pageInterpolatorInternal}
        simultaneousGestures={simultaneousGestures}
        pageCallbackNode={pageAnimCallbackNode ? pageCallbackNode : undefined}
        gesturesDisabled={gesturesDisabled}
        animationConfig={animationConfig}
      />
      {pageAnimCallbackNode && (
        <AnimUpdater
          initialPageIndex={initialDateRef.current.getMonth()}
          pageAnimCallbackNode={pageAnimCallbackNode}
          pageCallbackNode={pageCallbackNode}
        />
      )}
    </CalendarContext.Provider>
  );
}

// Separate updater component so we only take the (slight) performance hit if the user provides a callback node
function AnimUpdater({
  initialPageIndex,
  pageCallbackNode,
  pageAnimCallbackNode,
}: {
  initialPageIndex: number;
  pageCallbackNode: Animated.SharedValue<number>;
  pageAnimCallbackNode: Animated.SharedValue<number>;
}) {
  useDerivedValue(() => {
    const rawVal = pageCallbackNode.value + initialPageIndex;
    let modVal = rawVal % 12;
    if (modVal < 0) {
      modVal = 12 + modVal;
    }
    pageAnimCallbackNode.value = modVal;
  }, [pageCallbackNode, initialPageIndex]);

  return null;
}

export default React.memo(React.forwardRef(Calendar));
