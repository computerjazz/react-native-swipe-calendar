import React, {
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";
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
import {
  getAddFn,
  getDayLabelDateFormat,
  getDiffFn,
  getHeaderDateFormat,
  getIsSameFn,
} from "./utils";
import { WeekPage } from "./Week";
import { DayPage } from "./Day";

function getPageComponent(interval: PageInterval) {
  switch (interval) {
    case "day":
      return DayPage;
    case "week":
      return WeekPage;
    case "month":
      return MonthPage;
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
    dayLabelDateFormat: getDayLabelDateFormat(pageInterval),
    headerDateFormat: getHeaderDateFormat(pageInterval),
    ...theme,
  };
  const fullThemeRef = useRef(fullThemeObj);

  const fullTheme: typeof DEFAULT_THEME = useMemo(() => {
    const updatedTheme = { ...fullThemeRef.current, ...theme };
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
      setPage: (date: Date, options?: ImperativeApiOptions) => {
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

    const isSameFn = getIsSameFn(pageInterval);
    const diffFn = getDiffFn(pageInterval);
    if (
      currentDate &&
      currentDateRef.current &&
      !isSameFn(currentDate, currentDateRef.current)
    ) {
      const page = diffFn(currentDate, initialDateRef.current);
      if (page === currentPageRef.current) return;
      pagerRef.current?.setPage(page, { animated: false });
    }

    currentDateRef.current = currentDate;
  }, [currentDate, pageInterval]);

  const _onPageChange = useCallback(
    (pg: number) => {
      currentPageRef.current = pg;
      const addFn = getAddFn(pageInterval);
      const dateWithOffset = addFn(initialDateRef.current, pg);
      dateWithOffset.setDate(1);
      onPageChangeRef.current?.(dateWithOffset);
    },
    [pageInterval]
  );

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
        PageComponent={getPageComponent(pageInterval)}
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
          pageInterval={pageInterval}
          initialDateRef={initialDateRef}
          pageAnimCallbackNode={pageAnimCallbackNode}
          pageCallbackNode={pageCallbackNode}
        />
      )}
    </CalendarContext.Provider>
  );
}

// Separate updater component so we only take the (slight) performance hit if the user provides a callback node
function AnimUpdater({
  initialDateRef,
  pageCallbackNode,
  pageAnimCallbackNode,
  pageInterval,
}: {
  initialDateRef: React.MutableRefObject<Date>;
  pageCallbackNode: Animated.SharedValue<number>;
  pageAnimCallbackNode: Animated.SharedValue<number>;
  pageInterval: PageInterval;
}) {
  const initialPageIndex = initialDateRef.current.getMonth();

  useDerivedValue(() => {
    function getMultiplier() {
      // FIXME: not totally correct for day/week view
      switch (pageInterval) {
        case "week":
          return 1 / (365 / 12 / 7);
        case "day":
          return 1 / (365 / 12);
        case "month":
          return 1;
      }
    }

    const multiplier = getMultiplier();
    const rawVal = pageCallbackNode.value * multiplier + initialPageIndex;
    let modVal = rawVal % 12;
    if (modVal < 0) {
      modVal = 12 + modVal;
    }
    pageAnimCallbackNode.value = modVal;
  }, [pageCallbackNode, initialPageIndex, pageInterval]);

  return null;
}

export default React.memo(React.forwardRef(Calendar));
