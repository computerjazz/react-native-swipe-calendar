import React, {
  useContext,
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import {
  addMonths,
  format,
  eachWeekOfInterval,
  eachDayOfInterval,
  addDays,
  lastDayOfMonth,
  isSameMonth,
  isSameDay,
  differenceInCalendarMonths,
} from "date-fns";
import { isEqual } from "lodash";
import InfinitePager, {
  InfinitePagerImperativeApi,
  PageInterpolatorParams,
} from "react-native-infinite-pager";

const DEFAULT_FONT_FAMILY =
  Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif";
const DEFAULT_FONT_COLOR_ACTIVE = "black";
const DEFAULT_FONT_COLOR_INACTIVE = "gray";

type TextTransform = "uppercase" | "lowercase" | "capitalize" | "none";

const DEFAULT_THEME = {
  todayIndicatorDotColor: "tomato",
  selectedDayBackgroundColor: "rgba(0, 0, 255, 0.25)",
  selectedDayFontColor: DEFAULT_FONT_COLOR_ACTIVE,

  headerFontFamily: DEFAULT_FONT_FAMILY,
  headerFontColor: DEFAULT_FONT_COLOR_ACTIVE,
  headerFontSize: 24,
  headerTextTransform: "capitalize" as TextTransform,
  headerDateFormat: "MMMM yyyy",

  dayLabelFontFamily: DEFAULT_FONT_FAMILY,
  dayLabelColor: DEFAULT_FONT_COLOR_ACTIVE,
  dayLabelFontSize: 12,
  dayLabelTextTransform: "uppercase" as TextTransform,
  dayLabelDateFormat: "EEEEEE",

  dayFontFamily: DEFAULT_FONT_FAMILY,
  dayFontColor: DEFAULT_FONT_COLOR_ACTIVE,
  dayInactiveFontColor: DEFAULT_FONT_COLOR_INACTIVE,
  daySelectedFontColor: DEFAULT_FONT_COLOR_ACTIVE,
  dayFontSize: 12,

  inactiveOpacity: 1,
};

type OnDateSelect =
  | undefined
  | ((date: Date, options: { isSelected: boolean }) => void);

export type DayComponentType = (props: {
  date: Date;
  isInDisplayedMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}) => JSX.Element | null;

export type HeaderComponentType = (props: { date: Date }) => JSX.Element | null;
export type DayLabelComponentType = (props: {
  date: Date;
}) => JSX.Element | null;

type ImperativeApiOptions = {
  animated?: boolean;
};

const CalendarContext = React.createContext({
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

export type CalendarPageInterpolatorParams = PageInterpolatorParams & {
  theme: typeof DEFAULT_THEME;
};

function defaultPageInterpolator({
  focusAnim,
  theme,
  pageWidth,
}: CalendarPageInterpolatorParams): ReturnType<typeof useAnimatedStyle> {
  "worklet";
  return {
    transform: [
      {
        translateX: interpolate(
          focusAnim.value,
          [-1, 0, 1],
          [-pageWidth.value, 0, pageWidth.value]
        ),
      },
    ],
    opacity: interpolate(
      focusAnim.value,
      [-1, 0, 1],
      [theme.inactiveOpacity, 1, theme.inactiveOpacity]
    ),
  };
}

export const MonthPage = React.memo(({ index }: { index: number }) => {
  const { referenceDate, HeaderComponent, DayLabelComponent, theme } =
    useCalendarContext();
  const firstDayOfMonth = useMemo(
    () => addMonths(referenceDate, index),
    [referenceDate, index]
  );
  firstDayOfMonth.setDate(1);
  const lastDayOfMo = useMemo(
    () => lastDayOfMonth(firstDayOfMonth),
    [firstDayOfMonth]
  );
  const headerText = format(firstDayOfMonth, theme.headerDateFormat);
  const weekStarts = useMemo(
    () =>
      eachWeekOfInterval({
        start: firstDayOfMonth,
        end: lastDayOfMo,
      }),
    [firstDayOfMonth, lastDayOfMo]
  );

  const weeks = useMemo(
    () =>
      weekStarts.map((week) => {
        return eachDayOfInterval({ start: week, end: addDays(week, 6) });
      }),
    [weekStarts]
  );

  const thisMonth = useMemo(
    () => format(firstDayOfMonth, "MM"),
    [firstDayOfMonth]
  );
  return (
    <Animated.View style={{ alignItems: "center" }}>
      {HeaderComponent ? (
        <HeaderComponent date={firstDayOfMonth} />
      ) : (
        <Text
          style={{
            fontSize: theme.headerFontSize,
            fontFamily: theme.headerFontFamily,
            color: theme.headerFontColor,
            textTransform: theme.headerTextTransform,
          }}
        >
          {headerText}
        </Text>
      )}
      <View style={styles.row}>
        <View style={styles.dayLabelRow}>
          {weeks[0].map((day) => {
            const dayLabelText = format(day, theme.dayLabelDateFormat);

            return DayLabelComponent ? (
              <DayLabelComponent date={day} />
            ) : (
              <View
                key={`day-label-${day.toISOString()}`}
                style={styles.dayLabelContainer}
              >
                <Text
                  style={{
                    color: theme.dayLabelColor,
                    fontFamily: theme.dayLabelFontFamily,
                    fontSize: theme.dayLabelFontSize,
                    textTransform: theme.dayLabelTextTransform,
                  }}
                >
                  {dayLabelText}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <Animated.View style={styles.row}>
        <Animated.View style={{ flex: 1 }}>
          {weeks.map((daysInWeek) => {
            return (
              <Animated.View
                key={`week-${daysInWeek[0]?.toISOString()}`}
                style={styles.weekContainer}
              >
                {daysInWeek.map((day) => {
                  const sameMonth = isSameMonth(day, firstDayOfMonth);
                  const dayMonth = format(day, "MM-dd");
                  const key = `day-${dayMonth}-thisMonth:${thisMonth}`;
                  return (
                    <DayWrapper
                      key={key}
                      isInDisplayedMonth={sameMonth}
                      date={day}
                    />
                  );
                })}
              </Animated.View>
            );
          })}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
});

type DayWrapperProps = {
  isInDisplayedMonth: boolean;
  date: Date;
};

const DayWrapper = React.memo(
  ({ date, isInDisplayedMonth }: DayWrapperProps) => {
    const dateRef = useRef(date);
    const memoDate = useMemo(() => {
      if (isSameDay(dateRef.current, date)) {
        return dateRef.current;
      } else {
        dateRef.current = date;
        return date;
      }
    }, [date]);

    const { selectedDate, onDateSelect, DayComponent, theme } =
      useCalendarContext();
    const isSelected = useMemo(() => {
      return !!selectedDate && isSameDay(memoDate, selectedDate);
    }, [memoDate, selectedDate]);
    const isToday = useMemo(() => isSameDay(memoDate, new Date()), [memoDate]);
    const onDateSelectRef = useRef(onDateSelect);
    onDateSelectRef.current = onDateSelect;
    const onDateSelectCb: OnDateSelect = useCallback((date, options) => {
      return onDateSelectRef.current?.(date, options);
    }, []);

    return (
      <DayItem
        date={memoDate}
        isSelected={isSelected}
        isToday={isToday}
        isInDisplayedMonth={isInDisplayedMonth}
        DayComponent={DayComponent}
        onDateSelect={onDateSelectCb}
        theme={theme}
      />
    );
  }
);

type DayProps = {
  date: Date;
  isInDisplayedMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  DayComponent?: DayComponentType;
  onDateSelect?: OnDateSelect;
  theme: typeof DEFAULT_THEME;
};

const DayItem = React.memo(
  ({
    date,
    isInDisplayedMonth,
    isSelected,
    DayComponent,
    isToday,
    onDateSelect,
    theme,
  }: DayProps) => {
    const dayText = format(date, "d");
    const deselectedColor = isInDisplayedMonth
      ? theme.dayFontColor
      : theme.dayInactiveFontColor;

    const color = isSelected ? theme.daySelectedFontColor : deselectedColor;

    if (DayComponent) {
      return (
        <DayComponent
          date={date}
          isInDisplayedMonth={isInDisplayedMonth}
          isSelected={isSelected}
          isToday={isToday}
        />
      );
    }

    const padding = 10;

    return (
      <TouchableOpacity
        onPress={() => onDateSelect?.(date, { isSelected })}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          padding,
        }}
      >
        <View
          style={{
            flex: 0,
            aspectRatio: 1,
            position: "absolute",
            top: 0,
            bottom: 0,
            backgroundColor: isSelected
              ? theme.selectedDayBackgroundColor
              : "transparent",
            borderRadius: 5,
          }}
        />
        <Text
          style={{
            color,
            fontSize: theme.dayFontSize,
            fontFamily: theme.dayFontFamily,
          }}
        >
          {dayText}
        </Text>
        <View
          style={{
            position: "absolute",
            width: 5,
            height: 5,
            bottom: padding / 2,
            borderRadius: 5,
            backgroundColor: isToday
              ? theme.todayIndicatorDotColor
              : "transparent",
          }}
        />
      </TouchableOpacity>
    );
  }
);

export type CalendarImperativeApi = {
  incrementMonth: (options?: ImperativeApiOptions) => void;
  decrementMonth: (options?: ImperativeApiOptions) => void;
  setMonth: (date: Date, options?: ImperativeApiOptions) => void;
};

type CalendarProps = {
  selectedDate?: Date | null;
  onDateSelect?: OnDateSelect;
  onMonthChange?: (date: Date) => void;
  currentDate?: Date;
  HeaderComponent?: HeaderComponentType;
  DayLabelComponent?: DayLabelComponentType;
  DayComponent?: DayComponentType;
  theme?: Partial<typeof DEFAULT_THEME>;
  monthBuffer?: number;
  minDate?: Date;
  maxDate?: Date;
  pageInterpolator?: typeof defaultPageInterpolator;
  simultaneousHandlers?: React.Ref<unknown> | React.Ref<unknown>[];
};

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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row" },
  dayLabelContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayLabelRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
});
