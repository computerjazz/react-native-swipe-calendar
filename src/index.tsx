import React, {
  useContext,
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
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
} from "react-native-infinite-pager";

const DEFAULT_THEME = {
  textActiveColor: "black",
  textInactiveColor: "grey",
  todayIndicatorDotColor: "tomato",
  selectedDayBackgroundColor: "rgba(0, 0, 255, 0.25)",
  fontFamily: "sans-serif",
  dayFontSize: 12,
  dayLabelFormat: "EEEEEE",
  headerDateFormat: "MMMM yyyy",
  headerFontSize: 24,
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

export type TitleComponentType = (props: { date: Date }) => JSX.Element | null;

type ImperativeApiOptions = {
  animated?: boolean;
};

const CalendarContext = React.createContext({
  referenceDate: new Date(),
  selectedDate: null as Date | null | undefined,
  onDateSelect: (() => {}) as OnDateSelect,
  DayComponent: undefined as DayComponentType | undefined,
  TitleComponent: undefined as TitleComponentType | undefined,
  theme: DEFAULT_THEME,
});

export function useCalendarContext() {
  return useContext(CalendarContext);
}

export const MonthPage = React.memo(
  ({
    index,
    focusAnim,
  }: {
    index: number;
    focusAnim: Animated.DerivedValue<number>;
  }) => {
    const { referenceDate, TitleComponent, theme } = useCalendarContext();
    const firstDayOfMonth = useMemo(
      () => addMonths(referenceDate, index),
      [referenceDate, index]
    );
    firstDayOfMonth.setDate(1);
    const lastDayOfMo = useMemo(
      () => lastDayOfMonth(firstDayOfMonth),
      [firstDayOfMonth]
    );
    const title = format(firstDayOfMonth, theme.headerDateFormat);
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

    const animStyle = useAnimatedStyle(() => {
      const opacity =
        theme.inactiveOpacity === 1
          ? 1
          : interpolate(
              focusAnim.value,
              [-1, 0, 1],
              [theme.inactiveOpacity, 1, theme.inactiveOpacity],
              Animated.Extrapolate.CLAMP
            );
      return {
        opacity,
      };
    }, [focusAnim]);
    const thisMonth = useMemo(
      () => format(firstDayOfMonth, "MM"),
      [firstDayOfMonth]
    );
    return (
      <Animated.View style={[animStyle, { alignItems: "center" }]}>
        {TitleComponent ? (
          <TitleComponent date={firstDayOfMonth} />
        ) : (
          <Text
            style={{
              fontSize: theme.headerFontSize,
              color: theme.textActiveColor,
            }}
          >
            {title}
          </Text>
        )}
        <View style={styles.row}>
          <View style={styles.dayLabelRow}>
            {weeks[0].map((day) => {
              const dayLabel = format(day, theme.dayLabelFormat);
              return (
                <View style={styles.dayLabelContainer}>
                  <Text style={{ color: theme.textActiveColor }}>
                    {dayLabel}
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
                <Animated.View style={styles.weekContainer}>
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
  }
);

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
    const color = isInDisplayedMonth
      ? theme.textActiveColor
      : theme.textInactiveColor;
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

    return (
      <TouchableOpacity
        onPress={() => onDateSelect?.(date, { isSelected })}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 5,
          backgroundColor: isSelected
            ? theme.selectedDayBackgroundColor
            : "transparent",
          borderRadius: 5,
        }}
      >
        <Text style={{ color }}>{dayText}</Text>
        <View
          style={{
            width: 5,
            height: 5,
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
  incrementMonth: () => void;
  decrementMonth: () => void;
  setMonth: (date: Date) => void;
};

type CalendarProps = {
  selectedDate?: Date | null;
  onDateSelect?: OnDateSelect;
  onMonthChange?: (date: Date) => void;
  currentDate?: Date;
  DayComponent?: DayComponentType;
  TitleComponent?: (props: { date: Date }) => JSX.Element | null;
  theme?: Partial<typeof DEFAULT_THEME>;
  monthBuffer?: number;
};

function Calendar(
  {
    selectedDate,
    onDateSelect,
    onMonthChange,
    currentDate,
    DayComponent,
    TitleComponent,
    theme = {},
    monthBuffer = 1,
  }: CalendarProps,
  ref: React.ForwardedRef<CalendarImperativeApi>
) {
  const initialDateRef = useRef(currentDate || new Date());
  const pagerRef = useRef<InfinitePagerImperativeApi>(null);
  const currentDateRef = useRef(currentDate);
  const currentPageRef = useRef(0);

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
      DayComponent,
      TitleComponent,
      theme: fullTheme,
    }),
    [selectedDate, onDateSelect, DayComponent, TitleComponent, fullTheme]
  );

  return (
    <CalendarContext.Provider value={providerValue}>
      <InfinitePager
        ref={pagerRef}
        PageComponent={MonthPage}
        pageBuffer={monthBuffer}
        onPageChange={onPageChange}
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
